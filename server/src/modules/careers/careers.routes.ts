// PATHPILOT — CAREERS & ROADMAPS ROUTER
// Directive: PP-DEMO-60MIN-EXEC-2026-01

import { Router } from 'express';
import { listCareers, getCareerById } from './careers.controller.js';

export const careersRouter = Router();

careersRouter.get('/', listCareers);
careersRouter.get('/:id', getCareerById);
