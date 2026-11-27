// PATHPILOT — FINAL DEMONSTRATION VERIFICATION INTEGRATION SUITE
// Directive: PP-DEMO-FINAL-VERIFY-2026-01 & PP-AI-PHASE-A-CLOSEOUT-2026-01
// Runs strictly against an isolated temporary SQLite database; never touches pathpilot.db.

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import type { Express } from 'express';

const isolatedDbPath = path.join(
  os.tmpdir(),
  `pathpilot-demo-booking-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.db`
);
process.env.DATABASE_URL = `file:${isolatedDbPath}`;
process.env.NODE_ENV = 'test';

let app: Express;
let dbManager: typeof import('../../src/config/database.js')['dbManager'];
let prisma: typeof import('../../src/config/database.js')['prisma'];
let geminiAIService: typeof import('../../src/modules/ai/ai.service.js')['geminiAIService'];

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

async function seedIsolatedDemoFixtures(): Promise<void> {
  const [studentPasswordHash, mentorPasswordHash, adminPasswordHash] = await Promise.all([
    bcrypt.hash('Student123!', 10),
    bcrypt.hash('Mentor123!', 10),
    bcrypt.hash('Admin123!', 10)
  ]);

  await prisma.user.create({
    data: {
      email: 'student@pathpilot.io',
      passwordHash: studentPasswordHash,
      role: 'STUDENT',
      profile: {
        create: {
          firstName: 'Alex',
          lastName: 'Rivera',
          targetGoal: 'AI / Machine Learning Engineer',
          educationLevel: 'Junior Developer',
          onboardingCompleted: true,
          streakDays: 5,
          weeklyTargetHours: 12
        }
      },
      skillProfile: {
        create: {
          skillsJson: JSON.stringify({
            Python: 78,
            'Machine Learning': 70,
            PyTorch: 52,
            SQL: 65,
            Docker: 40
          })
        }
      },
      progress: {
        create: {
          careerSlug: 'ai-ml-engineer',
          currentPhaseId: 'phase-2',
          completedTasks: JSON.stringify(['task-1-1', 'task-1-2'])
        }
      }
    }
  });

  const mentorUser = await prisma.user.create({
    data: {
      email: 'mentor@pathpilot.io',
      passwordHash: mentorPasswordHash,
      role: 'MENTOR',
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Jenkins',
          targetGoal: 'Senior Staff Product Manager',
          educationLevel: 'Senior Mentor',
          onboardingCompleted: true
        }
      }
    }
  });

  const mentor2User = await prisma.user.create({
    data: {
      email: 'mentor2@pathpilot.io',
      passwordHash: mentorPasswordHash,
      role: 'MENTOR',
      profile: {
        create: {
          firstName: 'David',
          lastName: 'Chen',
          targetGoal: 'Lead Data Analytics Architect',
          educationLevel: 'Demo Mentor',
          onboardingCompleted: true
        }
      }
    }
  });

  await prisma.user.create({
    data: {
      email: 'admin@pathpilot.io',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          targetGoal: 'Platform Governance',
          onboardingCompleted: true
        }
      }
    }
  });

  const careersData = [
    {
      slug: 'ai-ml-engineer',
      title: 'AI / Machine Learning Engineer',
      category: 'Engineering',
      salaryRange: '$145,000 - $210,000',
      growthRate: '+31% (Very High)',
      description: 'Design and deploy deep learning models, generative AI pipelines, and scalable inference architectures.',
      phases: [{ id: 'phase-1', number: '01', title: 'Mathematical Foundations & Deep Python', goal: 'Master vector calculus and PyTorch.', status: 'completed' }]
    },
    {
      slug: 'product-manager',
      title: 'Product Manager',
      category: 'Product & Data',
      salaryRange: '$120,000 - $175,000',
      growthRate: '+10% (High)',
      description: 'Lead cross-functional teams to define product vision and deliver user-centric features.',
      phases: [{ id: 'phase-1', number: '01', title: 'Product Discovery & Market Research', goal: 'Synthesize quantitative metrics.', status: 'completed' }]
    },
    {
      slug: 'full-stack-developer',
      title: 'Full-Stack Developer',
      category: 'Engineering',
      salaryRange: '$110,000 - $165,000',
      growthRate: '+17% (High)',
      description: 'Architect scalable web applications and resilient databases.',
      phases: [{ id: 'phase-1', number: '01', title: 'Frontend Architecture', goal: 'Master React and TypeScript.', status: 'completed' }]
    },
    {
      slug: 'cloud-architect',
      title: 'Cloud Solutions Architect',
      category: 'Security & Cloud',
      salaryRange: '$140,000 - $195,000',
      growthRate: '+24% (Very High)',
      description: 'Architect resilient multi-region cloud infrastructures.',
      phases: [{ id: 'phase-1', number: '01', title: 'Networking & IAM', goal: 'Master VPCs and IAM governance.', status: 'completed' }]
    },
    {
      slug: 'cybersecurity-specialist',
      title: 'Cybersecurity Specialist',
      category: 'Security & Cloud',
      salaryRange: '$115,000 - $170,000',
      growthRate: '+33% (Fastest Growing)',
      description: 'Protect enterprise infrastructure through threat modeling.',
      phases: [{ id: 'phase-1', number: '01', title: 'Network Security', goal: 'Audit vulnerabilities.', status: 'completed' }]
    },
    {
      slug: 'data-analyst',
      title: 'Data Analyst / BI Engineer',
      category: 'Product & Data',
      salaryRange: '$85,000 - $130,000',
      growthRate: '+14% (High)',
      description: 'Translate complex datasets into executive dashboards.',
      phases: [{ id: 'phase-1', number: '01', title: 'SQL Analytics', goal: 'Master window functions and CTEs.', status: 'completed' }]
    }
  ];

  for (const c of careersData) {
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

  const mentors = [
    {
      userId: mentorUser.id,
      name: 'Sarah Jenkins',
      role: 'Senior Staff Product Manager (DEMO MENTOR)',
      company: 'FinTech Enterprise (Demonstration Profile)',
      experience: '9+ years',
      industry: 'Financial Technology & SaaS',
      skillsJson: JSON.stringify(['Product Strategy', 'PRDs', 'Executive Stakeholder Mgmt']),
      price: '$120 / session',
      rating: 4.95,
      reviews: 142,
      bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona specializing in strategy teardowns and portfolio reviews.',
      slotsJson: JSON.stringify([
        '2026-11-27T16:00:00Z',
        '2026-11-28T14:00:00Z',
        '2026-12-01T15:00:00Z'
      ])
    },
    {
      userId: mentor2User.id,
      name: 'David Chen',
      role: 'Lead Data Analytics Architect (DEMO MENTOR)',
      company: 'Global E-Commerce (Demonstration Profile)',
      experience: '7 years',
      industry: 'E-commerce & Cloud Platforms',
      skillsJson: JSON.stringify(['SQL Mastery', 'A/B Testing', 'Tableau', 'Data Modeling']),
      price: '$95 / session',
      rating: 4.88,
      reviews: 98,
      bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona specializing in practical SQL and data storytelling.',
      slotsJson: JSON.stringify(['2026-11-27T14:00:00Z', '2026-11-29T11:00:00Z'])
    },
    {
      name: 'Elena Rostova',
      role: 'Head of Product Design (DEMO MENTOR)',
      company: 'Design Systems Lab (Demonstration Profile)',
      experience: '8+ years',
      industry: 'Enterprise Software & Mobile',
      skillsJson: JSON.stringify(['Figma', 'Design Systems', 'User Research']),
      price: '$110 / session',
      rating: 4.92,
      reviews: 115,
      bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona bridging design execution and product engineering.',
      slotsJson: JSON.stringify(['2026-11-28T11:00:00Z', '2026-11-30T13:00:00Z'])
    },
    {
      name: 'Marcus Vance',
      role: 'VP of Engineering & Talent Advisor (DEMO MENTOR)',
      company: 'AI Infrastructure Lab (Demonstration Profile)',
      experience: '12+ years',
      industry: 'Artificial Intelligence & Infra',
      skillsJson: JSON.stringify(['System Design', 'Technical Leadership', 'Career Ladders']),
      price: '$150 / session',
      rating: 4.98,
      reviews: 210,
      bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona focused on system architecture and engineering career ladders.',
      slotsJson: JSON.stringify(['2026-11-28T18:00:00Z', '2026-12-02T17:00:00Z'])
    }
  ];

  for (const m of mentors) {
    await prisma.mentorProfile.create({ data: m });
  }
}

