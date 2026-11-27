// PATHPILOT — STRUCTURED LOGGING ENGINE (PINO)
import pino from 'pino';
import { env } from '../../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  base: {
    service: 'pathpilot-api',
    env: env.NODE_ENV
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.headers["x-goog-api-key"]',
      'password',
      'token',
      'refreshToken',
      'secret',
      'GEMINI_API_KEY',
      'apiKey',
      'api_key'
    ],
    remove: true
  },
  timestamp: pino.stdTimeFunctions.isoTime
});

export function createChildLogger(bindings: Record<string, unknown>) {
  return logger.child(bindings);
}
