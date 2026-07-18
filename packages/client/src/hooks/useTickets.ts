// Author: Sam Rivera
// Issue: Learning Phase 5 - Manage ticket server state with TanStack Query

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Ticket, TicketFilters, UpdateTicketInput } from '@helpdesk/shared';

import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useTicketsQuery(filters: TicketFilters = {}) {
  return useQuery({
    queryKey: queryKeys.tickets.list(filters),
    queryFn: () => api.tickets.list(filters),
  });
}

export function useTickets(filters: TicketFilters = {}) {
  const query = useTicketsQuery(filters);

  return {
    tickets: query.data?.data ?? [],
    loading: query.isLoading,
    error: query.error ? toErrorMessage(query.error, 'Failed to load tickets.') : null,
  };
}

export function useTicketQuery(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id ?? 'missing'),
    queryFn: () => api.tickets.get(id!),
    enabled: Boolean(id),
  });
}

export function useTicket(id: string | undefined) {
  const queryClient = useQueryClient();
  const query = useTicketQuery(id);

  return {
    ticket: query.data?.data ?? null,
    loading: query.isLoading,
    error: query.error ? toErrorMessage(query.error, 'Failed to load ticket.') : null,
    setTicket(ticket: Ticket) {
      queryClient.setQueryData(queryKeys.tickets.detail(ticket.id), { data: ticket });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  };
}

export function useUpdateTicketMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateTicketInput) => api.tickets.update(id, input),
    onSuccess(response) {
      queryClient.setQueryData(queryKeys.tickets.detail(id), response);
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}

export function useAssignTicketMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assigneeId: string) => api.tickets.assign(id, assigneeId),
    onSuccess(response) {
      queryClient.setQueryData(queryKeys.tickets.detail(id), response);
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
}