describe('PathPilot Final Verification — Auth, RBAC, Partial Unique Index, Mentors, Careers & Gemini AI', () => {
  const createdBookingIds: string[] = [];
  let studentToken = '';
  let mentor1Token = '';
  let mentor2Token = '';
  let adminToken = '';
  let mentor1Id = '';
  let mentor2Id = '';

  beforeAll(async () => {
    ({ app } = await import('../../src/app.js'));
    ({ dbManager, prisma } = await import('../../src/config/database.js'));
    ({ geminiAIService } = await import('../../src/modules/ai/ai.service.js'));

    await dbManager.connect();

    // Safety assertion: verify isolated temporary SQLite database, never demo pathpilot.db
    const dbList: Array<{ name: string; file: string }> = await prisma.$queryRawUnsafe('PRAGMA database_list');
    const mainFile = dbList.find((d) => d.name === 'main')?.file || '';
    expect(mainFile).not.toContain('pathpilot.db');
    expect(mainFile).toContain('pathpilot-demo-booking-');
    console.log(`[demoAuthAndBooking] Isolated Prisma SQLite DB: ${mainFile}`);

    const migrationsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../prisma/migrations');
    await applySqlFile(path.join(migrationsRoot, '0001_init/migration.sql'));
    await applySqlFile(path.join(migrationsRoot, '0002_partial_unique_active_booking/migration.sql'));
    await applySqlFile(path.join(migrationsRoot, '0003_phase_b_student_sync/migration.sql'));
    await seedIsolatedDemoFixtures();
  }, 30000);

  afterAll(async () => {
    await dbManager.disconnect();
    for (const suffix of ['', '-journal', '-wal', '-shm']) {
      const f = `${isolatedDbPath}${suffix}`;
      if (fs.existsSync(f)) {
        try {
          fs.unlinkSync(f);
        } catch {
          // Ignore locked temp file handles on Windows
        }
      }
    }
  });

  describe('1. Authentication & Automatic Role Detection', () => {
    it('authenticates Student and automatically detects STUDENT role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'student@pathpilot.io', password: 'Student123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('STUDENT');
      expect(res.body.data.token).toBeDefined();
      studentToken = res.body.data.token;
    });

    it('authenticates Mentor and automatically detects MENTOR role', async () => {
      const res1 = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'mentor@pathpilot.io', password: 'Mentor123!' });
      expect(res1.status).toBe(200);
      expect(res1.body.data.user.role).toBe('MENTOR');
      mentor1Token = res1.body.data.token;

      const res2 = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'mentor2@pathpilot.io', password: 'Mentor123!' });
      expect(res2.status).toBe(200);
      expect(res2.body.data.user.role).toBe('MENTOR');
      mentor2Token = res2.body.data.token;
    });

    it('authenticates Admin and automatically detects ADMIN role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'admin@pathpilot.io', password: 'Admin123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('ADMIN');
      adminToken = res.body.data.token;
    });

    it('ignores forged role parameter during login and resolves true database role', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'student@pathpilot.io',
          password: 'Student123!',
          role: 'ADMIN'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.user.role).toBe('STUDENT');
    });

    it('rejects invalid password with 401 INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'student@pathpilot.io', password: 'WrongPassword999!' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('2. RBAC Access Controls (Admin & Cross-Mentor Protection)', () => {
    it('forbids STUDENT from Admin APIs (403 Forbidden) while allowing ADMIN (200 OK)', async () => {
      const studentAttempt = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(studentAttempt.status).toBe(403);
      expect(studentAttempt.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');

      const mentorAttempt = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', `Bearer ${mentor1Token}`);

      expect(mentorAttempt.status).toBe(403);

      const adminAttempt = await request(app)
        .get('/api/v1/admin/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminAttempt.status).toBe(200);
      expect(adminAttempt.body.data.usersCount).toBeGreaterThanOrEqual(4);
    });

    it('forbids MENTOR and ADMIN from student-only booking endpoint (403 Forbidden) and rejects invalid tokens (401)', async () => {
      const invalidTokenRes = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token');
      expect(invalidTokenRes.status).toBe(401);
      expect(invalidTokenRes.body.error.code).toBe('TOKEN_INVALID');

      const mentorBookRes = await request(app)
        .post('/api/v1/mentors/book')
        .set('Authorization', `Bearer ${mentor1Token}`)
        .send({
          mentorId: 'dummy-id',
          scheduledTime: '2026-12-25T10:00:00Z',
          topic: 'Mentor calling student endpoint'
        });
      expect(mentorBookRes.status).toBe(403);
      expect(mentorBookRes.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('3. Mentor Data Integrity, Partial Unique Index & Concurrency', () => {
    it('lists 4 demonstration mentor profiles with explicit DEMO MENTOR / DEMONSTRATION PROFILE labeling', async () => {
      const res = await request(app).get('/api/v1/mentors');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(4);

      for (const mentor of res.body.data) {
        expect(mentor.role).toContain('DEMO MENTOR');
        expect(mentor.bio).toContain('DEMONSTRATION PROFILE');
        expect(mentor.bio).not.toContain('Stripe');
      }

      const sarah = res.body.data.find((m: any) => m.name === 'Sarah Jenkins');
      const david = res.body.data.find((m: any) => m.name === 'David Chen');
      expect(sarah).toBeDefined();
      expect(david).toBeDefined();
      mentor1Id = sarah.id;
      mentor2Id = david.id;
    });

    it('forbids Mentor 1 from managing Mentor 2 bookings (403 Forbidden)', async () => {
      const slot = '2026-12-10T10:00:00Z';
      const bookRes = await request(app)
        .post('/api/v1/mentors/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          mentorId: mentor2Id,
          scheduledTime: slot,
          topic: 'Cross-mentor authorization isolation test'
        });

      expect(bookRes.status).toBe(201);
      const bookingId = bookRes.body.data.id;
      createdBookingIds.push(bookingId);

      // Mentor 2 retrieves incoming booking with student career goal
      const mentor2Bookings = await request(app)
        .get('/api/v1/mentors/bookings/my')
        .set('Authorization', `Bearer ${mentor2Token}`);
      expect(mentor2Bookings.status).toBe(200);
      const foundIncoming = mentor2Bookings.body.data.find((b: any) => b.id === bookingId);
      expect(foundIncoming).toBeDefined();
      expect(foundIncoming.student?.profile?.targetGoal).toBe('AI / Machine Learning Engineer');

      // Mentor 1 tries to confirm Mentor 2's booking -> MUST FAIL 403
      const forbiddenRes = await request(app)
        .patch(`/api/v1/mentors/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${mentor1Token}`)
        .send({ status: 'CONFIRMED' });

      expect(forbiddenRes.status).toBe(403);

      // Mentor 2 confirms their own booking -> MUST SUCCEED 200
      const allowedRes = await request(app)
        .patch(`/api/v1/mentors/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${mentor2Token}`)
        .send({ status: 'CONFIRMED' });

      expect(allowedRes.status).toBe(200);
      expect(allowedRes.body.data.status).toBe('CONFIRMED');

      // Verify student's booking view immediately reflects CONFIRMED status
      const studentBookingsAfterConfirm = await request(app)
        .get('/api/v1/mentors/bookings/my')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentBookingsAfterConfirm.status).toBe(200);
      const reflectedConfirm = studentBookingsAfterConfirm.body.data.find((b: any) => b.id === bookingId);
      expect(reflectedConfirm?.status).toBe('CONFIRMED');

      // Student cannot mark session COMPLETED -> MUST FAIL 403
      const studentCompleteAttempt = await request(app)
        .patch(`/api/v1/mentors/bookings/${bookingId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'COMPLETED' });
      expect(studentCompleteAttempt.status).toBe(403);
    });

    it('rejects duplicate bookings and guarantees concurrent requests cannot both succeed', async () => {
      const concurrentSlot = '2026-12-11T14:00:00Z';

      // Fire 3 concurrent booking requests simultaneously for exact same mentor + slot
      const results = await Promise.all([
        request(app)
          .post('/api/v1/mentors/book')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({ mentorId: mentor1Id, scheduledTime: concurrentSlot, topic: 'Concurrent Request A' }),
        request(app)
          .post('/api/v1/mentors/book')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({ mentorId: mentor1Id, scheduledTime: concurrentSlot, topic: 'Concurrent Request B' }),
        request(app)
          .post('/api/v1/mentors/book')
          .set('Authorization', `Bearer ${studentToken}`)
          .send({ mentorId: mentor1Id, scheduledTime: concurrentSlot, topic: 'Concurrent Request C' })
      ]);

      const successes = results.filter((r) => r.status === 201);
      const conflicts = results.filter((r) => r.status === 409);

      for (const s of successes) {
        createdBookingIds.push(s.body.data.id);
      }

      expect(successes.length).toBe(1);
      expect(conflicts.length).toBe(2);
    });

    it('allows cancelled, rejected, and completed slots to be re-booked (SQLite partial unique index verification)', async () => {
      // A. CANCELLED slot release
      const slotForCancel = '2026-12-12T15:00:00Z';
      const book1 = await request(app)
        .post('/api/v1/mentors/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ mentorId: mentor1Id, scheduledTime: slotForCancel, topic: 'Cancel release test 1' });
      expect(book1.status).toBe(201);
      createdBookingIds.push(book1.body.data.id);

      const cancelRes = await request(app)
        .patch(`/api/v1/mentors/bookings/${book1.body.data.id}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'CANCELLED' });
      expect(cancelRes.status).toBe(200);
      expect(cancelRes.body.data.status).toBe('CANCELLED');

      // Re-booking cancelled slot MUST succeed
      const rebookAfterCancel = await request(app)
        .post('/api/v1/mentors/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ mentorId: mentor1Id, scheduledTime: slotForCancel, topic: 'Cancel release test 2' });
      expect(rebookAfterCancel.status).toBe(201);
      createdBookingIds.push(rebookAfterCancel.body.data.id);

      // B. REJECTED slot release
      const slotForReject = '2026-12-13T16:00:00Z';
      const bookReject = await request(app)
        .post('/api/v1/mentors/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ mentorId: mentor1Id, scheduledTime: slotForReject, topic: 'Reject release test 1' });
      expect(bookReject.status).toBe(201);
      createdBookingIds.push(bookReject.body.data.id);

      const rejectRes = await request(app)
        .patch(`/api/v1/mentors/bookings/${bookReject.body.data.id}/status`)
        .set('Authorization', `Bearer ${mentor1Token}`)
        .send({ status: 'REJECTED' });
      expect(rejectRes.status).toBe(200);

      // Verify student's booking view reflects REJECTED status
      const studentAfterReject = await request(app)
        .get('/api/v1/mentors/bookings/my')
        .set('Authorization', `Bearer ${studentToken}`);
      expect(studentAfterReject.status).toBe(200);
      expect(studentAfterReject.body.data.find((b: any) => b.id === bookReject.body.data.id)?.status).toBe('REJECTED');

      // Re-booking rejected slot MUST succeed
      const rebookAfterReject = await request(app)
        .post('/api/v1/mentors/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ mentorId: mentor1Id, scheduledTime: slotForReject, topic: 'Reject release test 2' });
      expect(rebookAfterReject.status).toBe(201);
      createdBookingIds.push(rebookAfterReject.body.data.id);

      // C. COMPLETED session does not permanently lock slot
      const slotForComplete = '2026-12-14T17:00:00Z';
      const bookComplete = await request(app)
        .post('/api/v1/mentors/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ mentorId: mentor1Id, scheduledTime: slotForComplete, topic: 'Complete release test 1' });
      expect(bookComplete.status).toBe(201);
      createdBookingIds.push(bookComplete.body.data.id);

      await request(app)
        .patch(`/api/v1/mentors/bookings/${bookComplete.body.data.id}/status`)
        .set('Authorization', `Bearer ${mentor1Token}`)
        .send({ status: 'CONFIRMED' });

      const completeRes = await request(app)
        .patch(`/api/v1/mentors/bookings/${bookComplete.body.data.id}/status`)
        .set('Authorization', `Bearer ${mentor1Token}`)
        .send({ status: 'COMPLETED' });
      expect(completeRes.status).toBe(200);
      expect(completeRes.body.data.status).toBe('COMPLETED');

      const rebookAfterComplete = await request(app)
        .post('/api/v1/mentors/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ mentorId: mentor1Id, scheduledTime: slotForComplete, topic: 'Complete release test 2' });
      expect(rebookAfterComplete.status).toBe(201);
      createdBookingIds.push(rebookAfterComplete.body.data.id);

      // D. Verify listed mentor slots reflect availability dynamically after cancellation
      const seededSlot = '2026-12-01T15:00:00Z';
      const bookSeeded = await request(app)
        .post('/api/v1/mentors/book')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ mentorId: mentor1Id, scheduledTime: seededSlot, topic: 'Dynamic slot visibility test' });
      expect(bookSeeded.status).toBe(201);
      createdBookingIds.push(bookSeeded.body.data.id);

      const mentorsDuring = await request(app).get('/api/v1/mentors');
      const sarahDuring = mentorsDuring.body.data.find((m: any) => m.id === mentor1Id);
      expect(sarahDuring.slots).not.toContain(seededSlot);

      await request(app)
        .patch(`/api/v1/mentors/bookings/${bookSeeded.body.data.id}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ status: 'CANCELLED' });

      const mentorsAfter = await request(app).get('/api/v1/mentors');
      const sarahAfter = mentorsAfter.body.data.find((m: any) => m.id === mentor1Id);
      expect(sarahAfter.slots).toContain(seededSlot);
    });
  });

  describe('4. Career & Roadmap API', () => {
    it('returns 6 canonical careers with active versioned roadmap templates', async () => {
      const res = await request(app).get('/api/v1/careers');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(6);

      const firstCareer = res.body.data[0];
      expect(firstCareer.activeRoadmap).toBeDefined();
      expect(Array.isArray(firstCareer.activeRoadmap.phases)).toBe(true);

      const detailRes = await request(app).get(`/api/v1/careers/${firstCareer.id}`);
      expect(detailRes.status).toBe(200);
      expect(detailRes.body.data.id).toBe(firstCareer.id);
    });
  });

  describe('5. Gemini Live API & Fallback Integrity', () => {
    it('performs genuine Gemini API generation (isFallback: false) without leaking secrets', async () => {
      const res = await request(app)
        .post('/api/v1/ai/mentor/message')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          message: 'List 2 concise bullet points on PyTorch practice for Phase 1.'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isFallback).toBe(false);
      expect(res.body.data.model).toBe('gemini-3.1-flash-lite');
      expect(typeof res.body.data.reply).toBe('string');
      expect(res.body.data.reply.trim().length).toBeGreaterThan(20);

      // Ensure zero secret leakage
      const serialized = JSON.stringify(res.body);
      expect(serialized).not.toContain('AIzaSy');
      expect(serialized).not.toContain('AQ.Ab8');
    }, 15000);

    it('strictly marks isFallback=true when using local heuristic fallback', () => {
      const localResult = (geminiAIService as any).buildFallbackResponse(
        'How should I prepare for interviews?',
        'AI / Machine Learning Engineer',
        1
      );
      expect(localResult.isFallback).toBe(true);
      expect(localResult.model).toBe('pathpilot-intelligence-local');
    });
  });
});
