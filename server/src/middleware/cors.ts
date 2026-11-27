// PATHPILOT — STRICT CORS ORIGIN VALIDATION MIDDLEWARE
import cors from 'cors';
import { env } from '../config/env.js';
import { ForbiddenError } from '../shared/errors/AppError.js';

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server, health check probes)
    if (!origin) {
      return callback(null, true);
    }

    const isAllowed = env.CORS_ALLOWED_ORIGINS.includes(origin);
    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new ForbiddenError(`Origin '${origin}' is not permitted by CORS policy.`, 'CORS_ORIGIN_DENIED'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'Accept'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400 // 24 hours
});
