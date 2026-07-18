// Author: Sam Rivera
// Issue: #8 â€” Render create ticket page

import { useNavigate } from 'react-router-dom';
import type { CreateTicketInput } from '@helpdesk/shared';

import { TicketForm } from '../components/tickets/TicketForm';
import { api } from '../services/api';

export default function CreateTicketPage() {
  const navigate = useNavigate();

  async function handleCreateTicket(input: CreateTicketInput) {
    const response = await api.tickets.create(input);
    navigate(`/tickets/${response.data.id}`);
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-semibold">Create ticket</h1>
      <TicketForm onSubmit={handleCreateTicket} />
    </div>
  );
}
