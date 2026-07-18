// Author: Morgan Lee
// Issue: Learning Phase 7 - Verify protected API boundaries

import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../packages/server/src/index';

describe('authorization boundaries', () => {
  const app = createApp();

  it('returns 401 for protected dashboard endpoints without a bearer token', async () => {
    const response = await request(app).get('/api/dashboard/metrics');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('returns 401 for creating a valid ticket without a bearer token', async () => {
    const response = await request(app).post('/api/tickets').send({
      title: 'Cannot log in',
      description: 'The create payload is valid, but identity is missing.',
      priority: 'HIGH',
    });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });
});
