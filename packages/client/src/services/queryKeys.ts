// Author: Sam Rivera
// Issue: Learning Phase 5 - Keep TanStack Query cache keys consistent

import type { TicketFilters } from '@helpdesk/shared';

export const queryKeys = {
  tickets: {
    all: ['tickets'] as const,
    list: (filters: TicketFilters) => [...queryKeys.tickets.all, 'list', filters] as const,
    detail: (id: string) => [...queryKeys.tickets.all, 'detail', id] as const,
  },
  comments: (ticketId: string) => ['comments', ticketId] as const,
  dashboard: ['dashboard'] as const,
  users: {
    all: ['users'] as const,
    byRole: (role?: string) => [...queryKeys.users.all, role ?? 'all'] as const,
  },
};
