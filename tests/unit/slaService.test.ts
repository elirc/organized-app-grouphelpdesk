// Author: Morgan Lee
// Issue: Enterprise Sprint 1 - Test SLA escalation workflow

import { describe, expect, it, vi } from 'vitest';
import { Priority, TicketStatus, UserRole } from '@helpdesk/shared';

import { createSlaService } from '../../packages/server/src/services/slaService';

const now = new Date('2026-05-20T12:00:00.000Z');

function createMockPrisma() {
  return {
    slaPolicy: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    ticket: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 'ticket_1',
          title: 'Payroll outage',
          status: TicketStatus.IN_PROGRESS,
          priority: Priority.HIGH,
          createdBy: 'requester_1',
          assigneeId: 'agent_1',
          organizationId: 'org_helpdesk_demo',
          teamId: 'team-it',
          resolutionDueAt: new Date('2026-05-20T10:00:00.000Z'),
        },
      ]),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findMany: vi.fn().mockResolvedValue([{ id: 'admin_1' }]),
    },
    ticketEscalation: {
      create: vi.fn().mockResolvedValue({
        id: 'escalation_1',
        ticketId: 'ticket_1',
        escalatedBy: 'admin_1',
        level: 1,
        reason: 'Resolution SLA breached.',
        createdAt: now,
      }),
      findMany: vi.fn(),
    },
    activityLog: { create: vi.fn() },
    notification: {
      create: vi.fn().mockResolvedValue({
        id: 'notification_1',
        userId: 'admin_1',
        ticketId: 'ticket_1',
        type: 'SLA_ESCALATED',
        title: 'SLA escalation',
        body: 'Breached',
        readAt: null,
        createdAt: now,
      }),
    },
    eventOutbox: {
      create: vi.fn().mockResolvedValue({
        id: 'event_1',
        aggregateType: 'ticket',
        aggregateId: 'ticket_1',
        eventType: 'ticket.sla_escalated',
        payload: '{}',
        status: 'PENDING',
        attempts: 0,
        nextAttemptAt: null,
        processedAt: null,
        createdAt: now,
      }),
    },
  };
}

describe('slaService', () => {
  it('looks up team-specific policies with organization fallback', async () => {
    const prisma = createMockPrisma();
    const service = createSlaService(prisma as never);

    await service.findPolicyForTicket({
      priority: Priority.HIGH,
      organizationId: 'org_helpdesk_demo',
      teamId: 'team-it',
    });

    expect(prisma.slaPolicy.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        organizationId: 'org_helpdesk_demo',
        priority: Priority.HIGH,
        OR: [{ teamId: 'team-it' }, { teamId: null }],
      }),
      orderBy: [{ teamId: 'desc' }, { createdAt: 'asc' }],
    });
  });

  it('does not match unrelated team policies when a ticket has no team', async () => {
    const prisma = createMockPrisma();
    const service = createSlaService(prisma as never);

    await service.findPolicyForTicket({
      priority: Priority.HIGH,
      organizationId: 'org_helpdesk_demo',
      teamId: null,
    });

    expect(prisma.slaPolicy.findFirst).toHaveBeenCalledWith({
      where: expect.objectContaining({
        OR: [{ teamId: null }],
      }),
      orderBy: [{ teamId: 'desc' }, { createdAt: 'asc' }],
    });
  });

  it('escalates overdue tickets and notifies admins', async () => {
    const prisma = createMockPrisma();
    const service = createSlaService(prisma as never);

    const result = await service.reviewEscalations(
      {
        id: 'admin_1',
        name: 'Casey Admin',
        email: 'casey.admin@example.com',
        role: UserRole.ADMIN,
        organizationId: 'org_helpdesk_demo',
        teamId: 'team-ops',
      },
      now,
    );

    expect(result.escalatedTicketIds).toEqual(['ticket_1']);
    expect(prisma.ticketEscalation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ ticketId: 'ticket_1' }),
    });
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(prisma.eventOutbox.create).toHaveBeenCalled();
  });
});
