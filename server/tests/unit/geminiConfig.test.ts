// PATHPILOT — GEMINI CONFIGURATION & SECURITY UNIT TEST
// Directive: PP-AI-KEY-CONFIG-2026-02

import { describe, it, expect } from 'vitest';
import { getGeminiConfig, sanitizeGeminiError, extractUsageMetadata } from '../../src/config/gemini.js';
import { env } from '../../src/config/env.js';

describe('Gemini Provider Configuration & Security', () => {
  it('should load centralized Gemini configuration safely', () => {
    const config = getGeminiConfig();

    expect(config.provider).toBe('google-gemini');
    expect(config.model).toBe(env.GEMINI_MODEL);
    expect(config.model).toMatch(/^gemini-/);
    expect(config.timeoutMs).toBe(10000);
    expect(typeof config.isConfigured).toBe('boolean');
    // Ensure raw key is not a public property on GeminiConfig
    expect((config as any).apiKey).toBeUndefined();
  });

  it('should support optional GEMINI_API_KEY without breaking backend validation', () => {
    expect(typeof env.GEMINI_MODEL).toBe('string');
    expect(env.GEMINI_MODEL.length).toBeGreaterThan(0);
    expect(env.GEMINI_TIMEOUT_MS).toBe(10000);
    // Even if optional, env object exists and conforms
    expect(typeof env.PORT).toBe('number');
  });

  it('should sanitize raw error messages and redact any API keys', () => {
    const errorWithKey = new Error('Request to https://generativelanguage.googleapis.com failed: key=AIzaSy_FAKE_TEST_KEY_999 was rejected');
    const sanitized = sanitizeGeminiError(errorWithKey);

    expect(sanitized.code).toBe('AI_PROVIDER_ERROR');
    expect(sanitized.message).not.toContain('AIzaSy_FAKE_TEST_KEY_999');
    expect(sanitized.message).toContain('[REDACTED]');
  });

  it('should categorize timeout errors with retryable flag', () => {
    const timeoutErr = new Error('Connection ETIMEDOUT during Gemini inference call');
    const sanitized = sanitizeGeminiError(timeoutErr);

    expect(sanitized.code).toBe('AI_PROVIDER_TIMEOUT');
    expect(sanitized.isRetryable).toBe(true);
    expect(sanitized.message).toContain('10000ms');
  });

  it('should categorize quota exceeded errors with retryable flag', () => {
    const quotaErr = new Error('GoogleGenerativeAIError: RESOURCE_EXHAUSTED (429) rate limit exceeded');
    const sanitized = sanitizeGeminiError(quotaErr);

    expect(sanitized.code).toBe('AI_RATE_LIMIT_EXCEEDED');
    expect(sanitized.isRetryable).toBe(true);
  });

  it('should categorize authentication failures with non-retryable flag', () => {
    const authErr = new Error('HTTP 403 API_KEY_INVALID: credentials rejected');
    const sanitized = sanitizeGeminiError(authErr);

    expect(sanitized.code).toBe('AI_AUTHENTICATION_FAILED');
    expect(sanitized.isRetryable).toBe(false);
  });

  it('should extract usage metadata safely from raw provider responses', () => {
    const mockPayload = {
      usageMetadata: {
        promptTokenCount: 245,
        candidatesTokenCount: 110,
        totalTokenCount: 355
      }
    };

    const usage = extractUsageMetadata(mockPayload);
    expect(usage.promptTokenCount).toBe(245);
    expect(usage.candidatesTokenCount).toBe(110);
    expect(usage.totalTokenCount).toBe(355);
  });

  it('should handle missing or malformed usage metadata gracefully', () => {
    const emptyUsage = extractUsageMetadata(null);
    expect(emptyUsage.promptTokenCount).toBe(0);
    expect(emptyUsage.candidatesTokenCount).toBe(0);
    expect(emptyUsage.totalTokenCount).toBe(0);
  });
});
