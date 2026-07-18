// Author: Alex Chen
// Issue: Learning Phase 3 - Define ticket module internal types

import type { Prisma, Ticket, User } from '@prisma/client';
import type { TicketFilters } from '@helpdesk/shared';

export type TicketRecord = Ticket & {
  assignee?: User | null;
  creator?: User;
};

export interface TicketListOptions extends TicketFilters {
  page: number;
  limit: number;
  organizationId?: string | null;
}

export interface TicketListResult {
  tickets: TicketRecord[];
  total: number;
}

export interface TicketRepository {
  findUserById(userId: string): Promise<User | null>;
  findTicketById(id: string): Promise<TicketRecord | null>;
  findTicketForUpdate(id: string): Promise<Ticket | null>;
  listTickets(filters: TicketListOptions): Promise<TicketListResult>;
  createTicket(data: Prisma.TicketUncheckedCreateInput): Promise<Ticket>;
  updateTicket(id: string, data: Prisma.TicketUncheckedUpdateInput): Promise<Ticket>;
  deleteTicket(id: string): Promise<Ticket>;
  createStatusHistory(data: Prisma.TicketStatusHistoryUncheckedCreateInput): Promise<unknown>;
  createAssignmentHistory(
    data: Prisma.TicketAssignmentHistoryUncheckedCreateInput,
  ): Promise<unknown>;
}
