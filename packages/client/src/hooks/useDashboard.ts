// Author: Sam Rivera
// Issue: Learning Phase 5 - Cache dashboard server state with TanStack Query

import { useQuery } from '@tanstack/react-query';

import { api } from '../services/api';
import { queryKeys } from '../services/queryKeys';

function toErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const [metrics, activity, workload, system] = await Promise.all([
        api.dashboard.metrics(),
        api.dashboard.activity(),
        api.dashboard.workload(),
        api.dashboard.system(),
      ]);

      return {
        metrics: metrics.data,
        activity: activity.data,
        workload: workload.data,
        system: system.data,
      };
    },
  });
}

export function useDashboard() {
  const query = useDashboardQuery();

  return {
    metrics: query.data?.metrics ?? null,
    activity: query.data?.activity ?? [],
    workload: query.data?.workload ?? [],
    system: query.data?.system ?? null,
    loading: query.isLoading,
    error: query.error ? toErrorMessage(query.error, 'Failed to load dashboard.') : null,
  };
}
