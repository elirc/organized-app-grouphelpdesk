// Author: Alex Chen
// Issue: #31 â€” Record ticket activity for audit trails

import { PrismaClient } from '@prisma/client';
import type { ActivityAction } from '@helpdesk/shared';

const defaultPrisma = new PrismaClient();

export function createActivityLogService(prisma = defaultPrisma) {
  return {
    async logActivity(ticketId: string, userId: string, action: ActivityAction, details: unknown) {
      return prisma.activityLog.create({
        data: {
          ticketId,
          userId,
          action,
          details: JSON.stringify(details),
        },
      });
    },
  };
}

export const activityLogService = createActivityLogService();
