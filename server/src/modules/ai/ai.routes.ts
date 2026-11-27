// PATHPILOT — GEMINI AI MENTOR ROUTER
// Directive: PP-AI-PHASE-A-EXEC-2026-01

import { Router } from 'express';
import { askAIMentor } from './ai.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.js';

export const aiRouter = Router();

aiRouter.post('/mentor/message', requireAuth, requireRole(['STUDENT']), askAIMentor);
