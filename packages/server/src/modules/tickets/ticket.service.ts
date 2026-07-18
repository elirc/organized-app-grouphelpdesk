// Author: Alex Chen
// Issue: Learning Phase 3 - Move ticket business rules into a module service

import {
  ActivityAction,
  NotificationType,
  TicketStatus,
  UserRole,
  type CreateTicketInput,
  type TicketFilters,
  type UpdateTicketInput,
} from '@helpdesk/shared';

import type { CurrentUser } from '../../services/authService';
import { createActivityLogService } from '../../services/activityLogService';
import { createNotificationService } from '../../services/notificationService';
import { createOutboxService } from '../../services/outboxService';
import { createSlaService, dueDatesForPolicy } from '../../services/slaService';
import { NotFoundError, ValidationError } from '../../utils/errors';
import { canTransition } from '../../utils/statusMachine';
import { mapTicketToResponse } from './ticket.mapper';
import { canBeAssignedTicket, canMoveToInProgress } from './ticket.permissions';
import { createTicketRepository } from './ticket.repository';
import type { TicketRepository } from './ticket.types';

type AuthenticatedCreateTicketInput = CreateTicketInput & { createdBy: string };

export function createTicketService(
  repository: TicketRepository = createTicketRepository(),
  activityLog = createActivityLogService(),
  integrations = {
    slaService: createSlaService(),
    notificationService: createNotificationService(),
    outboxService: createOutboxService(),
  },
) {
  const { notificationService, outboxService, slaService } = integrations;

  function scopeFilters(filters: TicketFilters, viewer?: CurrentUser): TicketFilters {
    if (!viewer) return filters;

    if (viewer.role === UserRole.CUSTOMER || viewer.role === UserRole.REQUESTER) {
      return { ...filters, createdBy: viewer.id, organizationId: viewer.organizationId };
    }

    if (viewer.role === UserRole.AGENT && viewer.teamId) {
      return { ...filters, teamId: viewer.teamId, organizationId: viewer.organizationId };
    }

    return { ...filters, organizationId: viewer.organizationId };
  }

  function assertCanReadTicket(
    ticket: { createdBy: string; organizationId?: string | null; teamId?: string | null },
    viewer?: CurrentUser,
  ) {
    if (!viewer) return;

    if (viewer.organizationId && ticket.organizationId !== viewer.organizationId) {
      throw new NotFoundError('Ticket could not be found.');
    }

    if (
      (viewer.role === UserRole.CUSTOMER || viewer.role === UserRole.REQUESTER) &&
      ticket.createdBy !== viewer.id
    ) {
      throw new NotFoundError('Ticket could not be found.');
    }
  }

  return {
    async createTicket(input: AuthenticatedCreateTicketInput) {
      const creator = await repository.findUserById(input.createdBy);
      if (!creator) {
        throw new ValidationError('Ticket creator must reference an existing user.');
      }

      if (input.assigneeId) {
        const assignee = await repository.findUserById(input.assigneeId);
        if (!canBeAssignedTicket(assignee)) {
          throw new ValidationError('Assignee must be an agent or admin.');
        }
      }

      const organizationId = input.organizationId ?? creator.organizationId ?? null;
      const teamId = input.teamId ?? creator.teamId ?? null;
      const slaPolicy = await slaService.findPolicyForTicket({
        priority: input.priority,
        organizationId,
        teamId,
      });
      const slaDates = slaPolicy ? dueDatesForPolicy(slaPolicy) : {};

      const ticket = await repository.createTicket({
        title: input.title.trim(),
        description: input.description.trim(),
        priority: input.priority,
        createdBy: input.createdBy,
        assigneeId: input.assigneeId ?? null,
        organizationId,
        teamId,
        slaPolicyId: slaPolicy?.id ?? null,
        ...slaDates,
        tags: JSON.stringify(input.tags ?? []),
      });

      await activityLog.logActivity(ticket.id, input.createdBy, ActivityAction.CREATED, {
        title: ticket.title,
        priority: ticket.priority,
      });

      await outboxService.enqueue('ticket', ticket.id, 'ticket.created', {
        organizationId: ticket.organizationId,
        priority: ticket.priority,
      });

      if (ticket.assigneeId) {
        await notificationService.createNotification({
          userId: ticket.assigneeId,
          ticketId: ticket.id,
          type: NotificationType.TICKET_ASSIGNED,
          title: 'New ticket assigned',
          body: `Ticket "${ticket.title}" was assigned to you.`,
        });
      }

      return mapTicketToResponse(ticket);
    },

    async getTickets(filters: TicketFilters = {}, viewer?: CurrentUser) {
      const page = Math.max(Number(filters.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(filters.limit ?? 20), 1), 100);
      const scopedFilters = scopeFilters(filters, viewer);
      const { total, tickets } = await repository.listTickets({ ...scopedFilters, page, limit });

      return {
        data: tickets.map(mapTicketToResponse),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    },

    async getTicketById(id: string, viewer?: CurrentUser) {
      const ticket = await repository.findTicketById(id);
      if (!ticket) {
        throw new NotFoundError('Ticket could not be found.');
      }

      assertCanReadTicket(ticket, viewer);
      return mapTicketToResponse(ticket);
    },

    async updateTicket(id: string, input: UpdateTicketInput, viewer?: CurrentUser) {
      const existing = await repository.findTicketForUpdate(id);
      if (!existing) {
        throw new NotFoundError('Ticket could not be found.');
      }
      assertCanReadTicket(existing, viewer);

      if (input.assigneeId) {
        const assignee = await repository.findUserById(input.assigneeId);
        if (!canBeAssignedTicket(assignee)) {
          throw new ValidationError('Assignee must be an agent or admin.');
        }
      }

      if (
        input.status &&
        !canTransition(existing.status as TicketStatus, input.status as TicketStatus)
      ) {
        throw new ValidationError(
          `Cannot transition ticket from ${existing.status} to ${input.status}.`,
        );
      }

      if (
        input.status === TicketStatus.IN_PROGRESS &&
        !canMoveToInProgress(input.assigneeId ?? existing.assigneeId)
      ) {
        throw new ValidationError('Moving a ticket to IN_PROGRESS requires an assignee.');
      }

      const now = new Date();
      const ticket = await repository.updateTicket(id, {
        title: input.title?.trim(),
        description: input.description?.trim(),
        status: input.status,
        priority: input.priority,
        assigneeId: input.assigneeId,
        teamId: input.teamId,
        organizationId: input.organizationId,
        firstRespondedAt:
          input.status === TicketStatus.IN_PROGRESS && !existing.firstRespondedAt ? now : undefined,
        tags: input.tags ? JSON.stringify(input.tags) : undefined,
        resolvedAt: input.status === TicketStatus.RESOLVED ? now : undefined,
        closedAt: input.status === TicketStatus.CLOSED ? now : undefined,
      });

      const actorId = input.actorId ?? existing.createdBy;
      if (input.status && input.status !== existing.status) {
        await repository.createStatusHistory({
          ticketId: ticket.id,
          changedBy: actorId,
          fromStatus: existing.status,
          toStatus: input.status,
        });
        await activityLog.logActivity(ticket.id, actorId, ActivityAction.STATUS_CHANGE, {
          from: existing.status,
          to: input.status,
        });
        await outboxService.enqueue('ticket', ticket.id, 'ticket.status_changed', {
          from: existing.status,
          to: input.status,
        });
      } else if (input.assigneeId !== undefined && input.assigneeId !== existing.assigneeId) {
        await repository.createAssignmentHistory({
          ticketId: ticket.id,
          changedBy: actorId,
          fromAssigneeId: existing.assigneeId,
          toAssigneeId: input.assigneeId,
        });
        await activityLog.logActivity(ticket.id, actorId, ActivityAction.ASSIGNED, {
          from: existing.assigneeId,
          to: input.assigneeId,
        });
        if (input.assigneeId) {
          await notificationService.createNotification({
            userId: input.assigneeId,
            ticketId: ticket.id,
            type: NotificationType.TICKET_ASSIGNED,
            title: 'Ticket assigned',
            body: `Ticket "${ticket.title}" was assigned to you.`,
          });
        }
      } else {
        await activityLog.logActivity(ticket.id, actorId, ActivityAction.UPDATED, input);
      }

      return mapTicketToResponse(ticket);
    },

    async assignTicket(id: string, assigneeId: string, actorId: string, viewer?: CurrentUser) {
      const assignee = await repository.findUserById(assigneeId);
      if (!canBeAssignedTicket(assignee)) {
        throw new ValidationError('Assignee must be an agent or admin.');
      }

      return this.updateTicket(id, { assigneeId, actorId }, viewer);
    },

    async deleteTicket(id: string, viewer?: CurrentUser) {
      const existing = await repository.findTicketForUpdate(id);
      if (!existing) {
        throw new NotFoundError('Ticket could not be found.');
      }
      assertCanReadTicket(existing, viewer);

      await repository.deleteTicket(id);

      return {
        data: {
          id,
          deleted: true,
        },
      };
    },
  };
}

export const ticketService = createTicketService();
