// Author: Sam Rivera
// Issue: #17 â€” Filter tickets by status, priority, assignee, and search

import { Priority, TicketStatus, type TicketFilters, type User } from '@helpdesk/shared';

interface TicketFiltersProps {
  filters: TicketFilters;
  agents: User[];
  onChange: (filters: TicketFilters) => void;
}

export function TicketFilters({ filters, agents, onChange }: TicketFiltersProps) {
  return (
    <div className="grid gap-3 rounded border border-line bg-white p-4 md:grid-cols-4">
      <input
        className="rounded border border-line px-3 py-2"
        placeholder="Search tickets"
        value={filters.search ?? ''}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
      />
      <select
        className="rounded border border-line px-3 py-2"
        value={String(filters.status ?? '')}
        onChange={(event) =>
          onChange({
            ...filters,
            status: event.target.value ? (event.target.value as TicketStatus) : undefined,
          })
        }
      >
        <option value="">All statuses</option>
        {Object.values(TicketStatus).map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      <select
        className="rounded border border-line px-3 py-2"
        value={String(filters.priority ?? '')}
        onChange={(event) =>
          onChange({
            ...filters,
            priority: event.target.value ? (event.target.value as Priority) : undefined,
          })
        }
      >
        <option value="">All priorities</option>
        {Object.values(Priority).map((priority) => (
          <option key={priority} value={priority}>
            {priority}
          </option>
        ))}
      </select>
      <select
        className="rounded border border-line px-3 py-2"
        value={filters.assigneeId ?? ''}
        onChange={(event) => onChange({ ...filters, assigneeId: event.target.value || undefined })}
      >
        <option value="">All assignees</option>
        {agents.map((agent) => (
          <option key={agent.id} value={agent.id}>
            {agent.name}
          </option>
        ))}
      </select>
    </div>
  );
}
