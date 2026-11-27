// PATHPILOT — PHASE 01 AUTOMATED FOUNDATION TEST SUITE
// Tests all 10 mandatory acceptance criteria under PP-BE-PHASE01-IMPLEMENT-2026-01

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import type { Express } from 'express';

const isolatedFoundationDb = path.join(
  os.tmpdir(),
  `pathpilot-foundation-${process.pid}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.db`
);
process.env.DATABASE_URL = `file:${isolatedFoundationDb}`;
process.env.NODE_ENV = 'test';

let app: Express;
let dbManager: typeof import('../../src/config/database.js')['dbManager'];

describe('Phase 01 Backend Foundation Acceptance Suite', () => {
  beforeAll(async () => {
    expect(process.env.DATABASE_URL).toContain('pathpilot-foundation-');
    expect(process.env.DATABASE_URL).not.toContain('pathpilot.db');
    ({ app } = await import('../../src/app.js'));
    ({ dbManager } = await import('../../src/config/database.js'));
  });

  beforeEach(() => {
    // Reset mock state before each test
    dbManager.setMockStatus(true, 'connected');
  });

  // 1. Health Endpoint Verification
  it('Criterion 1: GET /api/v1/health returns 200 OK with liveness status', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('healthy');
    expect(typeof res.body.data.uptimeSeconds).toBe('number');
    expect(res.body.meta).toBeDefined();
    expect(res.body.meta.requestId).toBeDefined();
  });

  // 2. Readiness Endpoint Verification
  it('Criterion 2a: GET /api/v1/ready returns 200 OK when runtime dependencies are ready', async () => {
    dbManager.setMockStatus(true, 'connected');
    const res = await request(app).get('/api/v1/ready');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ready');
    expect(res.body.data.dependencies.database).toBe('connected');
  });

  it('Criterion 2b: GET /api/v1/ready returns 503 Service Unavailable when database is disconnected', async () => {
    dbManager.setMockStatus(false, 'disconnected');
    const res = await request(app).get('/api/v1/ready');

    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('SERVICE_UNAVAILABLE');
    expect(res.body.error.message).toContain('not ready');
  });

  // 3. Request ID Generation
  it('Criterion 3: Automatically generates valid UUIDv4 when X-Request-Id is missing', async () => {
    const res = await request(app).get('/api/v1/health');

    const requestId = res.headers['x-request-id'];
    expect(requestId).toBeDefined();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(requestId)).toBe(true);
    expect(res.body.meta.requestId).toBe(requestId);
  });

  // 4. Valid Request ID Propagation
  it('Criterion 4: Propagates valid incoming UUIDv4 without alteration', async () => {
    const customUuid = '123e4567-e89b-42d3-a456-426614174000';
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Request-Id', customUuid);

    expect(res.headers['x-request-id']).toBe(customUuid);
    expect(res.body.meta.requestId).toBe(customUuid);
  });

  // 5. Invalid Request ID Replacement
  it('Criterion 5: Replaces malformed or untrusted request ID with clean UUIDv4', async () => {
    const malformedId = 'malicious<script>alert(1)</script>';
    const res = await request(app)
      .get('/api/v1/health')
      .set('X-Request-Id', malformedId);

    const receivedId = res.headers['x-request-id'];
    expect(receivedId).not.toBe(malformedId);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidRegex.test(receivedId)).toBe(true);
  });

  // 6. Allowed CORS Origin
  it('Criterion 6: Grants access and reflects origin for authorized clients', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:5173');

    expect(res.status).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  // 7. Rejected CORS Origin
  it('Criterion 7: Rejects unauthorized origins with 403 Forbidden', async () => {
    const res = await request(app)
      .get('/api/v1/health')
      .set('Origin', 'https://malicious-phishing-site.com');

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CORS_ORIGIN_DENIED');
  });

  // 8. Standard Error Envelope
  it('Criterion 8: Formats all operational errors in standard envelope structure', async () => {
    const res = await request(app)
      .post('/api/v1/health') // POST not allowed on health
      .send({ invalid: 'data' });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: expect.any(String),
        details: []
      },
      meta: {
        timestamp: expect.any(String),
        requestId: expect.any(String)
      }
    });
  });

  // 9. Unknown Route Handling (Structured 404)
  it('Criterion 9: Unknown routes return structured 404 with method and path', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint-abc');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('ROUTE_NOT_FOUND');
    expect(res.body.error.message).toBe('Cannot GET /api/v1/non-existent-endpoint-abc');
  });

  // 10. Application Initialization Without Live Database
  it('Criterion 10: Application initializes cleanly and responds to HTTP requests without live DB', async () => {
    // dbManager disconnected still allows /health to respond
    dbManager.setMockStatus(false, 'disconnected');
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('healthy');
  });
});
