// PATHPILOT — AUTHENTICATION ROUTER
// Directive: PP-AUTH-AUTO-ROLE-2026-01

import { Router } from 'express';
import { login, register, getMe } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/register', register);
authRouter.get('/me', requireAuth, getMe);
