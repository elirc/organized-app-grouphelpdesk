// Author: Alex Chen
// Issue: Enterprise Sprint 2 - Store ticket attachment metadata

import { PrismaClient } from '@prisma/client';
import { ActivityAction } from '@helpdesk/shared';
import type { AttachmentInput } from '@helpdesk/shared';

import type { CurrentUser } from './authService';
import { createActivityLogService } from './activityLogService';
import { createOutboxService } from './outboxService';
import { NotFoundError, ValidationError } from '../utils/errors';

const defaultPrisma = new PrismaClient();
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_PREFIXES = ['image/', 'text/', 'application/pdf'];

function serializeAttachment<T extends { createdAt: Date }>(attachment: T) {
  return {
    ...attachment,
    createdAt: attachment.createdAt.toISOString(),
  };
}

function assertAllowedAttachment(input: AttachmentInput) {
  if (input.sizeBytes > MAX_ATTACHMENT_BYTES) {
    throw new ValidationError('Attachments must be 25 MB or smaller.');
  }

  const isAllowed = ALLOWED_MIME_PREFIXES.some((prefix) => input.mimeType.startsWith(prefix));
  if (!isAllowed) {
    throw new ValidationError('Attachment MIME type is not allowed.');
  }
}

export function createAttachmentService(prisma = defaultPrisma) {
  const activityLog = createActivityLogService(prisma);
  const outbox = createOutboxService(prisma);

  return {
    async listForTicket(ticketId: string, viewer?: CurrentUser) {
      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        throw new NotFoundError('Ticket could not be found.');
      }

      if (viewer?.organizationId && ticket.organizationId !== viewer.organizationId) {
        throw new NotFoundError('Ticket could not be found.');
      }

      const attachments = await prisma.attachment.findMany({
        where: { ticketId },
        orderBy: { createdAt: 'desc' },
      });

      return attachments.map(serializeAttachment);
    },

    async createForTicket(ticketId: string, input: AttachmentInput, viewer: CurrentUser) {
      assertAllowedAttachment(input);

      const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        throw new NotFoundError('Ticket could not be found.');
      }

      if (viewer.organizationId && ticket.organizationId !== viewer.organizationId) {
        throw new NotFoundError('Ticket could not be found.');
      }

      const storageKey = `tickets/${ticketId}/${Date.now()}-${input.fileName}`;
      const attachment = await prisma.attachment.create({
        data: {
          ticketId,
          commentId: input.commentId ?? null,
          uploadedBy: viewer.id,
          fileName: input.fileName.trim(),
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
          storageKey,
        },
      });

      await activityLog.logActivity(ticketId, viewer.id, ActivityAction.ATTACHMENT_ADDED, {
        attachmentId: attachment.id,
        fileName: attachment.fileName,
      });

      await outbox.enqueue('ticket', ticketId, 'ticket.attachment_added', {
        attachmentId: attachment.id,
        uploadedBy: viewer.id,
      });

      return serializeAttachment(attachment);
    },
  };
}

export const attachmentService = createAttachmentService();
