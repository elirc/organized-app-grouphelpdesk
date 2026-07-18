// Author: Alex Chen
// Issue: Learning Phase 3 - Keep ticket Prisma queries behind a repository

import { PrismaClient, type Prisma } from '@prisma/client';
import type { Priority, TicketStatus } from '@helpdesk/shared';

import type { TicketListOptions, TicketRepository } from './ticket.types';

const defaultPrisma = new PrismaClient();

function listValue<T>(value?: T | T[]): T[] | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value : [value];
}

function buildTicketWhere(filters: TicketListOptions): Prisma.TicketWhereInput {
  const statuses = listValue(filters.status) as TicketStatus[] | undefined;
  const priorities = listValue(filters.priority) as Priority[] | undefined;

  return {
    status: statuses ? { in: statuses } : undefined,
    priority: priorities ? { in: priorities } : undefined,
    assigneeId: filters.assigneeId || undefined,
    createdBy: filters.createdBy || undefined,
    organizationId: filters.organizationId || undefined,
    teamId: filters.teamId || undefined,
    OR: filters.search
      ? [{ title: { contains: filters.search } }, { description: { contains: filters.search } }]
      : undefined,
  };
}

export function createTicketRepository(prisma = defaultPrisma): TicketRepository {
  return {
    findUserById(userId) {
      return prisma.user.findUnique({ where: { id: userId } });
    },

    findTicketById(id) {
      return prisma.ticket.findUnique({
        where: { id },
        include: {
          assignee: true,
          creator: true,
        },
      });
    },

    findTicketForUpdate(id) {
      return prisma.ticket.findUnique({ where: { id } });
    },

    async listTickets(filters) {
      const page = Math.max(Number(filters.page ?? 1), 1);
      const limit = Math.min(Math.max(Number(filters.limit ?? 20), 1), 100);
      const skip = (page - 1) * limit;
      const where = buildTicketWhere({ ...filters, page, limit });

      const [total, tickets] = await Promise.all([
        prisma.ticket.count({ where }),
        prisma.ticket.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            assignee: true,
            creator: true,
          },
        }),
      ]);

      return { total, tickets };
    },

    createTicket(data) {
      return prisma.ticket.create({ data });
    },

    updateTicket(id, data) {
      return prisma.ticket.update({ where: { id }, data });
    },

    deleteTicket(id) {
      return prisma.ticket.delete({ where: { id } });
    },

    createStatusHistory(data) {
      return prisma.ticketStatusHistory.create({ data });
    },

    createAssignmentHistory(data) {
      return prisma.ticketAssignmentHistory.create({ data });
    },
  };
}
