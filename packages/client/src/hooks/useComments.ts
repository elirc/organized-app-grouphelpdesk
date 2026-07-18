// Author: Sam Rivera
// Issue: Learning Phase 5 - Manage comment server state with TanStack Query

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CreateCommentInput } from '@helpdesk/shared';

import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useCommentsQuery(ticketId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.comments(ticketId ?? 'missing'),
    queryFn: () => api.comments.list(ticketId!, true),
    enabled: Boolean(ticketId),
  });
}

export function useCreateCommentMutation(ticketId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<CreateCommentInput, 'ticketId'>) =>
      api.comments.create({ ...input, ticketId: ticketId! }),
    onSuccess() {
      if (ticketId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.comments(ticketId) });
      }
    },
  });
}

export function useComments(ticketId: string | undefined) {
  const query = useCommentsQuery(ticketId);
  const createComment = useCreateCommentMutation(ticketId);

  return {
    comments: query.data?.data ?? [],
    loading: query.isLoading,
    error: query.error ? toErrorMessage(query.error, 'Failed to load comments.') : null,
    async addComment(body: string, isInternal: boolean) {
      await createComment.mutateAsync({ body, isInternal });
    },
    refresh() {
      return query.refetch();
    },
  };
}
