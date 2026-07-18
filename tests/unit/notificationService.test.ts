// Author: Morgan Lee
// Issue: Enterprise Sprint 2 - Test notification read workflow

import { describe, expect, it, vi } from 'vitest';
import { NotificationType } from '@helpdesk/shared';

import { createNotificationService } from '../../packages/server/src/services/notificationService';
import { NotFoundError } from '../../packages/server/src/utils/errors';

const now = new Date('2026-05-20T12:00:00.000Z');

function notification(overrides = {}) {
  return {
    id: 'notification_1',
    userId: 'user_1',
    ticketId: 'ticket_1',
    type: NotificationType.TICKET_ASSIGNED,
    title: 'Ticket assigned',
    body: 'Ticket was assigned to you.',
    readAt: null,
    createdAt: now,
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    notification: {
      create: vi.fn().mockResolvedValue(notification()),
      findMany: vi.fn().mockResolvedValue([notification()]),
      findFirst: vi.fn().mockResolvedValue(notification()),
      update: vi.fn().mockResolvedValue(notification({ readAt: now })),
    },
    eventOutbox: {
      create: vi.fn().mockResolvedValue({
        id: 'event_1',
        aggregateType: 'notification',
        aggregateId: 'notification_1',
        eventType: 'notification.created',
        payload: '{}',
        status: 'PENDING',
        attempts: 0,
        nextAttemptAt: null,
        processedAt: null,
        createdAt: now,
      }),
    },
  };
}

describe('notificationService', () => {
  it('creates notifications and writes an outbox event', async () => {
    const prisma = createMockPrisma();
    const service = createNotificationService(prisma as never);

    await service.createNotification({
      userId: 'user_1',
      ticketId: 'ticket_1',
      type: NotificationType.TICKET_ASSIGNED,
      title: 'Ticket assigned',
      body: 'Ticket was assigned to you.',
    });

    expect(prisma.notification.create).toHaveBeenCalled();
    expect(prisma.eventOutbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        aggregateType: 'notification',
        eventType: 'notification.created',
      }),
    });
  });

  it('marks only the current user notification as read', async () => {
    const prisma = createMockPrisma();
    const service = createNotificationService(prisma as never);

    const result = await service.markRead('notification_1', 'user_1');

    expect(result.readAt).toBe(now.toISOString());
    expect(prisma.notification.findFirst).toHaveBeenCalledWith({
      where: { id: 'notification_1', userId: 'user_1' },
    });
    expect(prisma.notification.update).toHaveBeenCalledWith({
      where: { id: 'notification_1' },
      data: { readAt: expect.any(Date) },
    });
  });

  it('rejects read attempts for another user notification', async () => {
    const prisma = createMockPrisma();
    prisma.notification.findFirst.mockResolvedValueOnce(null);
    const service = createNotificationService(prisma as never);

    await expect(service.markRead('notification_1', 'other_user')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });
});
