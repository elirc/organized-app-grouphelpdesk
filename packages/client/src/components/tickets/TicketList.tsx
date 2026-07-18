// Author: Sam Rivera
// Issue: #7 â€” Render ticket list table

import { Link } from 'react-router-dom';
import type { Ticket } from '@helpdesk/shared';

import { formatDateTime } from '../../utils/formatters';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { StatusBadge } from './StatusBadge';

interface TicketListProps {
  tickets: Ticket[];
  loading: boolean;
}

export function TicketList({ tickets, loading }: TicketListProps) {
  if (loading) return <LoadingSpinner />;

  if (tickets.length === 0) {
    return (
      <EmptyState
        title="No tickets found"
        description="Try adjusting filters or create a ticket."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded border border-line bg-white">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th className="p-3">Ticket</th>
            <th className="p-3">Status</th>
            <th className="p-3">Priority</th>
            <th className="p-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-t border-line">
              <td className="p-3">
                <Link
                  className="font-medium text-focus hover:underline"
                  to={`/tickets/${ticket.id}`}
                >
                  {ticket.title}
                </Link>
                <p className="mt-1 line-clamp-1 text-slate-600">{ticket.description}</p>
              </td>
              <td className="p-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="p-3">{ticket.priority}</td>
              <td className="p-3 text-slate-600">{formatDateTime(ticket.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
