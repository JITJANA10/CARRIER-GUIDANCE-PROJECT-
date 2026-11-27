// PATHPILOT — ADMIN GOVERNANCE ROUTER
// Directive: PP-DEMO-FINAL-VERIFY-2026-01

import { Router } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.js';
import { getAdminOverview, listAllUsers } from './admin.controller.js';

export const adminRouter = Router();

// Strictly restricted to ADMIN role
adminRouter.use(requireAuth, requireRole(['ADMIN']));

adminRouter.get('/overview', getAdminOverview);
adminRouter.get('/users', listAllUsers);
