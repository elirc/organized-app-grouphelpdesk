// Author: Sam Rivera
// Issue: #15 â€” Display ticket details and assignment controls

import type { Ticket, User } from '@helpdesk/shared';

import { formatDateTime } from '../../utils/formatters';
import { StatusBadge } from './StatusBadge';

interface TicketDetailProps {
  ticket: Ticket;
  agents: User[];
  onAssign: (assigneeId: string) => Promise<void>;
}

export function TicketDetail({ ticket, agents, onAssign }: TicketDetailProps) {
  const assignee = agents.find((agent) => agent.id === ticket.assigneeId);

  return (
    <section className="space-y-4 rounded border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{ticket.title}</h1>
          <p className="mt-1 text-sm text-slate-600">Updated {formatDateTime(ticket.updatedAt)}</p>
        </div>
        <StatusBadge status={ticket.status} />
      </div>
      <p className="whitespace-pre-wrap text-slate-800">{ticket.description}</p>
      <div className="grid gap-3 text-sm md:grid-cols-3">
        <div>
          <span className="font-medium">Priority:</span> {ticket.priority}
        </div>
        <div>
          <span className="font-medium">Assignee:</span> {assignee?.name ?? 'Unassigned'}
        </div>
        <div>
          <span className="font-medium">Tags:</span> {ticket.tags.join(', ') || 'None'}
        </div>
        <div>
          <span className="font-medium">Response due:</span>{' '}
          {ticket.firstResponseDueAt ? formatDateTime(ticket.firstResponseDueAt) : 'Not set'}
        </div>
        <div>
          <span className="font-medium">Resolution due:</span>{' '}
          {ticket.resolutionDueAt ? formatDateTime(ticket.resolutionDueAt) : 'Not set'}
        </div>
        <div>
          <span className="font-medium">Escalated:</span>{' '}
          {ticket.escalatedAt ? formatDateTime(ticket.escalatedAt) : 'No'}
        </div>
      </div>
      <label className="block text-sm font-medium">
        Assign agent
        <select
          className="mt-1 w-full max-w-md rounded border border-line px-3 py-2"
          value={ticket.assigneeId ?? ''}
          onChange={(event) => onAssign(event.target.value)}
        >
          <option value="">Unassigned</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
