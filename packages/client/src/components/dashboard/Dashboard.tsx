// Author: Sam Rivera
// Issue: #32 â€” Compose dashboard widgets

import type { AgentWorkload, DashboardMetrics } from '@helpdesk/shared';

import { ActivityFeed } from './ActivityFeed';
import { MetricsCards } from './MetricsCards';
import { TicketsByCategory } from './TicketsByCategory';

interface DashboardProps {
  metrics: DashboardMetrics;
  activity: unknown[];
  workload: AgentWorkload[];
}

export function Dashboard({ metrics, activity, workload }: DashboardProps) {
  return (
    <div className="space-y-6">
      <MetricsCards metrics={metrics} />
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <TicketsByCategory data={metrics.ticketsByCategory} />
        <section className="rounded border border-line bg-white p-5">
          <h2 className="font-semibold">Agent workload</h2>
          <div className="mt-4 space-y-3">
            {workload.map((agent) => (
              <div key={agent.agentId} className="flex items-center justify-between text-sm">
                <span>{agent.agentName}</span>
                <strong>{agent.totalActiveTickets}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <ActivityFeed activity={activity} />
    </div>
  );
}
