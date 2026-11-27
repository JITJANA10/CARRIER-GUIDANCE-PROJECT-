// PATHPILOT — ADMIN GOVERNANCE CONTROLLER
// Directive: PP-DEMO-FINAL-VERIFY-2026-01

import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../shared/utils/response.js';

export async function getAdminOverview(_req: Request, res: Response): Promise<void> {
  const [usersCount, careersCount, mentorsCount, totalBookings, activeBookings] = await Promise.all([
    prisma.user.count(),
    prisma.career.count(),
    prisma.mentorProfile.count(),
    prisma.mentorBooking.count(),
    prisma.mentorBooking.count({
      where: { status: { in: ['REQUESTED', 'CONFIRMED'] } }
    })
  ]);

  sendSuccess(res, {
    usersCount,
    careersCount,
    mentorsCount,
    totalBookings,
    activeBookings
  });
}

export async function listAllUsers(_req: Request, res: Response): Promise<void> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          firstName: true,
          lastName: true,
          targetGoal: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  sendSuccess(res, users);
}
