// Author: Jordan Park
// Issue: Enterprise Sprint 2 - Persist integration events for reliable delivery

import { PrismaClient } from '@prisma/client';
import { OutboxStatus } from '@helpdesk/shared';

const defaultPrisma = new PrismaClient();

function parsePayload(payload: string) {
  try {
    return JSON.parse(payload) as unknown;
  } catch {
    return payload;
  }
}

function serializeEntry<
  T extends {
    payload: string;
    createdAt: Date;
    nextAttemptAt: Date | null;
    processedAt: Date | null;
  },
>(entry: T) {
  return {
    ...entry,
    payload: parsePayload(entry.payload),
    createdAt: entry.createdAt.toISOString(),
    nextAttemptAt: entry.nextAttemptAt?.toISOString() ?? null,
    processedAt: entry.processedAt?.toISOString() ?? null,
  };
}

export function createOutboxService(prisma = defaultPrisma) {
  return {
    async enqueue(aggregateType: string, aggregateId: string, eventType: string, payload: unknown) {
      const entry = await prisma.eventOutbox.create({
        data: {
          aggregateType,
          aggregateId,
          eventType,
          payload: JSON.stringify(payload),
          status: OutboxStatus.PENDING,
        },
      });

      return serializeEntry(entry);
    },

    async listPending(limit = 50) {
      const entries = await prisma.eventOutbox.findMany({
        where: { status: OutboxStatus.PENDING },
        take: limit,
        orderBy: { createdAt: 'asc' },
      });

      return entries.map(serializeEntry);
    },

    async markProcessed(id: string) {
      const entry = await prisma.eventOutbox.update({
        where: { id },
        data: { status: OutboxStatus.PROCESSED, processedAt: new Date() },
      });

      return serializeEntry(entry);
    },
  };
}

export const outboxService = createOutboxService();
