// PATHPILOT — MENTOR DIRECTORY & BOOKING ENGINE CONTROLLER
// Directive: PP-DEMO-60MIN-EXEC-2026-01
// Standard: Atomic booking state machine, double-booking prevention, strict ISO slot validation

import type { Request, Response } from 'express';
import { prisma } from '../../config/database.js';
import { sendSuccess } from '../../shared/utils/response.js';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ForbiddenError
} from '../../shared/errors/AppError.js';

function getParamId(rawId: string | string[] | undefined): string {
  if (typeof rawId === 'string' && rawId.trim().length > 0) {
    return rawId;
  }
  throw new ValidationError('Route ID parameter must be a non-empty string.', [
    { field: 'id', issue: 'Invalid route ID' }
  ]);
}

function normalizeIsoTime(input: string): string {
  const dateObj = new Date(input);
  return dateObj.toISOString().replace(/\.000Z$/, 'Z');
}

function isUniqueConstraintError(err: any): boolean {
  if (!err) return false;
  if (err.code === 'P2002') return true;
  const msg = String(err.message || '');
  return msg.includes('UNIQUE constraint failed') || msg.includes('SQLITE_CONSTRAINT_UNIQUE');
}

export async function listMentors(_req: Request, res: Response): Promise<void> {
  const mentors = await prisma.mentorProfile.findMany({
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      },
      bookings: {
        select: {
          scheduledTime: true,
          status: true
        }
      }
    }
  });

  const parsedMentors = mentors.map((m) => {
    let skills: string[] = [];
    let slots: string[] = [];

    try {
      skills = JSON.parse(m.skillsJson);
    } catch {
      skills = [];
    }

    try {
      slots = JSON.parse(m.slotsJson);
    } catch {
      slots = [];
    }

    // Filter out slots that are already actively booked or requested
    const bookedTimes = new Set(
      m.bookings
        .filter((b) => b.status === 'REQUESTED' || b.status === 'CONFIRMED')
        .map((b) => normalizeIsoTime(b.scheduledTime))
    );

    const availableSlots = slots.filter((slot) => !bookedTimes.has(normalizeIsoTime(slot)));

    return {
      id: m.id,
      userId: m.userId,
      name: m.name,
      role: m.role,
      company: m.company,
      experience: m.experience,
      industry: m.industry,
      skills,
      price: m.price,
      rating: m.rating,
      reviews: m.reviews,
      bio: m.bio,
      slots: availableSlots,
      allSlots: slots,
      isUserAccountLinked: Boolean(m.userId)
    };
  });

  sendSuccess(res, parsedMentors);
}

export async function getMentorById(req: Request, res: Response): Promise<void> {
  const id = getParamId(req.params.id);

  const mentor = await prisma.mentorProfile.findUnique({
    where: { id },
    include: {
      bookings: {
        select: {
          scheduledTime: true,
          status: true
        }
      }
    }
  });

  if (!mentor) {
    throw new NotFoundError(`Mentor profile '${id}' not found.`);
  }

  const skills = JSON.parse(mentor.skillsJson || '[]');
  const slots = JSON.parse(mentor.slotsJson || '[]');
  const bookedTimes = new Set(
    mentor.bookings
      .filter((b) => b.status === 'REQUESTED' || b.status === 'CONFIRMED')
      .map((b) => normalizeIsoTime(b.scheduledTime))
  );

  sendSuccess(res, {
    ...mentor,
    skills,
    slots: slots.filter((s: string) => !bookedTimes.has(normalizeIsoTime(s)))
  });
}

export async function createBooking(req: Request, res: Response): Promise<void> {
  const studentId = req.user!.id;
  const { mentorId, scheduledTime, topic, notes } = req.body;

  if (!mentorId || !scheduledTime || !topic) {
    throw new ValidationError('Mentor ID, scheduled time, and session topic are mandatory.', [
      ...(!mentorId ? [{ field: 'mentorId', issue: 'mentorId is required' }] : []),
      ...(!scheduledTime ? [{ field: 'scheduledTime', issue: 'scheduledTime is required' }] : []),
      ...(!topic ? [{ field: 'topic', issue: 'topic is required' }] : [])
    ]);
  }

  // Validate and canonicalize ISO timestamp
  const dateObj = new Date(scheduledTime);
  if (isNaN(dateObj.getTime())) {
    throw new ValidationError('scheduledTime must be a valid ISO 8601 timestamp string.', [
      { field: 'scheduledTime', issue: 'Invalid ISO date string' }
    ]);
  }
  const canonicalTime = normalizeIsoTime(scheduledTime);

  // Verify mentor exists
  const mentor = await prisma.mentorProfile.findUnique({
    where: { id: mentorId }
  });

  if (!mentor) {
    throw new NotFoundError(`Mentor with ID '${mentorId}' does not exist.`);
  }

  // Double-booking fast-path check: verify whether an active booking already occupies this slot
  const existingBooking = await prisma.mentorBooking.findFirst({
    where: {
      mentorId,
      scheduledTime: canonicalTime,
      status: {
        in: ['REQUESTED', 'CONFIRMED']
      }
    }
  });

  if (existingBooking) {
    throw new ConflictError(
      `The requested time slot (${canonicalTime}) has already been reserved. Please choose an alternate slot.`
    );
  }

  try {
    const booking = await prisma.mentorBooking.create({
      data: {
        studentId,
        mentorId,
        scheduledTime: canonicalTime,
        topic: String(topic).trim(),
        notes: notes ? String(notes).trim() : null,
        status: 'REQUESTED'
      },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            role: true,
            company: true
          }
        },
        student: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    sendSuccess(res, booking, 201);
  } catch (err: any) {
    // SQLite partial unique index `one_active_booking_per_mentor_slot` enforcement
    if (isUniqueConstraintError(err)) {
      throw new ConflictError('Concurrent booking detected: this slot has already been claimed.');
    }
    throw err;
  }
}

