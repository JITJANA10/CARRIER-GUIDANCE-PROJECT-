// PATHPILOT — RATE LIMITING INFRASTRUCTURE
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { sendError } from '../shared/utils/response.js';

export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (req, res) => {
    sendError(
      res,
      'RATE_LIMIT_EXCEEDED',
      'Too many requests received from this client. Please retry later.',
      429
    );
  }
});

export const sensitiveRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 requests per window for sensitive paths
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (req, res) => {
    sendError(
      res,
      'SENSITIVE_RATE_LIMIT_EXCEEDED',
      'Maximum attempt threshold reached for this action. Please retry later.',
      429
    );
  }
});
