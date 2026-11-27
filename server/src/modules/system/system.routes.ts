// PATHPILOT — SYSTEM ROUTES (/health, /ready, /health/live, /health/ready)
import { Router } from 'express';
import { getHealth, getReadiness } from './system.controller.js';

export const systemRouter = Router();

// Liveness probe: returns 200 when process is responsive
systemRouter.get('/health', getHealth);
systemRouter.get('/health/live', getHealth);
systemRouter.get('/live', getHealth);

// Readiness probe: returns 200 when dependencies are active, 503 otherwise
systemRouter.get('/ready', getReadiness);
systemRouter.get('/health/ready', getReadiness);
