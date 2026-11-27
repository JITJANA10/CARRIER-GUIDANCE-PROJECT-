// PATHPILOT — SERVER RUNTIME & LIFECYCLE MANAGEMENT
// Directive: PP-BE-PHASE01-IMPLEMENT-2026-01
// Standard: Graceful shutdown, connection management, structured logging

import type { Server } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { dbManager } from './config/database.js';
import { logger } from './shared/utils/logger.js';

let server: Server;

async function startServer(): Promise<void> {
  try {
    // 1. Initialize Runtime Dependencies
    await dbManager.connect();

    // 2. Start HTTP Listener
    server = app.listen(env.PORT, () => {
      logger.info(
        {
          port: env.PORT,
          env: env.NODE_ENV,
          apiPrefix: env.API_PREFIX,
          corsAllowedOrigins: env.CORS_ALLOWED_ORIGINS
        },
        `🚀 PathPilot Backend Foundation operational on http://localhost:${env.PORT}`
      );
    });

    // 3. Register Process Termination Signals
    setupGracefulShutdown();
  } catch (error) {
    logger.fatal({ err: error }, 'Fatal error during backend runtime initialization.');
    process.exit(1);
  }
}

function setupGracefulShutdown(): void {
  const shutdown = (signal: string) => {
    logger.info({ signal }, `Received ${signal}. Commencing graceful shutdown sequence...`);

    const forceShutdownTimer = setTimeout(() => {
      logger.error('Graceful shutdown timeout exceeded (5s). Forcing process exit.');
      process.exit(1);
    }, 5000);

    if (server) {
      server.close(async () => {
        logger.info('HTTP server closed. Terminating active connections...');
        try {
          await dbManager.disconnect();
          logger.info('Database disconnected cleanly.');
          clearTimeout(forceShutdownTimer);
          logger.info('Graceful shutdown completed successfully.');
          process.exit(0);
        } catch (dbErr) {
          logger.error({ err: dbErr }, 'Error during database disconnection.');
          clearTimeout(forceShutdownTimer);
          process.exit(1);
        }
      });
    } else {
      clearTimeout(forceShutdownTimer);
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled Promise Rejection detected in process.');
  });

  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught Exception detected in process. Exiting.');
    process.exit(1);
  });
}

// Only start listener if invoked directly (not imported during testing)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
