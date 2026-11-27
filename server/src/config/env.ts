// PATHPILOT — ENVIRONMENT SCHEMA & VALIDATION ENGINE
// Directive: PP-BE-PHASE01-IMPLEMENT-2026-01
import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env relative to server root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_PREFIX: z.string().default('/api/v1'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:5173,https://pathpilot.vercel.app')
    .transform((val) => val.split(',').map((origin) => origin.trim()).filter(Boolean)),
  MONGODB_URI: z.string().optional(),
  MONGODB_MAX_POOL_SIZE: z.coerce.number().int().positive().default(10),
  // Google Gemini API Configuration (Directive: PP-AI-KEY-CONFIG-2026-02)
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-2.5-flash'),
  GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  // Local SQLite Database & JWT Configuration (Directive: PP-DEMO-60MIN-EXEC-2026-01)
  DATABASE_URL: z.string().default('file:./pathpilot.db'),
  JWT_SECRET: z.string().default('pathpilot_emergency_demo_jwt_secret_2026_unbreakable'),
  JWT_EXPIRES_IN: z.string().default('7d')
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const errorDetails = result.error.format();
    console.error('❌ FATAL: Invalid application environment configuration:');
    console.error(JSON.stringify(errorDetails, null, 2));
    throw new Error('Environment variable validation failed. Terminating startup.');
  }
  return result.data;
}

export const env = validateEnv();
