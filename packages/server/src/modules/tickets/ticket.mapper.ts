// Author: Alex Chen
// Issue: Learning Phase 3 - Map Prisma ticket records into API responses

import type { TicketRecord } from './ticket.types';

function parseTags(tags: unknown): string[] {
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((tag): tag is string => typeof tag === 'string')
        : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : [];
}

export function mapTicketToResponse<T extends TicketRecord>(ticket: T) {
  return {
    ...ticket,
    tags: parseTags(ticket.tags),
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    resolvedAt: ticket.resolvedAt?.toISOString() ?? null,
    closedAt: ticket.closedAt?.toISOString() ?? null,
    firstResponseDueAt: ticket.firstResponseDueAt?.toISOString() ?? null,
    resolutionDueAt: ticket.resolutionDueAt?.toISOString() ?? null,
    firstRespondedAt: ticket.firstRespondedAt?.toISOString() ?? null,
    escalatedAt: ticket.escalatedAt?.toISOString() ?? null,
    slaBreachedAt: ticket.slaBreachedAt?.toISOString() ?? null,
  };
}
