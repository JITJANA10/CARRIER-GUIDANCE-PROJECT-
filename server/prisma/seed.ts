// PATHPILOT — CANONICAL SEED SCRIPT (ACCOUNTS, CAREERS, ROADMAPS, MENTORS)
// Directive: PP-DEMO-60MIN-EXEC-2026-01

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting PathPilot Demo Database Seed...');

  // 1. Password Hashing (Cost factor 10)
  const studentPasswordHash = await bcrypt.hash('Student123!', 10);
  const mentorPasswordHash = await bcrypt.hash('Mentor123!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  // 2. Demo Student Account
  const student = await prisma.user.upsert({
    where: { email: 'student@pathpilot.io' },
    update: { passwordHash: studentPasswordHash, role: 'STUDENT' },
    create: {
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
            'Python': 78,
            'Machine Learning': 70,
            'PyTorch': 52,
            'SQL': 65,
            'Docker': 40
          })
        }
      },
      progress: {
        create: {
          careerSlug: 'ai-ml-engineer',
          currentPhaseId: 'phase-2',
          completedTasks: JSON.stringify(['task-1-1', 'task-1-2'])
        }
      },
      tasks: {
        create: [
          {
            title: 'Implement Multi-Head Attention in PyTorch',
            durationMin: 45,
            status: 'todo',
            category: 'skill'
          },
          {
            title: 'Complete Neural Networks Diagnostic Quiz',
            durationMin: 20,
            status: 'done',
            category: 'review',
            completedAt: new Date()
          }
        ]
      }
    }
  });
  console.log(`✅ Seeded Student Account: ${student.email} (Role: ${student.role})`);

  // 3. Demo Mentor Account
  const mentorUser = await prisma.user.upsert({
    where: { email: 'mentor@pathpilot.io' },
    update: { passwordHash: mentorPasswordHash, role: 'MENTOR' },
    create: {
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
  console.log(`✅ Seeded Mentor Account: ${mentorUser.email} (Role: ${mentorUser.role})`);

  const mentor2User = await prisma.user.upsert({
    where: { email: 'mentor2@pathpilot.io' },
    update: { passwordHash: mentorPasswordHash, role: 'MENTOR' },
    create: {
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
  console.log(`✅ Seeded Second Mentor Account: ${mentor2User.email} (Role: ${mentor2User.role})`);

  // 4. Demo Admin Account
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pathpilot.io' },
    update: { passwordHash: adminPasswordHash, role: 'ADMIN' },
    create: {
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
  console.log(`✅ Seeded Admin Account: ${adminUser.email} (Role: ${adminUser.role})`);

  // 5. Careers & Roadmap Templates
  const careersData = [
    {
      slug: 'ai-ml-engineer',
      title: 'AI / Machine Learning Engineer',
      category: 'Engineering',
      salaryRange: '$145,000 - $210,000',
      growthRate: '+31% (Very High)',
      description: 'Design and deploy deep learning models, generative AI pipelines, and scalable inference architectures.',
      phases: [
        { id: 'phase-1', number: '01', title: 'Mathematical Foundations & Deep Python', goal: 'Master vector calculus, linear algebra, and NumPy/PyTorch tensor manipulations.', status: 'completed' },
        { id: 'phase-2', number: '02', title: 'Deep Learning & Neural Architectures', goal: 'Build Transformers, CNNs, and fine-tune open LLMs using PyTorch and HuggingFace.', status: 'active' },
        { id: 'phase-3', number: '03', title: 'MLOps, Model Serving & Docker', goal: 'Containerize models, construct automated evaluation pipelines, and deploy onto Kubernetes.', status: 'locked' }
      ]
    },
    {
      slug: 'product-manager',
      title: 'Product Manager',
      category: 'Product & Data',
      salaryRange: '$120,000 - $175,000',
      growthRate: '+10% (High)',
      description: 'Lead cross-functional teams to define product vision, conduct discovery, and deliver user-centric features.',
      phases: [
        { id: 'phase-1', number: '01', title: 'Product Discovery & Market Research', goal: 'Synthesize quantitative metrics with qualitative user pain points into strategy.', status: 'completed' },
        { id: 'phase-2', number: '02', title: 'Technical PRDs & Data Analytics', goal: 'Draft specification documents and query product telemetry with advanced SQL.', status: 'active' },
        { id: 'phase-3', number: '03', title: 'Go-to-Market & Executive Leadership', goal: 'Manage roadmaps, run A/B growth experiments, and align executive stakeholders.', status: 'locked' }
      ]
    },
    {
      slug: 'full-stack-developer',
      title: 'Full-Stack Developer',
      category: 'Engineering',
      salaryRange: '$110,000 - $165,000',
      growthRate: '+17% (High)',
      description: 'Architect scalable web applications spanning reactive frontend frameworks, REST/GraphQL APIs, and resilient databases.',
      phases: [
        { id: 'phase-1', number: '01', title: 'Frontend Architecture & State Stores', goal: 'Master React 19, TypeScript strict mode, and performant state synchronization.', status: 'completed' },
        { id: 'phase-2', number: '02', title: 'Backend Systems & API Reliability', goal: 'Engineer Express/Fastify services with relational database integrity and auth.', status: 'active' }
      ]
    },
    {
      slug: 'cloud-architect',
      title: 'Cloud Solutions Architect',
      category: 'Security & Cloud',
      salaryRange: '$140,000 - $195,000',
      growthRate: '+24% (Very High)',
      description: 'Architect resilient multi-region cloud infrastructures, automated IaC deployments, and high-availability systems.',
      phases: [
        { id: 'phase-1', number: '01', title: 'Networking, VPCs & IAM Governance', goal: 'Master CIDR subnetting, secure routing, and least-privilege cloud IAM.', status: 'completed' }
      ]
    },
    {
      slug: 'cybersecurity-specialist',
      title: 'Cybersecurity Specialist',
      category: 'Security & Cloud',
      salaryRange: '$115,000 - $170,000',
      growthRate: '+33% (Fastest Growing)',
      description: 'Protect enterprise infrastructure through threat modeling, vulnerability teardowns, and zero-trust policies.',
      phases: [
        { id: 'phase-1', number: '01', title: 'Network Security & Penetration Testing', goal: 'Analyze packet captures, audit CVE vulnerabilities, and harden endpoints.', status: 'completed' }
      ]
    },
    {
      slug: 'data-analyst',
      title: 'Data Analyst / BI Engineer',
      category: 'Product & Data',
      salaryRange: '$85,000 - $130,000',
      growthRate: '+14% (High)',
      description: 'Translate complex datasets into executive dashboards, predictive forecasts, and strategic product insights.',
      phases: [
        { id: 'phase-1', number: '01', title: 'SQL Analytics & Relational Modeling', goal: 'Master window functions, CTEs, and schema dimensional modeling.', status: 'completed' }
      ]
    }
  ];

  for (const c of careersData) {
    const career = await prisma.career.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        category: c.category,
        salaryRange: c.salaryRange,
        growthRate: c.growthRate,
        description: c.description
      },
      create: {
        slug: c.slug,
        title: c.title,
        category: c.category,
        salaryRange: c.salaryRange,
        growthRate: c.growthRate,
        description: c.description
      }
    });

    await prisma.roadmapTemplate.upsert({
      where: {
        careerId_version: {
          careerId: career.id,
          version: '1.0.0'
        }
      },
      update: {
        isActive: true,
        phasesJson: JSON.stringify(c.phases)
      },
      create: {
        careerId: career.id,
        version: '1.0.0',
        isActive: true,
        phasesJson: JSON.stringify(c.phases)
      }
    });
  }
  console.log(`✅ Seeded ${careersData.length} Canonical Careers & Active Roadmap Templates`);

  // 6. Demonstration Mentor Profiles (Fictional Personas Clearly Labeled)
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
      bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona specializing in practical SQL and data storytelling that influences roadmaps.',
      slotsJson: JSON.stringify([
        '2026-11-27T14:00:00Z',
        '2026-11-29T11:00:00Z'
      ])
    },
    {
      name: 'Elena Rostova',
      role: 'Head of Product Design (DEMO MENTOR)',
      company: 'Design Systems Lab (Demonstration Profile)',
      experience: '8+ years',
      industry: 'Enterprise Software & Mobile',
      skillsJson: JSON.stringify(['Figma', 'Design Systems', 'User Research', 'Design Strategy']),
      price: '$110 / session',
      rating: 4.92,
      reviews: 115,
      bio: 'DEMONSTRATION PROFILE: Fictional demo mentor persona bridging design execution and product engineering.',
      slotsJson: JSON.stringify([
        '2026-11-28T11:00:00Z',
        '2026-11-30T13:00:00Z'
      ])
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
      slotsJson: JSON.stringify([
        '2026-11-28T18:00:00Z',
        '2026-12-02T17:00:00Z'
      ])
    }
  ];

  for (const m of mentors) {
    const existing = await prisma.mentorProfile.findFirst({ where: { name: m.name } });
    if (existing) {
      await prisma.mentorProfile.update({
        where: { id: existing.id },
        data: m
      });
    } else {
      await prisma.mentorProfile.create({ data: m });
    }
  }
  console.log(`✅ Seeded ${mentors.length} Demonstration Mentor Profiles (DEMO MENTOR)`);

  console.log('✨ PathPilot Seed Sequence Completed Successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
