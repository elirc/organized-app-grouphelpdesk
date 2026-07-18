// Author: Sam Rivera
// Issue: #15 â€” Render ticket detail, comments, and assignment

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { User } from '@helpdesk/shared';

import { CommentForm } from '../components/comments/CommentForm';
import { CommentThread } from '../components/comments/CommentThread';
import { EmptyState } from '../components/shared/EmptyState';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { AttachmentPanel } from '../components/tickets/AttachmentPanel';
import { TicketDetail } from '../components/tickets/TicketDetail';
import { useComments } from '../hooks/useComments';
import { useTicket } from '../hooks/useTickets';
import { api } from '../services/api';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { ticket, loading, error, setTicket } = useTicket(id);
  const { comments, addComment } = useComments(id);
  const [agents, setAgents] = useState<User[]>([]);

  useEffect(() => {
    api.users.list('AGENT').then((response) => setAgents(response.data));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error || !ticket)
    return <EmptyState title="Ticket unavailable" description={error ?? 'Ticket not found.'} />;

  return (
    <div className="space-y-5">
      <TicketDetail
        agents={agents}
        ticket={ticket}
        onAssign={async (assigneeId) => {
          const response = await api.tickets.assign(ticket.id, assigneeId);
          setTicket(response.data);
        }}
      />
      <AttachmentPanel ticketId={ticket.id} />
      <CommentThread comments={comments} />
      <CommentForm onSubmit={(body, isInternal) => addComment(body, isInternal)} />
    </div>
  );
}
