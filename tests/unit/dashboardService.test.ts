// Author: Morgan Lee
// Issue: #39 â€” Test dashboard metric aggregation

import { describe, expect, it, vi } from 'vitest';
import { Priority } from '@helpdesk/shared';

import { createDashboardService } from '../../packages/server/src/services/dashboardService';

describe('dashboardService', () => {
  it('aggregates ticket counts and category totals', async () => {
    const prisma = {
      ticket: {
        count: vi
          .fn()
          .mockResolvedValueOnce(2)
          .mockResolvedValueOnce(1)
          .mockResolvedValueOnce(3)
          .mockResolvedValueOnce(4),
        findMany: vi
          .fn()
          .mockResolvedValueOnce([
            {
              createdAt: new Date('2026-05-20T00:00:00.000Z'),
              resolvedAt: new Date('2026-05-20T06:00:00.000Z'),
              closedAt: null,
            },
          ])
          .mockResolvedValueOnce([{ tags: ['access', 'vpn'] }, { tags: ['access'] }]),
        groupBy: vi.fn().mockResolvedValue([{ priority: Priority.HIGH, _count: { priority: 3 } }]),
      },
      user: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      activityLog: {
        findMany: vi.fn().mockResolvedValue([]),
      },
    };

    const service = createDashboardService(prisma as never);
    const metrics = await service.getMetrics();

    expect(metrics.openTicketCount).toBe(2);
    expect(metrics.inProgressCount).toBe(1);
    expect(metrics.breachedSlaCount).toBe(3);
    expect(metrics.escalatedTicketCount).toBe(4);
    expect(metrics.avgResolutionTimeHours).toBe(6);
    expect(metrics.ticketsByPriority.HIGH).toBe(3);
    expect(metrics.ticketsByCategory).toContainEqual({ category: 'access', count: 2 });
  });
});
