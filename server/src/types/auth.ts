// PATHPILOT — AUTH & SESSION TYPES
// Directive: PP-AUTH-AUTO-ROLE-2026-01

export type UserRole = 'STUDENT' | 'MENTOR' | 'ADMIN';

export interface AuthUserPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}
