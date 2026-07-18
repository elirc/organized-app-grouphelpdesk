// Author: Sam Rivera
// Issue: #7 â€” Render ticket list page

import { useEffect, useState } from 'react';
import type { TicketFilters, User } from '@helpdesk/shared';

import { TicketFilters as TicketFiltersComponent } from '../components/tickets/TicketFilters';
import { TicketList } from '../components/tickets/TicketList';
import { useTickets } from '../hooks/useTickets';
import { api } from '../services/api';

export default function TicketsPage() {
  const [filters, setFilters] = useState<TicketFilters>({});
  const [agents, setAgents] = useState<User[]>([]);
  const { tickets, loading } = useTickets(filters);

  useEffect(() => {
    api.users.list('AGENT').then((response) => setAgents(response.data));
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Tickets</h1>
        <p className="text-sm text-slate-600">Queue view for support work.</p>
      </div>
      <TicketFiltersComponent agents={agents} filters={filters} onChange={setFilters} />
      <TicketList loading={loading} tickets={tickets} />
    </div>
  );
}
