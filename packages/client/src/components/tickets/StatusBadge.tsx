// Author: Sam Rivera
// Issue: #7 â€” Render ticket status consistently

import { TicketStatus } from '@helpdesk/shared';

interface StatusBadgeProps {
  status: TicketStatus;
}

const statusClass: Record<TicketStatus, string> = {
  [TicketStatus.OPEN]: 'bg-blue-50 text-blue-700 border-blue-200',
  [TicketStatus.IN_PROGRESS]: 'bg-amber-50 text-amber-800 border-amber-200',
  [TicketStatus.WAITING]: 'bg-slate-100 text-slate-700 border-slate-300',
  [TicketStatus.RESOLVED]: 'bg-green-50 text-green-700 border-green-200',
  [TicketStatus.CLOSED]: 'bg-zinc-100 text-zinc-700 border-zinc-300',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${statusClass[status]}`}
    >
      {status.replace('_', ' ')}
    </span>
  );
}
