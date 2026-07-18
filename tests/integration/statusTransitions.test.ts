// Author: Morgan Lee
// Issue: #18 â€” Integration-style tests for ticket workflow rules

import { describe, expect, it, vi } from 'vitest';
import { Priority, TicketStatus, UserRole } from '@helpdesk/shared';

import { createTicketService } from '../../packages/server/src/services/ticketService';
import { ValidationError } from '../../packages/server/src/utils/errors';

const ticket = {
  id: 'ticket_1',
  title: 'Example',
  description: 'Example',
  status: TicketStatus.OPEN,
  priority: Priority.MEDIUM,
  createdBy: 'requester_1',
  assigneeId: null,
  organizationId: 'org_helpdesk_demo',
  teamId: null,
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  resolvedAt: null,
  closedAt: null,
};

describe('status transition integration rules', () => {
  it('requires an assignee before moving to IN_PROGRESS', async () => {
    const prisma = {
      user: { findUnique: vi.fn() },
      ticket: {
        findUnique: vi.fn().mockResolvedValue(ticket),
        update: vi.fn(),
      },
      activityLog: { create: vi.fn() },
      eventOutbox: { create: vi.fn() },
      notification: { create: vi.fn() },
      slaPolicy: { findFirst: vi.fn().mockResolvedValue(null) },
    };
    const service = createTicketService(prisma as never);

    await expect(
      service.updateTicket('ticket_1', { status: TicketStatus.IN_PROGRESS }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('requires assignment targets to be agents or admins', async () => {
    const prisma = {
      user: { findUnique: vi.fn().mockResolvedValue({ id: 'user_1', role: UserRole.REQUESTER }) },
      ticket: { findUnique: vi.fn().mockResolvedValue(ticket), update: vi.fn() },
      activityLog: { create: vi.fn() },
      eventOutbox: { create: vi.fn() },
      notification: { create: vi.fn() },
      slaPolicy: { findFirst: vi.fn().mockResolvedValue(null) },
    };
    const service = createTicketService(prisma as never);

    await expect(service.assignTicket('ticket_1', 'user_1', 'user_1')).rejects.toBeInstanceOf(
      ValidationError,
    );
  });
});
