// Author: Alex Chen
// Issue: Enterprise Sprint 1 - Manage SLA policies and escalations

import { PrismaClient, type SlaPolicy, type Ticket } from '@prisma/client';
import { ActivityAction, NotificationType, TicketStatus, UserRole } from '@helpdesk/shared';
import type { Priority, SlaPolicyInput } from '@helpdesk/shared';

import type { CurrentUser } from './authService';
import { createActivityLogService } from './activityLogService';
import { createNotificationService } from './notificationService';
import { createOutboxService } from './outboxService';
import { NotFoundError, ValidationError } from '../utils/errors';

const defaultPrisma = new PrismaClient();

function serializePolicy(policy: SlaPolicy) {
  return {
    ...policy,
    priority: policy.priority as Priority,
    createdAt: policy.createdAt.toISOString(),
    updatedAt: policy.updatedAt.toISOString(),
  };
}

function serializeEscalation<T extends { createdAt: Date }>(escalation: T) {
  return {
    ...escalation,
    createdAt: escalation.createdAt.toISOString(),
  };
}

export function dueDatesForPolicy(
  policy: Pick<SlaPolicy, 'responseHours' | 'resolutionHours'>,
  now = new Date(),
) {
  return {
    firstResponseDueAt: new Date(now.getTime() + policy.responseHours * 3_600_000),
    resolutionDueAt: new Date(now.getTime() + policy.resolutionHours * 3_600_000),
  };
}

export function createSlaService(prisma = defaultPrisma) {
  const activityLog = createActivityLogService(prisma);
  const notifications = createNotificationService(prisma);
  const outbox = createOutboxService(prisma);

  return {
    async listPolicies(viewer?: CurrentUser) {
      const policies = await prisma.slaPolicy.findMany({
        where: viewer?.organizationId ? { organizationId: viewer.organizationId } : undefined,
        orderBy: [{ priority: 'asc' }, { name: 'asc' }],
      });

      return policies.map(serializePolicy);
    },

    async createPolicy(input: SlaPolicyInput, viewer: CurrentUser) {
      const organizationId = input.organizationId ?? viewer.organizationId;

      if (!organizationId) {
        throw new ValidationError('SLA policies require an organization.');
      }

      const policy = await prisma.slaPolicy.create({
        data: {
          name: input.name.trim(),
          priority: input.priority,
          organizationId,
          teamId: input.teamId ?? null,
          responseHours: input.responseHours,
          resolutionHours: input.resolutionHours,
          escalationHours: input.escalationHours,
          isActive: input.isActive ?? true,
        },
      });

      await outbox.enqueue('slaPolicy', policy.id, 'sla.policy.created', {
        priority: policy.priority,
        organizationId,
      });

      return serializePolicy(policy);
    },

    async findPolicyForTicket(input: {
      priority: Priority;
      organizationId: string | null;
      teamId?: string | null;
    }) {
      if (!input.organizationId) return null;
      const teamPolicyFallback = input.teamId
        ? [{ teamId: input.teamId }, { teamId: null }]
        : [{ teamId: null }];

      return prisma.slaPolicy.findFirst({
        where: {
          priority: input.priority,
          organizationId: input.organizationId,
          isActive: true,
          OR: teamPolicyFallback,
        },
        orderBy: [{ teamId: 'desc' }, { createdAt: 'asc' }],
      });
    },

    async markFirstResponse(ticket: Ticket) {
      if (ticket.firstRespondedAt) return ticket;

      return prisma.ticket.update({
        where: { id: ticket.id },
        data: { firstRespondedAt: new Date() },
      });
    },

    async reviewEscalations(viewer: CurrentUser, now = new Date()) {
      const tickets = await prisma.ticket.findMany({
        where: {
          organizationId: viewer.organizationId ?? undefined,
          resolutionDueAt: { lte: now },
          escalatedAt: null,
          status: { notIn: [TicketStatus.RESOLVED, TicketStatus.CLOSED] },
        },
      });

      const admins = await prisma.user.findMany({
        where: {
          organizationId: viewer.organizationId ?? undefined,
          role: UserRole.ADMIN,
        },
        select: { id: true },
      });

      const escalatedTicketIds: string[] = [];

      for (const ticket of tickets) {
        const escalation = await prisma.ticketEscalation.create({
          data: {
            ticketId: ticket.id,
            escalatedBy: viewer.id,
            reason: 'Resolution SLA breached.',
            level: 1,
          },
        });

        await prisma.ticket.update({
          where: { id: ticket.id },
          data: {
            escalatedAt: now,
            slaBreachedAt: now,
          },
        });

        await activityLog.logActivity(ticket.id, viewer.id, ActivityAction.SLA_ESCALATED, {
          escalationId: escalation.id,
          resolutionDueAt: ticket.resolutionDueAt,
        });

        await notifications.notifyUsers(
          admins.map((admin) => admin.id),
          {
            ticketId: ticket.id,
            type: NotificationType.SLA_ESCALATED,
            title: 'SLA escalation',
            body: `Ticket "${ticket.title}" has breached its resolution SLA.`,
          },
        );

        await outbox.enqueue('ticket', ticket.id, 'ticket.sla_escalated', {
          escalationId: escalation.id,
          organizationId: ticket.organizationId,
        });

        escalatedTicketIds.push(ticket.id);
      }

      return {
        reviewedAt: now.toISOString(),
        escalatedTicketIds,
      };
    },

    async listEscalations(ticketId: string) {
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        throw new NotFoundError('Ticket could not be found.');
      }

      const escalations = await prisma.ticketEscalation.findMany({
        where: { ticketId },
        orderBy: { createdAt: 'desc' },
      });

      return escalations.map(serializeEscalation);
    },
  };
}

export const slaService = createSlaService();
