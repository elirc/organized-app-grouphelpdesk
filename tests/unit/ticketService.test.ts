// Author: Morgan Lee
// Issue: #10 â€” Test ticket service with mocked Prisma

import { describe, expect, it, vi } from 'vitest';
import { Priority, TicketStatus, UserRole } from '@helpdesk/shared';

import { createTicketService } from '../../packages/server/src/services/ticketService';
import { NotFoundError, ValidationError } from '../../packages/server/src/utils/errors';

const now = new Date('2026-05-20T12:00:00.000Z');

function mockTicket(overrides = {}) {
  return {
    id: 'ticket_1',
    title: 'Example',
    description: 'Example description',
    status: TicketStatus.OPEN,
    priority: Priority.MEDIUM,
    createdBy: 'user_requester_1',
    assigneeId: null,
    organizationId: 'org_helpdesk_demo',
    teamId: null,
    tags: ['access'],
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    closedAt: null,
    slaPolicyId: null,
    firstResponseDueAt: null,
    resolutionDueAt: null,
    firstRespondedAt: null,
    escalatedAt: null,
    slaBreachedAt: null,
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'user_requester_1',
        role: UserRole.REQUESTER,
        organizationId: 'org_helpdesk_demo',
        teamId: null,
      }),
    },
    ticket: {
      create: vi.fn().mockResolvedValue(mockTicket()),
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([mockTicket()]),
      findUnique: vi.fn().mockResolvedValue(mockTicket()),
      update: vi
        .fn()
        .mockResolvedValue(mockTicket({ status: TicketStatus.IN_PROGRESS, assigneeId: 'agent_1' })),
      delete: vi.fn().mockResolvedValue(mockTicket()),
    },
    activityLog: {
      create: vi.fn().mockResolvedValue({ id: 'activity_1' }),
    },
    slaPolicy: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    eventOutbox: {
      create: vi.fn().mockResolvedValue({
        id: 'event_1',
        aggregateType: 'ticket',
        aggregateId: 'ticket_1',
        eventType: 'ticket.created',
        payload: '{}',
        status: 'PENDING',
        attempts: 0,
        nextAttemptAt: null,
        processedAt: null,
        createdAt: now,
      }),
    },
    notification: {
      create: vi.fn().mockResolvedValue({
        id: 'notification_1',
        userId: 'agent_1',
        ticketId: 'ticket_1',
        type: 'TICKET_ASSIGNED',
        title: 'Ticket assigned',
        body: 'Assigned',
        readAt: null,
        createdAt: now,
      }),
    },
    ticketStatusHistory: {
      create: vi.fn().mockResolvedValue({ id: 'status_history_1' }),
    },
    ticketAssignmentHistory: {
      create: vi.fn().mockResolvedValue({ id: 'assignment_history_1' }),
    },
  };
}

