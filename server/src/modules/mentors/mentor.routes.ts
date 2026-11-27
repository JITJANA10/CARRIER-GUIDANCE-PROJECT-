// PATHPILOT — MENTOR DIRECTORY & BOOKING ROUTER
// Directive: PP-DEMO-60MIN-EXEC-2026-01

import { Router } from 'express';
import {
  listMentors,
  getMentorById,
  createBooking,
  getMyBookings,
  updateBookingStatus
} from './mentor.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const mentorRouter = Router();

// Public / Authenticated directory listing
mentorRouter.get('/', listMentors);
mentorRouter.get('/:id', getMentorById);

// Protected student booking creation
mentorRouter.post('/book', requireAuth, requireRole(['STUDENT']), createBooking);

// Protected booking queries (role-aware: student sees theirs, mentor sees incoming)
mentorRouter.get('/bookings/my', requireAuth, getMyBookings);

// Protected status transition (confirm, reject, cancel, complete)
mentorRouter.patch('/bookings/:id/status', requireAuth, updateBookingStatus);
