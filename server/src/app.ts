// PATHPILOT — EXPRESS APPLICATION FACTORY
// Directive: PP-BE-PHASE01-IMPLEMENT-2026-01
// Standard: Decoupled application configuration independently testable without live DB

import express from 'express';
import type { Express } from 'express';
import helmet from 'helmet';
import { env } from './config/env.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { corsMiddleware } from './middleware/cors.js';
import { generalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { systemRouter } from './modules/system/system.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { mentorRouter } from './modules/mentors/mentor.routes.js';
import { aiRouter } from './modules/ai/ai.routes.js';
import { careersRouter } from './modules/careers/careers.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { studentRouter } from './modules/student/student.routes.js';

export function createApp(): Express {
  const app = express();

  // 1. Trust reverse proxy headers (e.g. Render / Cloudflare / Vercel)
  app.set('trust proxy', 1);

  // 2. Request ID Generation & Propagation (RFC 4122)
  app.use(requestIdMiddleware);

  // 3. Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // API server does not render HTML
      crossOriginEmbedderPolicy: false
    })
  );

  // 4. Strict CORS with Credentials Support
  app.use(corsMiddleware);

  // 5. Body Parsing with Safe Limits
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 6. Rate Limiting Infrastructure
  app.use('/api/', generalRateLimiter);

  // 7. System Endpoints (Liveness and Readiness)
  // Available both at root (for cloud platform liveness probes) and under versioned prefix
  app.use('/health', systemRouter);
  app.use('/ready', systemRouter);
  app.use(`${env.API_PREFIX}`, systemRouter);

  // 8. Domain Module Routes
  app.use(`${env.API_PREFIX}/auth`, authRouter);
  app.use(`${env.API_PREFIX}/mentors`, mentorRouter);
  app.use(`${env.API_PREFIX}/ai`, aiRouter);
  app.use(`${env.API_PREFIX}/careers`, careersRouter);
  app.use(`${env.API_PREFIX}/admin`, adminRouter);
  app.use(`${env.API_PREFIX}/student`, studentRouter);

  // 9. 404 Handler for Unknown Routes
  app.use(notFoundHandler);

  // 9. Centralized Error Handling Middleware
  app.use(errorHandler);

  return app;
}

export const app = createApp();
