// Author: Morgan Lee
// Issue: Enterprise Sprint 2 - Test attachment metadata rules

import { describe, expect, it, vi } from 'vitest';
import { UserRole } from '@helpdesk/shared';

import { createAttachmentService } from '../../packages/server/src/services/attachmentService';
import { ValidationError } from '../../packages/server/src/utils/errors';

const now = new Date('2026-05-20T12:00:00.000Z');
const currentUser = {
  id: 'agent_1',
  name: 'Avery Agent',
  email: 'avery.agent@example.com',
  role: UserRole.AGENT,
  organizationId: 'org_helpdesk_demo',
  teamId: 'team-it',
};

function createMockPrisma() {
  return {
    ticket: {
      findUnique: vi.fn().mockResolvedValue({
        id: 'ticket_1',
        organizationId: 'org_helpdesk_demo',
      }),
    },
    attachment: {
      create: vi.fn().mockResolvedValue({
        id: 'attachment_1',
        ticketId: 'ticket_1',
        commentId: null,
        uploadedBy: 'agent_1',
        fileName: 'diagnostics.txt',
        mimeType: 'text/plain',
        sizeBytes: 1200,
        storageKey: 'tickets/ticket_1/diagnostics.txt',
        createdAt: now,
      }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    activityLog: { create: vi.fn() },
    eventOutbox: {
      create: vi.fn().mockResolvedValue({
        id: 'event_1',
        aggregateType: 'ticket',
        aggregateId: 'ticket_1',
        eventType: 'ticket.attachment_added',
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

describe('attachmentService', () => {
  it('creates attachment metadata and logs side effects', async () => {
    const prisma = createMockPrisma();
    const service = createAttachmentService(prisma as never);

    const attachment = await service.createForTicket(
      'ticket_1',
      {
        fileName: 'diagnostics.txt',
        mimeType: 'text/plain',
        sizeBytes: 1200,
      },
      currentUser,
    );

    expect(attachment.fileName).toBe('diagnostics.txt');
    expect(prisma.activityLog.create).toHaveBeenCalled();
    expect(prisma.eventOutbox.create).toHaveBeenCalled();
  });

  it('rejects unsupported MIME types', async () => {
    const service = createAttachmentService(createMockPrisma() as never);

    await expect(
      service.createForTicket(
        'ticket_1',
        {
          fileName: 'installer.exe',
          mimeType: 'application/x-msdownload',
          sizeBytes: 1200,
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
