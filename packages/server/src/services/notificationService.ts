// Author: Jordan Park
// Issue: Enterprise Sprint 2 - Store user-facing notifications

import { PrismaClient } from '@prisma/client';
import type { NotificationType } from '@helpdesk/shared';

import { NotFoundError } from '../utils/errors';
import { createOutboxService } from './outboxService';

const defaultPrisma = new PrismaClient();

function serializeNotification<T extends { createdAt: Date; readAt: Date | null }>(
  notification: T,
) {
  return {
    ...notification,
    createdAt: notification.createdAt.toISOString(),
    readAt: notification.readAt?.toISOString() ?? null,
  };
}

export function createNotificationService(prisma = defaultPrisma) {
  const outbox = createOutboxService(prisma);

  return {
    async createNotification(input: {
      userId: string;
      ticketId?: string | null;
      type: NotificationType;
      title: string;
      body: string;
    }) {
      const notification = await prisma.notification.create({
        data: {
          userId: input.userId,
          ticketId: input.ticketId ?? null,
          type: input.type,
          title: input.title,
          body: input.body,
        },
      });

      await outbox.enqueue('notification', notification.id, 'notification.created', {
        userId: input.userId,
        ticketId: input.ticketId ?? null,
        type: input.type,
      });

      return serializeNotification(notification);
    },

    async notifyUsers(
      userIds: string[],
      input: {
        ticketId?: string | null;
        type: NotificationType;
        title: string;
        body: string;
      },
    ) {
      const uniqueUserIds = [...new Set(userIds.filter(Boolean))];
      return Promise.all(
        uniqueUserIds.map((userId) =>
          this.createNotification({
            ...input,
            userId,
          }),
        ),
      );
    },

    async listForUser(userId: string) {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return notifications.map(serializeNotification);
    },

    async markRead(id: string, userId: string) {
      const existing = await prisma.notification.findFirst({ where: { id, userId } });
      if (!existing) {
        throw new NotFoundError('Notification could not be found.');
      }

      const notification = await prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      });

      return serializeNotification(notification);
    },
  };
}

export const notificationService = createNotificationService();
