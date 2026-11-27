// PATHPILOT — PHASE A AI CONTEXT ACCURACY & AUTH HARDENING SUITE
// Directive: PP-AI-PHASE-A-EXEC-2026-01
// Runs strictly against an isolated temporary SQLite database; never modifies pathpilot.db.

import { vi, describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';

const isolatedDbPath = path.join(os.tmpdir(), `pathpilot-ai-phase-a-${process.pid}-${Date.now()}.db`);
process.env.DATABASE_URL = `file:${isolatedDbPath}`;
process.env.NODE_ENV = 'test';

let app: any;
let prisma: any;
let dbManager: any;
let env: any;
let geminiAIService: any;
let optionalAuth: any;

interface CapturedGeminiCall {
  model: string;
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

describe('Phase A — AI Mentor DB-Grounded Context & Auth Hardening', () => {
  const capturedCalls: CapturedGeminiCall[] = [];
  let generateContentMock: ReturnType<typeof vi.fn>;

  let daToken = '';
  let aimlToken = '';
  let nullGoalToken = '';
  let noSkillsToken = '';
  let sql25Token = '';
  let sql65Token = '';
  let sql90Token = '';
  let phase3Token = '';
  let noRoadmapTemplateExistsToken = '';
  let mentorToken = '';
  let adminToken = '';
  let expiredStudentToken = '';

  const signToken = (user: { id: string; email: string; role: string }, expiresIn: string | number = '1h') =>
    jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.JWT_SECRET, { expiresIn: expiresIn as any });

  beforeAll(async () => {
    ({ app } = await import('../../src/app.js'));
    ({ prisma, dbManager } = await import('../../src/config/database.js'));
    ({ env } = await import('../../src/config/env.js'));
    ({ geminiAIService } = await import('../../src/modules/ai/ai.service.js'));
    ({ optionalAuth } = await import('../../src/middleware/auth.js'));

    await dbManager.connect();

    // Safety assertion: guarantee isolated database is used, never demo pathpilot.db
    const dbList: Array<{ name: string; file: string }> = await prisma.$queryRawUnsafe('PRAGMA database_list');
    const mainFile = dbList.find((d) => d.name === 'main')?.file || '';
    expect(mainFile).not.toContain('pathpilot.db');
    expect(mainFile).toContain('pathpilot-ai-phase-a-');
    console.log(`[aiMentorContext] Isolated Prisma SQLite DB: ${mainFile}`);

    const migrationsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../prisma/migrations');
    await applySqlFile(path.join(migrationsRoot, '0001_init/migration.sql'));
    await applySqlFile(path.join(migrationsRoot, '0002_partial_unique_active_booking/migration.sql'));
    await applySqlFile(path.join(migrationsRoot, '0003_phase_b_student_sync/migration.sql'));

    // Seed Career + RoadmapTemplate to prove template existence does NOT imply user progress
    const daCareer = await prisma.career.create({
      data: {
        slug: 'data-analyst',
        title: 'Data Analyst / BI Engineer',
        category: 'Product & Data',
        salaryRange: '$85,000 - $130,000',
        growthRate: '+14%',
        description: 'Translate complex datasets into executive insights.'
      }
    });

    await prisma.roadmapTemplate.create({
      data: {
        careerId: daCareer.id,
        version: '1.0.0',
        isActive: true,
        phasesJson: JSON.stringify([
          { id: 'phase-1', title: 'SQL Foundations' },
          { id: 'phase-2', title: 'BI & Experimentation' },
          { id: 'phase-3', title: 'Executive Analytics & Forecasting' }
        ])
      }
    });

    const passwordHash = await bcrypt.hash('TestPass123!', 10);

    const createStudent = async (opts: {
      email: string;
      firstName: string;
      lastName: string;
      targetGoal: string | null;
      skills?: Record<string, number> | null;
      progress?: { careerSlug: string; currentPhaseId: string } | null;
    }) => {
      return prisma.user.create({
        data: {
          email: opts.email,
          passwordHash,
          role: 'STUDENT',
          profile: {
            create: {
              firstName: opts.firstName,
              lastName: opts.lastName,
              targetGoal: opts.targetGoal,
              onboardingCompleted: Boolean(opts.targetGoal)
            }
          },
          ...(opts.skills
            ? {
                skillProfile: {
                  create: { skillsJson: JSON.stringify(opts.skills) }
                }
              }
            : {}),
          ...(opts.progress
            ? {
                progress: {
                  create: {
                    careerSlug: opts.progress.careerSlug,
                    currentPhaseId: opts.progress.currentPhaseId,
                    completedTasks: '[]'
                  }
                }
              }
            : {})
        }
      });
    };

    const uDa = await createStudent({
      email: 'da@isolated.test',
      firstName: 'Dana',
      lastName: 'Chen',
      targetGoal: 'Data Analyst',
      skills: { SQL: 78, Tableau: 58, Statistics: 32 },
      progress: { careerSlug: 'data-analyst', currentPhaseId: 'phase-2' }
    });
    daToken = signToken(uDa);

    const uAiml = await createStudent({
      email: 'aiml@isolated.test',
      firstName: 'Jordan',
      lastName: 'Patel',
      targetGoal: 'AI / Machine Learning Engineer',
      skills: { Python: 84, PyTorch: 55, MLOps: 28 },
      progress: { careerSlug: 'ai-ml-engineer', currentPhaseId: 'phase-2' }
    });
    aimlToken = signToken(uAiml);

    const uNullGoal = await createStudent({
      email: 'nullgoal@isolated.test',
      firstName: 'Casey',
      lastName: 'Ng',
      targetGoal: null,
      skills: null,
      progress: null
    });
    nullGoalToken = signToken(uNullGoal);

    const uNoSkills = await createStudent({
      email: 'noskills@isolated.test',
      firstName: 'Morgan',
      lastName: 'Lee',
      targetGoal: 'Data Analyst',
      skills: null,
      progress: null
    });
    noSkillsToken = signToken(uNoSkills);

    const uSql25 = await createStudent({
      email: 'sql25@isolated.test',
      firstName: 'Riley',
      lastName: 'Kim',
      targetGoal: 'Data Analyst',
      skills: { SQL: 25, Excel: 82 }
    });
    sql25Token = signToken(uSql25);

    const uSql65 = await createStudent({
      email: 'sql65@isolated.test',
      firstName: 'Taylor',
      lastName: 'Brooks',
      targetGoal: 'Data Analyst',
      skills: { SQL: 65, Excel: 80 }
    });
    sql65Token = signToken(uSql65);

    const uSql90 = await createStudent({
      email: 'sql90@isolated.test',
      firstName: 'Sora',
      lastName: 'Tanaka',
      targetGoal: 'Data Analyst',
      skills: { SQL: 90, Statistics: 85 }
    });
    sql90Token = signToken(uSql90);

    const uPhase3 = await createStudent({
      email: 'phase3@isolated.test',
      firstName: 'Elena',
      lastName: 'Diaz',
      targetGoal: 'Data Analyst',
      skills: { SQL: 88 },
      progress: { careerSlug: 'data-analyst', currentPhaseId: 'phase-3' }
    });
    phase3Token = signToken(uPhase3);

    // Template exists for 'data-analyst', but student has zero rows in roadmap_progress
    noRoadmapTemplateExistsToken = noSkillsToken;

    const uMentor = await prisma.user.create({
      data: { email: 'mentor@isolated.test', passwordHash, role: 'MENTOR' }
    });
    mentorToken = signToken(uMentor);

    const uAdmin = await prisma.user.create({
      data: { email: 'admin@isolated.test', passwordHash, role: 'ADMIN' }
    });
    adminToken = signToken(uAdmin);

    expiredStudentToken = signToken(uDa, -10);
  }, 30000);

  beforeEach(() => {
    capturedCalls.length = 0;
    generateContentMock = vi.fn(async (params: CapturedGeminiCall) => {
      capturedCalls.push(params);
      const userPrompt = params.contents[0]?.parts[0]?.text || '';
      return {
        text: `Verified response for message: ${userPrompt.slice(0, 40)}`
      };
    });

    (geminiAIService as any).client = {
      models: {
        generateContent: generateContentMock
      }
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
          // Ignore file lock cleanup issues on Windows
        }
      }
    }
  });

  describe('1. Authentication & Authorization Hardening', () => {
    it('rejects Missing JWT with HTTP 401 and does not invoke Gemini', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .send({ message: 'What should I study next?' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_MISSING');
      expect(generateContentMock).not.toHaveBeenCalled();
    });

    it('rejects Invalid JWT with HTTP 401 and cannot downgrade to guest access', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', 'Bearer forged.invalid.jwt')
        .send({ message: 'What should I study next?' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_INVALID');
      expect(generateContentMock).not.toHaveBeenCalled();
    });

    it('rejects Expired JWT with HTTP 401 TOKEN_EXPIRED', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${expiredStudentToken}`)
        .send({ message: 'What should I study next?' });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe('TOKEN_EXPIRED');
      expect(generateContentMock).not.toHaveBeenCalled();
    });

    it('rejects Mentor account with HTTP 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${mentorToken}`)
        .send({ message: 'Help me plan my week' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      expect(generateContentMock).not.toHaveBeenCalled();
    });

    it('rejects Admin account with HTTP 403 FORBIDDEN', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ message: 'Help me plan my week' });

      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      expect(generateContentMock).not.toHaveBeenCalled();
    });

    it('hardens optionalAuth so invalid Authorization headers still throw 401 instead of silent guest access', () => {
      const fakeReq: any = { headers: { authorization: 'Bearer bad.jwt.token' } };
      const next = vi.fn();
      expect(() => optionalAuth(fakeReq, {} as any, next)).toThrow();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('2. Exact Gemini Context Injection (Spied SDK Calls)', () => {
    it('Data Analyst student: injects Data Analyst goal cleanly via config.systemInstruction and ignores client overrides', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${daToken}`)
        .send({
          message: 'How should I prioritize analytics this week?',
          userId: 'spoofed-id',
          targetCareer: 'AI / Machine Learning Engineer',
          goal: 'Product Manager',
          role: 'ADMIN'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.isFallback).toBe(false);
      expect(generateContentMock).toHaveBeenCalledTimes(1);

      const sys = capturedCalls[0].config?.systemInstruction || '';
      expect(sys).toContain('Student Name: Dana Chen');
      expect(sys).toContain('Target Career Goal: Data Analyst');
      expect(sys).not.toContain('Product Manager');
      expect(sys).not.toContain('Monica');
      expect(sys).not.toContain('spoofed-id');
      expect(capturedCalls[0].contents[0].parts[0].text).toBe('How should I prioritize analytics this week?');
    });

    it('AI/ML student: injects AI / Machine Learning Engineer goal accurately', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${aimlToken}`)
        .send({ message: 'Review my model serving focus' });

      expect(res.status).toBe(200);
      const sys = capturedCalls[0].config?.systemInstruction || '';
      expect(sys).toContain('Student Name: Jordan Patel');
      expect(sys).toContain('Target Career Goal: AI / Machine Learning Engineer');
      expect(sys).toContain('Python (84/100)');
      expect(sys).toContain('PyTorch (55/100)');
      expect(sys).toContain('MLOps (28/100)');
    });

    it('Null career goal: passes explicit unset state without fabricating AI/ML Engineer', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${nullGoalToken}`)
        .send({ message: 'What should I study next?' });

      expect(res.status).toBe(200);
      const sys = capturedCalls[0].config?.systemInstruction || '';
      expect(sys).toContain('Student Name: Casey Ng');
      expect(sys).toContain('Target Career Goal: Not set (null');
      expect(sys).not.toContain('Target Career Goal: AI / Machine Learning Engineer');
    });

    it('Missing skill profile: explicitly marks skills unavailable and injects zero fabricated skills', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${noSkillsToken}`)
        .send({ message: 'What are my skill gaps?' });

      expect(res.status).toBe(200);
      const sys = capturedCalls[0].config?.systemInstruction || '';
      expect(sys).toContain('Skill Profile Recorded: No');
      expect(sys).not.toContain('Python');
      expect(sys).not.toContain('Data Structures');
      expect(sys).not.toContain('PyTorch');
      expect(sys).not.toContain('System Design');
      expect(sys).not.toContain('MLOps');
      expect(sys).not.toContain('Distributed Training');
      expect(sys).not.toContain('Kubernetes');
    });

    it('SQL score 25: preserves SQL (25/100) under Weaknesses / Needs Improvement', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${sql25Token}`)
        .send({ message: 'Build me a SQL practice plan' });

      expect(res.status).toBe(200);
      const sys = capturedCalls[0].config?.systemInstruction || '';
      expect(sys).toContain('Weaknesses / Needs Improvement (score < 40): SQL (25/100)');
      expect(sys).toContain('Verified / Mastered Skills (score >= 70): Excel (82/100)');
    });

    it('SQL score 65: classifies SQL (65/100) under Developing Skills', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${sql65Token}`)
        .send({ message: 'Am I ready for SQL interviews?' });

      expect(res.status).toBe(200);
      const sys = capturedCalls[0].config?.systemInstruction || '';
      expect(sys).toContain('Developing Skills (score 40-69): SQL (65/100)');
    });

    it('SQL score 90: classifies SQL (90/100) under Verified / Mastered Skills', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${sql90Token}`)
        .send({ message: 'How is my SQL standing?' });

      expect(res.status).toBe(200);
      const sys = capturedCalls[0].config?.systemInstruction || '';
      expect(sys).toContain('Verified / Mastered Skills (score >= 70): SQL (90/100)');
    });

    it('Actual Phase 3 progress: injects Phase 3 and enriched template title without hardcoding Phase 1', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${phase3Token}`)
        .send({ message: 'Where am I on my roadmap?' });

      expect(res.status).toBe(200);
      const sys = capturedCalls[0].config?.systemInstruction || '';
      expect(sys).toContain('Roadmap Progress Recorded: Yes');
      expect(sys).toContain('Current Roadmap Phase: Phase 3: Executive Analytics & Forecasting');
      expect(sys).not.toContain('Current Roadmap Phase: Phase 1');
    });

    it('No roadmap progress (even when active template exists): sets hasRoadmap false and injects no fabricated phase', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${noRoadmapTemplateExistsToken}`)
        .send({ message: 'Where am I on my roadmap?' });

      expect(res.status).toBe(200);
      const sys = capturedCalls[0].config?.systemInstruction || '';
      expect(sys).toContain('Roadmap Progress Recorded: No');
      expect(sys).toContain('Current Roadmap Phase: Not started (null');
      expect(sys).not.toContain('Current Roadmap Phase: Phase 1');
    });

    it('Casual greeting: passes raw greeting cleanly with natural greeting instruction', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${daToken}`)
        .send({ message: 'hi' });

      expect(res.status).toBe(200);
      expect(capturedCalls[0].contents).toEqual([{ role: 'user', parts: [{ text: 'hi' }] }]);
      expect(capturedCalls[0].config?.systemInstruction).toContain('Answer simple casual greetings warmly and naturally');
    });

    it('Concurrent students: preserves strict per-student context isolation with zero mixing', async () => {
      const [rSql25, rAiml] = await Promise.all([
        request(app)
          .post('/api/v1/ai/mentor/message')
          .set('Authorization', `Bearer ${sql25Token}`)
          .send({ message: 'Summarize my profile' }),
        request(app)
          .post('/api/v1/ai/mentor/message')
          .set('Authorization', `Bearer ${aimlToken}`)
          .send({ message: 'Summarize my profile' })
      ]);

      expect(rSql25.status).toBe(200);
      expect(rAiml.status).toBe(200);
      expect(capturedCalls).toHaveLength(2);

      const sysSql = capturedCalls.find((c) => c.config?.systemInstruction?.includes('Riley Kim'))?.config?.systemInstruction || '';
      const sysMl = capturedCalls.find((c) => c.config?.systemInstruction?.includes('Jordan Patel'))?.config?.systemInstruction || '';

      expect(sysSql).toContain('Target Career Goal: Data Analyst');
      expect(sysSql).toContain('SQL (25/100)');
      expect(sysSql).not.toContain('Jordan Patel');
      expect(sysSql).not.toContain('AI / Machine Learning Engineer');

      expect(sysMl).toContain('Target Career Goal: AI / Machine Learning Engineer');
      expect(sysMl).toContain('Python (84/100)');
      expect(sysMl).not.toContain('Riley Kim');
      expect(sysMl).not.toContain('Excel (82/100)');
    });
  });

  describe('3. Gemini Failure & Grounded Fallback Engine', () => {
    it('returns accurate isFallback=true metadata and DB-grounded SQL weakness without fabricated Phase 1', async () => {
      generateContentMock.mockRejectedValueOnce(
        new Error('Upstream failure key=AIzaSy_SHOULD_BE_REDACTED_TEST')
      );

      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${sql25Token}`)
        .send({ message: 'How should I improve SQL?' });

      expect(res.status).toBe(200);
      expect(res.body.data.isFallback).toBe(true);
      expect(res.body.data.model).toBe('pathpilot-intelligence-local');
      expect(res.body.data.reply).toContain('Data Analyst');
      expect(res.body.data.reply).toContain('SQL (25/100');
      expect(res.body.data.reply).not.toContain('Phase 1');
      expect(res.body.data.reply).not.toContain('AI / Machine Learning Engineer');
      expect(JSON.stringify(res.body)).not.toContain('AIzaSy_SHOULD_BE_REDACTED_TEST');
    });

    it('handles casual greetings and null career goals naturally in fallback mode', async () => {
      generateContentMock.mockRejectedValue(new Error('TIMED_OUT'));

      const greetingRes = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${daToken}`)
        .send({ message: 'hi' });

      expect(greetingRes.status).toBe(200);
      expect(greetingRes.body.data.isFallback).toBe(true);
      expect(greetingRes.body.data.reply).toContain('Dana Chen');
      expect(greetingRes.body.data.reply).toContain('Data Analyst');
      expect(greetingRes.body.data.reply).not.toContain('1. **');

      const nullRes = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${nullGoalToken}`)
        .send({ message: 'What should I learn next?' });

      expect(nullRes.status).toBe(200);
      expect(nullRes.body.data.isFallback).toBe(true);
      expect(nullRes.body.data.reply).not.toContain('AI / Machine Learning Engineer');
      expect(nullRes.body.data.reply).not.toContain('Phase 1');
      expect(nullRes.body.data.reply).not.toContain('Python');
    });
  });
});
