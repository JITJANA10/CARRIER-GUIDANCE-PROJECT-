// PATHPILOT — AUTHENTICATION CONTROLLER (AUTOMATIC ROLE DETECTION)
// Directive: PP-AUTH-AUTO-ROLE-2026-01 & PP-DEMO-60MIN-EXEC-2026-01

import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database.js';
import { env } from '../../config/env.js';
import { sendSuccess } from '../../shared/utils/response.js';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError } from '../../shared/errors/AppError.js';
import type { JWTPayload, UserRole } from '../../types/auth.js';
import { getCanonicalCareerTitle } from '../careers/careerCatalog.js';
import { resolveMergedStudentSkills, safeParseJsonArray } from '../student/student.service.js';

function formatProfileDTO(profile: {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  targetGoal: string | null;
  educationLevel: string | null;
  onboardingCompleted: boolean;
  streakDays: number;
  weeklyTargetHours: number;
  completedHoursThisWeek: number;
  interestsJson: string;
  strengthsJson: string;
  savedCareersJson: string;
  createdAt: Date;
  updatedAt: Date;
} | null) {
  if (!profile) return null;
  return {
    ...profile,
    interests: safeParseJsonArray(profile.interestsJson),
    strengths: safeParseJsonArray(profile.strengthsJson),
    savedCareers: safeParseJsonArray(profile.savedCareersJson)
  };
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ValidationError('Email and password are required', [
      ...(!email ? [{ field: 'email', issue: 'Email is required' }] : []),
      ...(!password ? [{ field: 'password', issue: 'Password is required' }] : [])
    ]);
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Retrieve user with profile directly from SQLite
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      profile: true,
      mentorProfile: true
    }
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(String(password), user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // AUTOMATIC ROLE DETECTION: User role is retrieved directly from database
  const role = user.role as UserRole;

  const payload: JWTPayload = {
    sub: user.id,
    email: user.email,
    role
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any
  });

  const displayName = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
    : user.email.split('@')[0];

  sendSuccess(res, {
    user: {
      id: user.id,
      email: user.email,
      name: displayName,
      role: user.role,
      profile: formatProfileDTO(user.profile),
      mentorProfile: user.mentorProfile
    },
    token
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, name, targetCareer } = req.body;

  if (!email || !password || !name) {
    throw new ValidationError('Name, email, and password are required.', [
      ...(!name ? [{ field: 'name', issue: 'Name is required' }] : []),
      ...(!email ? [{ field: 'email', issue: 'Email is required' }] : []),
      ...(!password ? [{ field: 'password', issue: 'Password is required' }] : [])
    ]);
  }

  if (password.length < 8) {
    throw new ValidationError('Password must be at least 8 characters long.', [
      { field: 'password', issue: 'Minimum 8 characters required' }
    ]);
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail }
  });

  if (existing) {
    throw new ConflictError('An account with this email address already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const nameParts = String(name).trim().split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';

  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        role: 'STUDENT' // Registrations default to STUDENT
      }
    });

    const normalizedGoal = targetCareer ? getCanonicalCareerTitle(String(targetCareer)) : null;

    const profile = await tx.profile.create({
      data: {
        userId: user.id,
        firstName,
        lastName,
        targetGoal: normalizedGoal,
        onboardingCompleted: Boolean(normalizedGoal),
        streakDays: 0,
        weeklyTargetHours: 10
      }
    });

    await tx.skillProfile.create({
      data: {
        userId: user.id,
        skillsJson: '{}'
      }
    });

    return { ...user, profile };
  });

  const payload: JWTPayload = {
    sub: newUser.id,
    email: newUser.email,
    role: newUser.role as UserRole
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as any
  });

  sendSuccess(
    res,
    {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.profile.firstName} ${newUser.profile.lastName}`.trim(),
        role: newUser.role,
        profile: newUser.profile
      },
      token
    },
    201
  );
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      skillProfile: true,
      studentSkills: true,
      mentorProfile: true
    }
  });

  if (!user) {
    throw new NotFoundError('User profile not found in persistent store.');
  }

  const displayName = user.profile
    ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
    : user.email.split('@')[0];

  const { records: skillRecords, skillMap } = resolveMergedStudentSkills(user.studentSkills, user.skillProfile);

  sendSuccess(res, {
    user: {
      id: user.id,
      email: user.email,
      name: displayName,
      role: user.role,
      profile: formatProfileDTO(user.profile),
      skills: skillMap,
      skillRecords,
      mentorProfile: user.mentorProfile
    }
  });
}
