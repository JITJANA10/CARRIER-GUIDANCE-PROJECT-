// PATHPILOT — AUTHENTICATION & RBAC MIDDLEWARE
// Directive: PP-AUTH-AUTO-ROLE-2026-01 & PP-DEMO-60MIN-EXEC-2026-01

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/AppError.js';
import type { AuthUserPayload, JWTPayload, UserRole } from '../types/auth.js';

function verifyBearerHeader(authHeader: string): AuthUserPayload {
  if (!authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Authentication token is missing or malformed', 'TOKEN_MISSING');
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    throw new UnauthorizedError('Authentication token is missing or malformed', 'TOKEN_MISSING');
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    return {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role
    };
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Session has expired. Please log in again.', 'TOKEN_EXPIRED');
    }
    throw new UnauthorizedError('Invalid authentication credentials.', 'TOKEN_INVALID');
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizedError('Authentication token is missing or malformed', 'TOKEN_MISSING');
  }

  req.user = verifyBearerHeader(authHeader);
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required prior to permission evaluation.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Role '${req.user.role}' lacks sufficient privileges for this operation. Allowed: [${allowedRoles.join(', ')}]`,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
}

/**
 * Attaches verified user claims when an Authorization header is absent or valid,
 * while rejecting malformed, invalid, or expired credentials rather than downgrading to guest.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return next();
  }

  req.user = verifyBearerHeader(authHeader);
  next();
}
