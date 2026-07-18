// Author: Morgan Lee
// Issue: #39 â€” Test comment visibility filtering

import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '@helpdesk/shared';

import { createCommentService } from '../../packages/server/src/services/commentService';

function createMockPrisma() {
  const now = new Date('2026-05-20T12:00:00.000Z');

  return {
    ticket: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'ticket_1',
        title: 'Example',
        createdBy: 'requester_1',
        assigneeId: 'agent_1',
        firstRespondedAt: null,
      }),
      update: vi.fn(),
    },
    user: { findUnique: vi.fn().mockResolvedValue({ id: 'agent_1', role: UserRole.AGENT }) },
    comment: {
      create: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    activityLog: { create: vi.fn() },
    notification: {
      create: vi.fn().mockResolvedValue({
        id: 'notification_1',
        userId: 'requester_1',
        ticketId: 'ticket_1',
        type: 'TICKET_COMMENTED',
        title: 'New ticket reply',
        body: 'Reply',
        readAt: null,
        createdAt: now,
      }),
    },
    eventOutbox: {
      create: vi.fn().mockResolvedValue({
        id: 'event_1',
        aggregateType: 'ticket',
        aggregateId: 'ticket_1',
        eventType: 'ticket.comment_added',
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

describe('commentService', () => {
  it('hides internal comments from requester views', async () => {
    const prisma = createMockPrisma();
    const service = createCommentService(prisma as never);

    await service.getComments('ticket_1', true, UserRole.REQUESTER);

    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isInternal: false }),
      }),
    );
  });

  it('allows agents to include internal comments', async () => {
    const prisma = createMockPrisma();
    const service = createCommentService(prisma as never);

    await service.getComments('ticket_1', true, UserRole.AGENT);

    expect(prisma.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isInternal: undefined }),
      }),
    );
  });
});
