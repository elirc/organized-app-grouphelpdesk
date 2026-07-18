// Author: Sam Rivera
// Issue: #32 â€” Render dashboard page

import { Dashboard } from '../components/dashboard/Dashboard';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useDashboard } from '../hooks/useDashboard';

export default function DashboardPage() {
  const { metrics, activity, workload, loading, error } = useDashboard();

  if (loading) return <LoadingSpinner />;
  if (error) return <EmptyState title="Dashboard unavailable" description={error} />;
  if (!metrics)
    return <EmptyState title="No metrics" description="Dashboard metrics are not available yet." />;

  return <Dashboard metrics={metrics} activity={activity} workload={workload} />;
}
