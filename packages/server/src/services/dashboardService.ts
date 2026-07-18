// Author: Alex Chen
// Issue: #31 â€” Aggregate dashboard metrics from transactional data

import { PrismaClient } from '@prisma/client';
import { Priority, TicketStatus } from '@helpdesk/shared';

import { getSystemMetrics } from '../middleware/responseTime';

const defaultPrisma = new PrismaClient();

function tagList(tags: unknown): string[] {
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags) as unknown;
      return Array.isArray(parsed)
        ? parsed.filter((tag): tag is string => typeof tag === 'string')
        : [];
    } catch {
      return [];
    }
  }

  return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : [];
}

export function createDashboardService(prisma = defaultPrisma) {
  return {
    async getMetrics() {
      const [
        openTicketCount,
        inProgressCount,
        breachedSlaCount,
        escalatedTicketCount,
        resolvedTickets,
        allTickets,
        priorityGroups,
      ] = await Promise.all([
        prisma.ticket.count({ where: { status: TicketStatus.OPEN } }),
        prisma.ticket.count({ where: { status: TicketStatus.IN_PROGRESS } }),
        prisma.ticket.count({ where: { slaBreachedAt: { not: null } } }),
        prisma.ticket.count({ where: { escalatedAt: { not: null } } }),
        prisma.ticket.findMany({
          where: {
            OR: [{ resolvedAt: { not: null } }, { closedAt: { not: null } }],
          },
          select: { createdAt: true, resolvedAt: true, closedAt: true },
        }),
        prisma.ticket.findMany({ select: { tags: true } }),
        prisma.ticket.groupBy({
          by: ['priority'],
          _count: { priority: true },
        }),
      ]);

      const avgResolutionTimeHours =
        resolvedTickets.length === 0
          ? 0
          : resolvedTickets.reduce((sum, ticket) => {
              const finishedAt = ticket.resolvedAt ?? ticket.closedAt ?? new Date();
              return sum + (finishedAt.getTime() - ticket.createdAt.getTime()) / 3_600_000;
            }, 0) / resolvedTickets.length;

      const ticketsByPriority = {
        [Priority.LOW]: 0,
        [Priority.MEDIUM]: 0,
        [Priority.HIGH]: 0,
        [Priority.URGENT]: 0,
      };

      for (const group of priorityGroups) {
        ticketsByPriority[group.priority as Priority] = group._count.priority;
      }

      const categoryCounts = new Map<string, number>();
      for (const ticket of allTickets) {
        for (const tag of tagList(ticket.tags)) {
          categoryCounts.set(tag, (categoryCounts.get(tag) ?? 0) + 1);
        }
      }

      return {
        openTicketCount,
        inProgressCount,
        avgResolutionTimeHours,
        breachedSlaCount,
        escalatedTicketCount,
        ticketsByPriority,
        ticketsByCategory: [...categoryCounts.entries()].map(([category, count]) => ({
          category,
          count,
        })),
      };
    },

    async getActivity() {
      return prisma.activityLog.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          ticket: { select: { title: true } },
          user: { select: { name: true } },
        },
      });
    },

    async getAgentWorkload() {
      const agents = await prisma.user.findMany({
        where: { role: { in: ['AGENT', 'ADMIN'] } },
        include: {
          assignedTickets: {
            where: { status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] } },
            select: { status: true },
          },
        },
        orderBy: { name: 'asc' },
      });

      return agents.map((agent) => {
        const openTicketCount = agent.assignedTickets.filter(
          (ticket) => ticket.status === TicketStatus.OPEN,
        ).length;
        const inProgressTicketCount = agent.assignedTickets.filter(
          (ticket) => ticket.status === TicketStatus.IN_PROGRESS,
        ).length;

        return {
          agentId: agent.id,
          agentName: agent.name,
          openTicketCount,
          inProgressTicketCount,
          totalActiveTickets: openTicketCount + inProgressTicketCount,
        };
      });
    },

    getSystemHealth() {
      return {
        status: 'ok',
        uptime: process.uptime(),
        ...getSystemMetrics(),
      };
    },
  };
}

export const dashboardService = createDashboardService();
