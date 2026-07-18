// Author: Morgan Lee
// Issue: #18 â€” Integration smoke test for Express app wiring

import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createApp } from '../../packages/server/src/index';

describe('HelpDesk API app', () => {
  it('responds to health checks', async () => {
    const response = await request(createApp()).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
