// PATHPILOT — PRODUCTION-READY PRISMA SQLITE DATABASE MANAGER
// Directive: PP-DEMO-60MIN-EXEC-2026-01

import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/utils/logger.js';
import { env } from './env.js';

export interface DatabaseState {
  isConnected: boolean;
  status: 'disconnected' | 'connecting' | 'connected' | 'disconnecting';
  lastPingAt?: Date;
  error?: string;
}

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
});

class DatabaseManager {
  private state: DatabaseState = {
    isConnected: false,
    status: 'disconnected'
  };

  public isConnected(): boolean {
    return this.state.isConnected;
  }

  public getStatus(): DatabaseState {
    return { ...this.state };
  }

  public async connect(): Promise<void> {
    if (this.state.isConnected) {
      return;
    }

    try {
      this.state.status = 'connecting';
      logger.info('Initializing SQLite persistence via Prisma...');
      
      await prisma.$connect();
      // Execute active ping on SQLite file and journal
      await prisma.$queryRawUnsafe('SELECT 1');

      this.state.isConnected = true;
      this.state.status = 'connected';
      this.state.lastPingAt = new Date();
      logger.info('✅ SQLite Database successfully connected and responsive (SELECT 1 passed).');
    } catch (err: any) {
      this.state.isConnected = false;
      this.state.status = 'disconnected';
      this.state.error = err.message;
      logger.error({ err }, 'Failed to connect to SQLite database.');
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    this.state.status = 'disconnecting';
    try {
      await prisma.$disconnect();
    } finally {
      this.state.isConnected = false;
      this.state.status = 'disconnected';
      logger.info('Database disconnected cleanly.');
    }
  }

  // Testing helper
  public setMockStatus(connected: boolean, status: DatabaseState['status']): void {
    this.state.isConnected = connected;
    this.state.status = status;
  }
}

export const dbManager = new DatabaseManager();
