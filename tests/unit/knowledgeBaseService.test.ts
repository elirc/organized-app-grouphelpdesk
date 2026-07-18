// Author: Morgan Lee
// Issue: Enterprise Sprint 2 - Test knowledge base lifecycle

import { describe, expect, it, vi } from 'vitest';
import { ArticleStatus } from '@helpdesk/shared';

import { createKnowledgeBaseService } from '../../packages/server/src/services/knowledgeBaseService';

const now = new Date('2026-05-20T12:00:00.000Z');

function article(overrides = {}) {
  return {
    id: 'article_1',
    title: 'VPN reset',
    body: '# Reset VPN',
    category: 'Network',
    status: ArticleStatus.DRAFT,
    tags: JSON.stringify(['vpn']),
    authorId: 'admin_1',
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    article: {
      findUnique: vi.fn().mockResolvedValue(article()),
      findMany: vi.fn().mockResolvedValue([article()]),
      create: vi.fn().mockResolvedValue(article()),
      update: vi.fn().mockResolvedValue(article({ status: ArticleStatus.IN_REVIEW })),
      delete: vi.fn(),
    },
    articleVersion: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 'version_1' }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    articleFeedback: {
      create: vi.fn().mockResolvedValue({
        id: 'feedback_1',
        articleId: 'article_1',
        userId: 'user_1',
        helpful: true,
        comment: null,
        createdAt: now,
      }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue({ id: 'admin_1', organizationId: 'org_helpdesk_demo' }),
      findMany: vi.fn().mockResolvedValue([{ id: 'admin_1' }]),
    },
    notification: {
      create: vi.fn().mockResolvedValue({
        id: 'notification_1',
        userId: 'admin_1',
        ticketId: null,
        type: 'ARTICLE_REVIEW_REQUESTED',
        title: 'Article ready for review',
        body: 'Review',
        readAt: null,
        createdAt: now,
      }),
    },
    eventOutbox: {
      create: vi.fn().mockResolvedValue({
        id: 'event_1',
        aggregateType: 'article',
        aggregateId: 'article_1',
        eventType: 'article.review_requested',
        payload: '{}',
        status: 'PENDING',
        attempts: 0,
        nextAttemptAt: null,
        processedAt: null,
        createdAt: now,
      }),
    },
    activityLog: { create: vi.fn() },
  };
}

describe('knowledgeBaseService', () => {
  it('creates an article version before updating article content', async () => {
    const prisma = createMockPrisma();
    const service = createKnowledgeBaseService(prisma as never);

    await service.updateArticle('article_1', { title: 'Updated VPN reset' }, 'admin_1');

    expect(prisma.articleVersion.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        articleId: 'article_1',
        versionNumber: 1,
      }),
    });
    expect(prisma.article.update).toHaveBeenCalled();
  });

  it('moves draft articles into review', async () => {
    const prisma = createMockPrisma();
    const service = createKnowledgeBaseService(prisma as never);

    const result = await service.submitForReview('article_1', 'admin_1');

    expect(result.status).toBe(ArticleStatus.IN_REVIEW);
    expect(prisma.notification.create).toHaveBeenCalled();
    expect(prisma.eventOutbox.create).toHaveBeenCalled();
  });
});
