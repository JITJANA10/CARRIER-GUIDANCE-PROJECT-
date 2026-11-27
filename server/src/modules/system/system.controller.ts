// PATHPILOT — SYSTEM HEALTH & READINESS CONTROLLER
import type { Request, Response } from 'express';
import { dbManager } from '../../config/database.js';
import { sendSuccess, sendError } from '../../shared/utils/response.js';

export function getHealth(req: Request, res: Response): void {
  sendSuccess(res, {
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
}

export function getReadiness(req: Request, res: Response): void {
  const dbStatus = dbManager.getStatus();

  // If database is configured and not connected, accurately report 503
  if (!dbStatus.isConnected) {
    sendError(
      res,
      'SERVICE_UNAVAILABLE',
      'Required runtime dependencies are not ready.',
      503,
      [{ field: 'database', issue: `Database status is currently ${dbStatus.status}` }]
    );
    return;
  }

  sendSuccess(res, {
    status: 'ready',
    dependencies: {
      database: dbStatus.status
    },
    timestamp: new Date().toISOString()
  });
}
