// PATHPILOT — UNIFIED API RESPONSE FORMATTER
import type { Response } from 'express';
import type { ErrorDetail } from '../errors/AppError.js';

export interface SuccessEnvelope<T> {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
    [key: string]: unknown;
  };
}

export interface ErrorEnvelope {
  success: false;
  error: {
    code: string;
    message: string;
    details: ErrorDetail[];
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  extraMeta: Record<string, unknown> = {}
): void {
  const requestId = (res.getHeader('X-Request-Id') as string) || 'unknown';
  const envelope: SuccessEnvelope<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
      ...extraMeta
    }
  };
  res.status(statusCode).json(envelope);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 500,
  details: ErrorDetail[] = []
): void {
  const requestId = (res.getHeader('X-Request-Id') as string) || 'unknown';
  const envelope: ErrorEnvelope = {
    success: false,
    error: {
      code,
      message,
      details
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId
    }
  };
  res.status(statusCode).json(envelope);
}
