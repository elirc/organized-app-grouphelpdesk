// Author: Morgan Lee
// Issue: Learning Phase 2 - Verify request validation rejects bad HTTP input

import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../packages/server/src/index';

describe('request validation middleware', () => {
  const app = createApp();

  it('returns a readable 400 response for invalid ticket creation input', async () => {
    const response = await request(app).post('/api/tickets').send({
      title: '',
      description: 'Missing a title and using an invalid priority.',
      priority: 'SEVERE',
      createdBy: 'user_requester_1',
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: 'title' }),
        expect.objectContaining({ path: 'priority' }),
      ]),
    );
  });

  it('rejects invalid ticket list query parameters', async () => {
    const response = await request(app).get('/api/tickets?page=0&limit=500&status=NOT_A_STATUS');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects update requests with no update fields', async () => {
    const response = await request(app).patch('/api/tickets/ticket_1').send({});

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects comments without a body', async () => {
    const response = await request(app).post('/api/tickets/ticket_1/comments').send({
      authorId: 'user_agent_1',
      body: '',
      isInternal: true,
    });

    expect(response.status).toBe(400);
    expect(response.body.error.details.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ path: 'body' })]),
    );
  });

  it('rejects unsupported user role filters', async () => {
    const response = await request(app).get('/api/users?role=MANAGER');

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('requires authentication after a request passes validation', async () => {
    const response = await request(app).get('/api/tickets?page=1&limit=20');

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });
});
