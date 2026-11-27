// PATHPILOT — REQUEST ID GENERATION & VALIDATION MIDDLEWARE
// Directive: PP-BE-PHASE01-IMPLEMENT-2026-01
// Standard: RFC 4122 UUIDv4 validation and propagation

import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

// Strict UUIDv4 regex validation
const UUIDV4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];

  let finalRequestId: string;

  if (typeof incomingId === 'string' && UUIDV4_REGEX.test(incomingId.trim())) {
    // Valid UUIDv4 supplied by upstream reverse proxy or test client
    finalRequestId = incomingId.trim();
  } else {
    // Missing, malformed, or untrusted: generate a secure fresh UUIDv4
    finalRequestId = randomUUID();
  }

  req.id = finalRequestId;
  res.setHeader('X-Request-Id', finalRequestId);
  next();
}