export async function getMyBookings(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id;
  const userRole = req.user!.role;

  if (userRole === 'STUDENT') {
    const bookings = await prisma.mentorBooking.findMany({
      where: { studentId: userId },
      include: {
        mentor: {
          select: {
            id: true,
            name: true,
            role: true,
            company: true,
            price: true
          }
        }
      },
      orderBy: { scheduledTime: 'asc' }
    });

    return sendSuccess(res, bookings);
  }

  if (userRole === 'MENTOR') {
    // Find mentor profile for this user
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId }
    });

    if (!mentorProfile) {
      return sendSuccess(res, []);
    }

    const bookings = await prisma.mentorBooking.findMany({
      where: { mentorId: mentorProfile.id },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
                targetGoal: true,
                educationLevel: true
              }
            }
          }
        }
      },
      orderBy: { scheduledTime: 'asc' }
    });

    return sendSuccess(res, bookings);
  }

  // ADMIN: return all bookings
  const allBookings = await prisma.mentorBooking.findMany({
    include: {
      mentor: true,
      student: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  sendSuccess(res, allBookings);
}

export async function updateBookingStatus(req: Request, res: Response): Promise<void> {
  const id = getParamId(req.params.id);
  const { status } = req.body;
  const userId = req.user!.id;
  const userRole = req.user!.role;

  const validStatuses = ['REQUESTED', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'];
  if (!status || !validStatuses.includes(status)) {
    throw new ValidationError(`Status must be one of: [${validStatuses.join(', ')}]`, [
      { field: 'status', issue: 'Invalid status value' }
    ]);
  }

  const booking = await prisma.mentorBooking.findUnique({
    where: { id },
    include: {
      mentor: true
    }
  });

  if (!booking) {
    throw new NotFoundError(`Booking '${id}' not found.`);
  }

  // Authorization and State Machine verification
  const isStudent = booking.studentId === userId;
  const isMentor = booking.mentor.userId === userId;
  const isAdmin = userRole === 'ADMIN';

  if (!isStudent && !isMentor && !isAdmin) {
    throw new ForbiddenError('You do not have permission to modify this booking.');
  }

  // Prevent transitioning out of terminal states
  if (['CANCELLED', 'REJECTED', 'COMPLETED'].includes(booking.status)) {
    throw new ValidationError(
      `Cannot transition booking from terminal state '${booking.status}' to '${status}'.`
    );
  }

  if (status === 'REQUESTED') {
    throw new ValidationError('Bookings cannot be reset to REQUESTED via status update.');
  }

  // Only Mentor or Admin can CONFIRM, REJECT, or mark COMPLETED
  if ((status === 'CONFIRMED' || status === 'REJECTED' || status === 'COMPLETED') && !isMentor && !isAdmin) {
    throw new ForbiddenError('Only the assigned mentor can confirm, reject, or complete a booking session.');
  }

  if ((status === 'CONFIRMED' || status === 'REJECTED') && booking.status !== 'REQUESTED') {
    throw new ValidationError(`Only pending (REQUESTED) bookings can be marked ${status}.`);
  }

  // Only COMPLETED from CONFIRMED
  if (status === 'COMPLETED' && booking.status !== 'CONFIRMED' && !isAdmin) {
    throw new ValidationError('A booking can only be marked completed once it has been confirmed.');
  }

  const updatedBooking = await prisma.mentorBooking.update({
    where: { id },
    data: { status },
    include: {
      mentor: {
        select: {
          id: true,
          name: true,
          role: true,
          company: true
        }
      },
      student: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              firstName: true,
              lastName: true,
              targetGoal: true,
              educationLevel: true
            }
          }
        }
      }
    }
  });

  sendSuccess(res, updatedBooking);
}
