// PATHPILOT — PHASE B UNIFIED STUDENT DATA SYNCHRONIZATION SUITE
// Directive: PP-PHASE-B-DATA-SYNC
// Runs strictly against an isolated temporary SQLite database; never modifies pathpilot.db.

import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const isolatedDbPath = path.join(
  os.tmpdir(),
  `pathpilot-phase-b-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.db`
);
process.env.DATABASE_URL = `file:${isolatedDbPath}`;
process.env.NODE_ENV = 'test';

let app: any;
let prisma: any;
let dbManager: any;
let env: any;
let geminiAIService: any;

interface CapturedGeminiCall {
  config?: { systemInstruction?: string };
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
}

async function applySqlFile(sqlPath: string): Promise<void> {
  const sql = fs.readFileSync(sqlPath, 'utf8');
  const cleaned = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = cleaned
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await prisma.$executeRawUnsafe(stmt);
  }
}

describe('Phase B — Unified Student Data Synchronization & Ownership', () => {
  const capturedCalls: CapturedGeminiCall[] = [];
  let generateContentMock: ReturnType<typeof vi.fn>;

  let studentAId = '';
  let studentBId = '';
  let studentAToken = '';
  let studentBToken = '';
  let mentorToken = '';

  const signToken = (user: { id: string; email: string; role: string }) =>
    jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: '1h' });

  beforeAll(async () => {
    ({ app } = await import('../../src/app.js'));
    ({ prisma, dbManager } = await import('../../src/config/database.js'));
    ({ env } = await import('../../src/config/env.js'));
    ({ geminiAIService } = await import('../../src/modules/ai/ai.service.js'));

    await dbManager.connect();

    const dbList: Array<{ name: string; file: string }> = await prisma.$queryRawUnsafe('PRAGMA database_list');
    const mainFile = dbList.find((d) => d.name === 'main')?.file || '';
    expect(mainFile).not.toContain('pathpilot.db');
    expect(mainFile).toContain('pathpilot-phase-b-');
    console.log(`[phaseBDataSync] Isolated Prisma SQLite DB: ${mainFile}`);

    const migrationsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../prisma/migrations');
    await applySqlFile(path.join(migrationsRoot, '0001_init/migration.sql'));
    await applySqlFile(path.join(migrationsRoot, '0002_partial_unique_active_booking/migration.sql'));
    await applySqlFile(path.join(migrationsRoot, '0003_phase_b_student_sync/migration.sql'));

    // Seed all 6 canonical careers with active templates matching seed.ts structure
    const seededCareers = [
      {
        slug: 'ai-ml-engineer',
        title: 'AI / Machine Learning Engineer',
        category: 'Engineering',
        salaryRange: '$145,000 - $210,000',
        growthRate: '+31% (Very High)',
        description: 'Design and deploy deep learning models.',
        phases: [
          { id: 'phase-1', number: '01', title: 'Mathematical Foundations & Deep Python', goal: 'Vector calculus & Python.' },
          { id: 'phase-2', number: '02', title: 'Deep Learning & Neural Architectures', goal: 'Build Transformers & PyTorch models.' }
        ]
      },
      {
        slug: 'product-manager',
        title: 'Product Manager',
        category: 'Product & Data',
        salaryRange: '$120,000 - $175,000',
        growthRate: '+10% (High)',
        description: 'Lead cross-functional product execution.',
        phases: [
          { id: 'phase-1', number: '01', title: 'Product Discovery & Market Research', goal: 'Discovery & cohort SQL.' },
          { id: 'phase-2', number: '02', title: 'Technical PRDs & Data Analytics', goal: 'Author PRDs & telemetry specs.' }
        ]
      },
      {
        slug: 'data-analyst',
        title: 'Data Analyst / BI Engineer',
        category: 'Product & Data',
        salaryRange: '$85,000 - $130,000',
        growthRate: '+14% (High)',
        description: 'Translate complex datasets into executive insights.',
        phases: [{ id: 'phase-1', number: '01', title: 'SQL Analytics & Relational Modeling', goal: 'Window functions & CTEs.' }]
      }
    ];

    for (const c of seededCareers) {
      const career = await prisma.career.create({
        data: {
          slug: c.slug,
          title: c.title,
          category: c.category,
          salaryRange: c.salaryRange,
          growthRate: c.growthRate,
          description: c.description
        }
      });
      await prisma.roadmapTemplate.create({
        data: {
          careerId: career.id,
          version: '1.0.0',
          isActive: true,
          phasesJson: JSON.stringify(c.phases)
        }
      });
    }

    const passwordHash = await bcrypt.hash('Student123!', 10);

    const studentA = await prisma.user.create({
      data: {
        email: 'alex.phaseb@test.io',
        passwordHash,
        role: 'STUDENT',
        profile: {
          create: {
            firstName: 'Alex',
            lastName: 'Rivera',
            targetGoal: 'AI / Machine Learning Engineer',
            educationLevel: 'Junior Developer',
            onboardingCompleted: true,
            streakDays: 5,
            weeklyTargetHours: 12,
            completedHoursThisWeek: 6
          }
        },
        skillProfile: {
          create: {
            skillsJson: JSON.stringify({
              Python: 78,
              PyTorch: 52,
              SQL: 65,
              Docker: 35
            })
          }
        },
        progress: {
          create: {
            careerSlug: 'ai-ml-engineer',
            currentPhaseId: 'phase-2',
            completedPhases: JSON.stringify(['phase-1']),
            completedTasks: JSON.stringify(['task-1-1', 'task-1-2'])
          }
        }
      }
    });
    studentAId = studentA.id;
    studentAToken = signToken(studentA);

    const studentB = await prisma.user.create({
      data: {
        email: 'dana.phaseb@test.io',
        passwordHash,
        role: 'STUDENT',
        profile: {
          create: {
            firstName: 'Dana',
            lastName: 'Kim',
            targetGoal: 'Data Analyst / BI Engineer',
            educationLevel: 'Career Switcher',
            onboardingCompleted: true,
            streakDays: 2,
            weeklyTargetHours: 8,
            completedHoursThisWeek: 2.5
          }
        }
      }
    });
    studentBId = studentB.id;
    studentBToken = signToken(studentB);

    const mentorUser = await prisma.user.create({
      data: { email: 'mentor.phaseb@test.io', passwordHash, role: 'MENTOR' }
    });
    mentorToken = signToken(mentorUser);
  }, 30000);

  beforeEach(() => {
    capturedCalls.length = 0;
    generateContentMock = vi.fn(async (params: CapturedGeminiCall) => {
      capturedCalls.push(params);
      return { text: 'DB-synchronized AI Mentor confirmation response.' };
    });
    (geminiAIService as any).client = {
      models: { generateContent: generateContentMock }
    };
  });

  afterAll(async () => {
    await dbManager.disconnect();
    for (const suffix of ['', '-journal', '-wal', '-shm']) {
      const f = `${isolatedDbPath}${suffix}`;
      if (fs.existsSync(f)) {
        try {
          fs.unlinkSync(f);
        } catch {
          // Ignore Windows temp file lock handles
        }
      }
    }
  });

  it('B1/B6: authenticates, updates profile fields, and persists across logout and re-login', async () => {
    const patchRes = await request(app)
      .patch('/api/v1/student/profile')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({
        firstName: 'Alexander',
        lastName: 'Rivera-Cruz',
        educationLevel: 'Senior Professional',
        weeklyTargetHours: 16,
        completedHoursThisWeek: 9.5,
        interests: ['AI & Machine Learning', 'Systems Design'],
        strengths: ['Python', 'SQL Analytics'],
        onboardingCompleted: true
      });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.data.profile.firstName).toBe('Alexander');
    expect(patchRes.body.data.profile.lastName).toBe('Rivera-Cruz');
    expect(patchRes.body.data.profile.weeklyTargetHours).toBe(16);
    expect(patchRes.body.data.profile.completedHoursThisWeek).toBe(9.5);
    expect(patchRes.body.data.profile.interests).toEqual(['AI & Machine Learning', 'Systems Design']);

    // Simulate logout -> fresh login -> /auth/me & /student/state reload
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'alex.phaseb@test.io', password: 'Student123!' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.id).toBe(studentAId);
    const freshToken = loginRes.body.data.token;

    const stateRes = await request(app)
      .get('/api/v1/student/state')
      .set('Authorization', `Bearer ${freshToken}`);
    expect(stateRes.status).toBe(200);
    expect(stateRes.body.data.profile.firstName).toBe('Alexander');
    expect(stateRes.body.data.profile.lastName).toBe('Rivera-Cruz');
    expect(stateRes.body.data.profile.educationLevel).toBe('Senior Professional');
    expect(stateRes.body.data.profile.interests).toEqual(['AI & Machine Learning', 'Systems Design']);
  });

  it('B1/B6: prevents cross-user data access, rejects MENTOR/unauthenticated callers, and isolates Student B', async () => {
    const unauthRes = await request(app).get('/api/v1/student/state');
    expect(unauthRes.status).toBe(401);

    const mentorRes = await request(app)
      .get('/api/v1/student/state')
      .set('Authorization', `Bearer ${mentorToken}`);
    expect(mentorRes.status).toBe(403);

    const crossParamRead = await request(app)
      .get(`/api/v1/student/profile/${studentBId}`)
      .set('Authorization', `Bearer ${studentAToken}`);
    expect(crossParamRead.status).toBe(403);

    const crossBodyPatch = await request(app)
      .patch('/api/v1/student/profile')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ userId: studentBId, firstName: 'Hijacked' });
    expect(crossBodyPatch.status).toBe(403);

    const studentBState = await request(app)
      .get('/api/v1/student/state')
      .set('Authorization', `Bearer ${studentBToken}`);
    expect(studentBState.status).toBe(200);
    expect(studentBState.body.data.profile.firstName).toBe('Dana');
    expect(studentBState.body.data.profile.targetGoal).toBe('Data Analyst / BI Engineer');
    // Zero skill scores fabricated when Student B has none
    expect(studentBState.body.data.skills).toEqual([]);
    expect(studentBState.body.data.skillGaps.assessedCount).toBe(0);
    expect(studentBState.body.data.skillGaps.items.every((i: any) => i.currentScore === null && i.classification === 'UNASSESSED')).toBe(true);
  });

  it('B3: enforces strict skill classification thresholds (70-100 VERIFIED, 40-69 DEVELOPING, 0-39 WEAK) and preserves missing skills as UNASSESSED', async () => {
    const res = await request(app)
      .put('/api/v1/student/skills')
      .set('Authorization', `Bearer ${studentBToken}`)
      .send({
        skills: [
          { name: 'SQL', score: 70, careerSlug: 'data-analyst' },
          { name: 'Statistics', score: 69, careerSlug: 'data-analyst' },
          { name: 'Python', score: 40, careerSlug: 'data-analyst' },
          { name: 'Tableau', score: 39, careerSlug: 'data-analyst' }
        ]
      });

    expect(res.status).toBe(200);
    const byKey = new Map(res.body.data.skills.map((s: any) => [s.name, s]));
    expect((byKey.get('SQL') as any).classification).toBe('VERIFIED');
    expect((byKey.get('SQL') as any).updatedAt).toBeDefined();
    expect((byKey.get('Statistics') as any).classification).toBe('DEVELOPING');
    expect((byKey.get('Python') as any).classification).toBe('DEVELOPING');
    expect((byKey.get('Tableau') as any).classification).toBe('WEAK');

    // Communication was never assessed -> must remain null / UNASSESSED
    const commGap = res.body.data.skillGaps.items.find((i: any) => i.skill === 'Communication');
    expect(commGap.currentScore).toBeNull();
    expect(commGap.classification).toBe('UNASSESSED');
    expect(commGap.gap).toBeNull();

    // Validation rejects out-of-range skill score
    const badScoreRes = await request(app)
      .put('/api/v1/student/skills')
      .set('Authorization', `Bearer ${studentBToken}`)
      .send({ skills: [{ name: 'SQL', score: 120 }] });
    expect(badScoreRes.status).toBe(400);
  });

  it('B2/B4: switches target career goal, preserves historical roadmap progress, and saves bookmarks & milestones', async () => {
    // Bookmark a career
    const saveRes = await request(app)
      .put('/api/v1/student/saved-careers')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ toggleCareerSlug: 'product-manager' });
    expect(saveRes.status).toBe(200);
    expect(saveRes.body.data.profile.savedCareers).toContain('product-manager');

    // Switch Student A to Product Manager
    const switchToPm = await request(app)
      .put('/api/v1/student/career-goal')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ targetCareer: 'Product Manager' });

    expect(switchToPm.status).toBe(200);
    expect(switchToPm.body.data.profile.targetGoal).toBe('Product Manager');
    expect(switchToPm.body.data.skillGaps.careerSlug).toBe('product-manager');
    expect(switchToPm.body.data.activeRoadmap.careerSlug).toBe('product-manager');
    expect(switchToPm.body.data.activeRoadmap.currentPhaseId).toBe('phase-1');

    // Complete first PM milestone & advance
    const pmMilestone = await request(app)
      .put('/api/v1/student/roadmap')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ toggleTaskId: 'pm-1-1', completed: true });
    expect(pmMilestone.status).toBe(200);
    expect(pmMilestone.body.data.activeRoadmap.completedTasks).toContain('pm-1-1');
    expect(pmMilestone.body.data.activeRoadmap.progressPercent).toBeGreaterThan(0);

    // Complete Phase 1 -> advances active phase to phase-2
    const pmPhaseDone = await request(app)
      .put('/api/v1/student/roadmap')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ completePhaseId: 'phase-1' });
    expect(pmPhaseDone.status).toBe(200);
    expect(pmPhaseDone.body.data.activeRoadmap.completedPhases).toContain('phase-1');
    expect(pmPhaseDone.body.data.activeRoadmap.currentPhaseId).toBe('phase-2');

    // Switch back to AI / Machine Learning Engineer -> historical progress preserved!
    const switchBack = await request(app)
      .put('/api/v1/student/career-goal')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ targetCareer: 'ai-ml-engineer' });
    expect(switchBack.status).toBe(200);
    expect(switchBack.body.data.activeRoadmap.completedTasks).toEqual(['task-1-1', 'task-1-2']);
    expect(switchBack.body.data.activeRoadmap.currentPhaseId).toBe('phase-2');

    const pmHistory = switchBack.body.data.roadmapsByCareer.find((r: any) => r.careerSlug === 'product-manager');
    expect(pmHistory).toBeDefined();
    expect(pmHistory.completedPhases).toContain('phase-1');
    expect(pmHistory.currentPhaseId).toBe('phase-2');

    // Reject unknown career or unknown task ID
    const invalidGoal = await request(app)
      .put('/api/v1/student/career-goal')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ targetCareer: 'Underwater Basket Weaver' });
    expect(invalidGoal.status).toBe(400);

    const invalidTask = await request(app)
      .put('/api/v1/student/roadmap')
      .set('Authorization', `Bearer ${studentAToken}`)
      .send({ toggleTaskId: 'nonexistent-task-id', completed: true });
    expect(invalidTask.status).toBe(400);
  });

  it('B6: propagates updated career goal, skill scores, and roadmap phase directly into AI Mentor prompt context', async () => {
    // Student B updates career goal & skills & starts roadmap
    await request(app)
      .put('/api/v1/student/career-goal')
      .set('Authorization', `Bearer ${studentBToken}`)
      .send({ targetCareer: 'Product Manager' });

    await request(app)
      .put('/api/v1/student/skills')
      .set('Authorization', `Bearer ${studentBToken}`)
      .send({
        skills: [
          { name: 'Strategy', score: 88, careerSlug: 'product-manager' },
          { name: 'SQL', score: 24, careerSlug: 'product-manager' }
        ]
      });

    await request(app)
      .put('/api/v1/student/roadmap')
      .set('Authorization', `Bearer ${studentBToken}`)
      .send({ completePhaseId: 'phase-1' });

    const aiRes = await request(app)
      .post('/api/v1/ai/mentor/message')
      .set('Authorization', `Bearer ${studentBToken}`)
      .send({ message: 'What should I study next?' });

    expect(aiRes.status).toBe(200);
    expect(capturedCalls).toHaveLength(1);
    const sys = capturedCalls[0].config?.systemInstruction || '';
    expect(sys).toContain('Student Name: Dana Kim');
    expect(sys).toContain('Target Career Goal: Product Manager');
    expect(sys).toContain('Strategy (88/100)');
    expect(sys).toContain('SQL (24/100)');
    expect(sys).toContain('Current Roadmap Phase: Phase 2: Technical PRDs & Data Analytics');
    expect(sys).not.toContain('Monica');
  });

  it('B3/B6: registering a brand-new student account creates zero fabricated skills or fake default career goal', async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Sam Patel',
        email: 'sam.fresh@test.io',
        password: 'FreshPass123!'
      });

    expect(regRes.status).toBe(201);
    const samToken = regRes.body.data.token;

    const samState = await request(app)
      .get('/api/v1/student/state')
      .set('Authorization', `Bearer ${samToken}`);
    expect(samState.status).toBe(200);
    expect(samState.body.data.profile.firstName).toBe('Sam');
    expect(samState.body.data.profile.targetGoal).toBeNull();
    expect(samState.body.data.skills).toEqual([]);
    expect(samState.body.data.activeRoadmap).toBeNull();
  });
});
