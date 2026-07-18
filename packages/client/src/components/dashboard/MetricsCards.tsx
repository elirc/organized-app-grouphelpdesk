// Author: Sam Rivera
// Issue: #32 â€” Display dashboard summary metrics

import type { DashboardMetrics } from '@helpdesk/shared';

import { formatHours } from '../../utils/formatters';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    { label: 'Open tickets', value: metrics.openTicketCount },
    { label: 'In progress', value: metrics.inProgressCount },
    { label: 'Avg resolution', value: formatHours(metrics.avgResolutionTimeHours) },
    { label: 'SLA breached', value: metrics.breachedSlaCount },
    { label: 'Escalated', value: metrics.escalatedTicketCount },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-5">
      {cards.map((card) => (
        <article key={card.label} className="rounded border border-line bg-white p-5">
          <p className="text-sm text-slate-600">{card.label}</p>
          <strong className="mt-2 block text-3xl">{card.value}</strong>
        </article>
      ))}
    </div>
  );
}
