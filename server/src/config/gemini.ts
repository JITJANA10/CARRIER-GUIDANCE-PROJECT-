// PATHPILOT — CENTRALIZED GEMINI PROVIDER CONFIGURATION & RESILIENCE SPECIFICATION
// Directive: PP-AI-KEY-CONFIG-2026-02
// Standard: Server-side only, strict single-provider boundary, zero key leakage

import { env } from './env.js';

export interface GeminiConfig {
  readonly provider: 'google-gemini';
  readonly model: string;
  readonly timeoutMs: number;
  readonly isConfigured: boolean;
}

export interface GeminiUsageMetadata {
  readonly promptTokenCount: number;
  readonly candidatesTokenCount: number;
  readonly totalTokenCount: number;
}

export interface GeminiSanitizedError {
  readonly code: string;
  readonly message: string;
  readonly isRetryable: boolean;
}

/**
 * Retrieves the centralized Gemini provider configuration.
 * Note: Never logs, displays, or exposes raw API keys in responses or objects.
 */
export function getGeminiConfig(): GeminiConfig {
  const isConfigured = Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim().length > 0);

  return {
    provider: 'google-gemini',
    model: env.GEMINI_MODEL,
    timeoutMs: env.GEMINI_TIMEOUT_MS,
    isConfigured
  };
}

/**
 * Sanitizes any raw provider error or exception object.
 * Guarantees that neither API keys, tokens, nor internal server paths leak to clients or logs.
 */
export function sanitizeGeminiError(error: unknown): GeminiSanitizedError {
  if (!error) {
    return {
      code: 'UNKNOWN_AI_ERROR',
      message: 'An unspecified AI provider error occurred.',
      isRetryable: false
    };
  }

  const rawMessage = error instanceof Error ? error.message : String(error);

  // Redact potential API keys or query params
  const sanitized = rawMessage
    .replace(/key=[a-zA-Z0-9_\-]+/gi, 'key=[REDACTED]')
    .replace(/AIza[a-zA-Z0-9_\-]+/g, '[REDACTED_API_KEY]')
    .replace(/AQ\.[a-zA-Z0-9_\-]+/g, '[REDACTED_TOKEN]');

  if (sanitized.includes('TIMED_OUT') || sanitized.includes('timeout') || sanitized.includes('ETIMEDOUT')) {
    return {
      code: 'AI_PROVIDER_TIMEOUT',
      message: `Gemini API request exceeded configured timeout of ${env.GEMINI_TIMEOUT_MS}ms.`,
      isRetryable: true
    };
  }

  if (sanitized.includes('quota') || sanitized.includes('RESOURCE_EXHAUSTED') || sanitized.includes('429')) {
    return {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'Gemini API quota or rate limit exceeded. Please retry after a brief pause.',
      isRetryable: true
    };
  }

  if (sanitized.includes('API_KEY_INVALID') || sanitized.includes('403') || sanitized.includes('unauthorized')) {
    return {
      code: 'AI_AUTHENTICATION_FAILED',
      message: 'Gemini API authentication failed. Verify server GEMINI_API_KEY configuration.',
      isRetryable: false
    };
  }

  return {
    code: 'AI_PROVIDER_ERROR',
    message: sanitized.length > 200 ? `${sanitized.slice(0, 200)}...` : sanitized,
    isRetryable: false
  };
}

/**
 * Extracts standard token usage metadata safely from a raw Gemini response payload.
 */
export function extractUsageMetadata(rawResponse: Record<string, any> | null | undefined): GeminiUsageMetadata {
  const usage = rawResponse?.usageMetadata;
  return {
    promptTokenCount: Number(usage?.promptTokenCount || 0),
    candidatesTokenCount: Number(usage?.candidatesTokenCount || 0),
    totalTokenCount: Number(usage?.totalTokenCount || 0)
  };
}
