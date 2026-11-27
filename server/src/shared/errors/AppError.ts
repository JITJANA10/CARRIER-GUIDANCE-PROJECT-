// PATHPILOT — CENTRALIZED ERROR DEFINITIONS
// Standard: Structured operational errors with standard error codes and HTTP mapping

export interface ErrorDetail {
  field?: string;
  issue: string;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details: ErrorDetail[];

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details: ErrorDetail[] = [],
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', details: ErrorDetail[] = []) {
    super('VALIDATION_FAILED', message, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', code: string = 'UNAUTHORIZED') {
    super(code, message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access denied', code: string = 'FORBIDDEN') {
    super(code, message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Requested resource not found', code: string = 'RESOURCE_NOT_FOUND') {
    super(code, message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource conflict', code: string = 'CONFLICT') {
    super(code, message, 409);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests, please slow down', code: string = 'RATE_LIMIT_EXCEEDED') {
    super(code, message, 429);
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', code: string = 'SERVICE_UNAVAILABLE', details: ErrorDetail[] = []) {
    super(code, message, 503, details);
  }
}
