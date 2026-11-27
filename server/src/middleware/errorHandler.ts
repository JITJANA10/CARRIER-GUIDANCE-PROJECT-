// PATHPILOT — CENTRALIZED ERROR HANDLING MIDDLEWARE
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/errors/AppError.js';
import { sendError } from '../shared/utils/response.js';
import { logger } from '../shared/utils/logger.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const requestId = req.id || (res.getHeader('X-Request-Id') as string) || 'unknown';

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ requestId, err, code: err.code }, `Operational server error: ${err.message}`);
    } else {
      logger.warn({ requestId, code: err.code, statusCode: err.statusCode }, `Client error: ${err.message}`);
    }

    sendError(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Handle malformed JSON body parser syntax errors
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    logger.warn({ requestId }, 'Invalid JSON payload received');
    sendError(res, 'INVALID_JSON', 'Malformed JSON payload in request body.', 400);
    return;
  }

  // CORS rejection error
  if (err.message && err.message.includes('CORS')) {
    logger.warn({ requestId, err: err.message }, 'CORS origin rejected');
    sendError(res, 'CORS_ORIGIN_DENIED', err.message, 403);
    return;
  }

  // Unhandled internal server exception
  logger.error({ requestId, err }, `Unhandled exception occurred: ${err.message}`);

  const message = env.NODE_ENV === 'production' 
    ? 'An unexpected internal error occurred.' 
    : err.message;

  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    message,
    500,
    env.NODE_ENV === 'development' ? [{ issue: err.stack || '' }] : []
  );
}

export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    'ROUTE_NOT_FOUND',
    `Cannot ${req.method} ${req.originalUrl}`,
    404
  );
}