describe('ticketService', () => {
  it('creates a ticket and writes an activity log entry', async () => {
    const prisma = createMockPrisma();
    const service = createTicketService(prisma as never);

    const ticket = await service.createTicket({
      title: 'Need help',
      description: 'Something is broken',
      priority: Priority.HIGH,
      createdBy: 'user_requester_1',
      tags: ['help'],
    });

    expect(ticket.title).toBe('Example');
    expect(prisma.ticket.create).toHaveBeenCalled();
    expect(prisma.activityLog.create).toHaveBeenCalled();
    expect(prisma.eventOutbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        aggregateType: 'ticket',
        aggregateId: 'ticket_1',
        eventType: 'ticket.created',
      }),
    });
  });

  it('applies SLA policy snapshots when creating a ticket', async () => {
    const prisma = createMockPrisma();
    prisma.slaPolicy.findFirst.mockResolvedValueOnce({
      id: 'sla_high',
      name: 'High SLA',
      priority: Priority.HIGH,
      organizationId: 'org_helpdesk_demo',
      teamId: null,
      responseHours: 4,
      resolutionHours: 24,
      escalationHours: 6,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const service = createTicketService(prisma as never);

    await service.createTicket({
      title: 'Need help',
      description: 'Something is broken',
      priority: Priority.HIGH,
      createdBy: 'user_requester_1',
      tags: ['help'],
    });

    expect(prisma.ticket.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slaPolicyId: 'sla_high',
        firstResponseDueAt: expect.any(Date),
        resolutionDueAt: expect.any(Date),
      }),
    });
  });

  it('scopes customer ticket lists to their own organization and requester id', async () => {
    const prisma = createMockPrisma();
    const service = createTicketService(prisma as never);

    await service.getTickets(
      {},
      {
        id: 'user_requester_1',
        name: 'Riley Requester',
        email: 'riley.requester@example.com',
        role: UserRole.CUSTOMER,
        organizationId: 'org_helpdesk_demo',
        teamId: null,
      },
    );

    expect(prisma.ticket.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        createdBy: 'user_requester_1',
        organizationId: 'org_helpdesk_demo',
      }),
    });
  });

  it('scopes agent ticket lists to their team and organization', async () => {
    const prisma = createMockPrisma();
    const service = createTicketService(prisma as never);

    await service.getTickets(
      {},
      {
        id: 'agent_1',
        name: 'Avery Agent',
        email: 'avery.agent@example.com',
        role: UserRole.AGENT,
        organizationId: 'org_helpdesk_demo',
        teamId: 'team-it',
      },
    );

    expect(prisma.ticket.count).toHaveBeenCalledWith({
      where: expect.objectContaining({
        organizationId: 'org_helpdesk_demo',
        teamId: 'team-it',
      }),
    });
  });

  it('hides cross-organization ticket details as not found', async () => {
    const prisma = createMockPrisma();
    prisma.ticket.findUnique.mockResolvedValueOnce(
      mockTicket({ organizationId: 'org_other_company' }),
    );
    const service = createTicketService(prisma as never);

    await expect(
      service.getTicketById('ticket_1', {
        id: 'admin_1',
        name: 'Casey Admin',
        email: 'casey.admin@example.com',
        role: UserRole.ADMIN,
        organizationId: 'org_helpdesk_demo',
        teamId: 'team-ops',
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('rejects a ticket when the creator does not exist', async () => {
    const prisma = createMockPrisma();
    prisma.user.findUnique.mockResolvedValueOnce(null);
    const service = createTicketService(prisma as never);

    await expect(
      service.createTicket({
        title: 'Need help',
        description: 'The requester id does not exist',
        priority: Priority.LOW,
        createdBy: 'missing_user',
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it('throws not found when updating a missing ticket', async () => {
    const prisma = createMockPrisma();
    prisma.ticket.findUnique.mockResolvedValueOnce(null);
    const service = createTicketService(prisma as never);

    await expect(service.updateTicket('missing', { title: 'Nope' })).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('records structured history when a ticket status changes', async () => {
    const prisma = createMockPrisma();
    prisma.ticket.findUnique.mockResolvedValueOnce(
      mockTicket({ status: TicketStatus.IN_PROGRESS, assigneeId: 'agent_1' }),
    );
    prisma.ticket.update.mockResolvedValueOnce(
      mockTicket({ status: TicketStatus.RESOLVED, assigneeId: 'agent_1' }),
    );
    const service = createTicketService(prisma as never);

    await service.updateTicket('ticket_1', {
      status: TicketStatus.RESOLVED,
      actorId: 'user_agent_1',
    });

    expect(prisma.ticketStatusHistory.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ticketId: 'ticket_1',
        changedBy: 'user_agent_1',
        fromStatus: TicketStatus.IN_PROGRESS,
        toStatus: TicketStatus.RESOLVED,
      }),
    });
    expect(prisma.eventOutbox.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        aggregateType: 'ticket',
        aggregateId: 'ticket_1',
        eventType: 'ticket.status_changed',
      }),
    });
  });
});
