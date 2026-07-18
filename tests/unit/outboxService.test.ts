// Author: Morgan Lee
// Issue: Enterprise Sprint 2 - Test outbox processing helpers

import { describe, expect, it, vi } from 'vitest';

import { createOutboxService } from '../../packages/server/src/services/outboxService';

const now = new Date('2026-05-20T12:00:00.000Z');

function outboxEntry(overrides = {}) {
  return {
    id: 'event_1',
    aggregateType: 'ticket',
    aggregateId: 'ticket_1',
    eventType: 'ticket.created',
    payload: JSON.stringify({ ticketId: 'ticket_1' }),
    status: 'PENDING',
    attempts: 0,
    nextAttemptAt: null,
    processedAt: null,
    createdAt: now,
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    eventOutbox: {
      create: vi.fn().mockResolvedValue(outboxEntry()),
      findMany: vi.fn().mockResolvedValue([outboxEntry()]),
      update: vi.fn().mockResolvedValue(outboxEntry({ status: 'PROCESSED', processedAt: now })),
    },
  };
}

describe('outboxService', () => {
  it('serializes payloads when enqueueing events', async () => {
    const prisma = createMockPrisma();
    const service = createOutboxService(prisma as never);

    const event = await service.enqueue('ticket', 'ticket_1', 'ticket.created', {
      ticketId: 'ticket_1',
    });

    expect(event.payload).toEqual({ ticketId: 'ticket_1' });
    expect(prisma.eventOutbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        payload: JSON.stringify({ ticketId: 'ticket_1' }),
      }),
    });
  });

  it('marks events as processed', async () => {
    const prisma = createMockPrisma();
    const service = createOutboxService(prisma as never);

    const event = await service.markProcessed('event_1');

    expect(event.status).toBe('PROCESSED');
    expect(event.processedAt).toBe(now.toISOString());
  });
});
