// Author: Morgan Lee
// Issue: #35 â€” Implement knowledge base article business logic

import { PrismaClient } from '@prisma/client';
import { ArticleStatus, NotificationType, UserRole } from '@helpdesk/shared';
import type { ArticleInput } from '@helpdesk/shared';

import { NotFoundError, ValidationError } from '../utils/errors';
import { createNotificationService } from './notificationService';
import { createOutboxService } from './outboxService';

const defaultPrisma = new PrismaClient();

type AuthenticatedArticleInput = ArticleInput & { authorId: string };

function tagsFromJson(tags: unknown): string[] {
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

function serializeArticle<T extends { tags: unknown; createdAt: Date; updatedAt: Date }>(
  article: T,
) {
  return {
    ...article,
    tags: tagsFromJson(article.tags),
    status: 'status' in article ? article.status : ArticleStatus.DRAFT,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  };
}

function serializeVersion<T extends { tags: unknown; createdAt: Date }>(version: T) {
  return {
    ...version,
    tags: tagsFromJson(version.tags),
    createdAt: version.createdAt.toISOString(),
  };
}

function serializeFeedback<T extends { createdAt: Date }>(feedback: T) {
  return {
    ...feedback,
    createdAt: feedback.createdAt.toISOString(),
  };
}

export function createKnowledgeBaseService(prisma = defaultPrisma) {
  const notifications = createNotificationService(prisma);
  const outbox = createOutboxService(prisma);

  return {
    async listArticles(search?: string) {
      const articles = await prisma.article.findMany({
        where: search
          ? {
              OR: [{ title: { contains: search } }, { category: { contains: search } }],
            }
          : undefined,
        orderBy: { updatedAt: 'desc' },
      });

      const normalized = articles.map(serializeArticle);
      return search
        ? normalized.filter((article) =>
            [article.title, article.category, ...article.tags].some((value) =>
              value.toLowerCase().includes(search.toLowerCase()),
            ),
          )
        : normalized;
    },

    async getArticle(id: string) {
      const article = await prisma.article.findUnique({ where: { id } });
      if (!article) {
        throw new NotFoundError('Article could not be found.');
      }

      return serializeArticle(article);
    },

    async createArticle(input: AuthenticatedArticleInput) {
      if (!input.title.trim() || !input.body.trim() || !input.category.trim()) {
        throw new ValidationError('Title, body, and category are required.');
      }

      const author = await prisma.user.findUnique({ where: { id: input.authorId } });
      if (!author) {
        throw new ValidationError('Article author must reference an existing user.');
      }

      const article = await prisma.article.create({
        data: {
          title: input.title.trim(),
          body: input.body.trim(),
          category: input.category.trim(),
          status: input.status ?? ArticleStatus.DRAFT,
          tags: JSON.stringify(input.tags ?? []),
          authorId: input.authorId,
        },
      });

      return serializeArticle(article);
    },

    async updateArticle(id: string, input: Partial<ArticleInput>, actorId?: string) {
      const existing = await prisma.article.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundError('Article could not be found.');
      }

      if (actorId) {
        const latest = await prisma.articleVersion.findFirst({
          where: { articleId: id },
          orderBy: { versionNumber: 'desc' },
        });

        await prisma.articleVersion.create({
          data: {
            articleId: id,
            versionNumber: (latest?.versionNumber ?? 0) + 1,
            title: existing.title,
            body: existing.body,
            category: existing.category,
            tags: existing.tags,
            createdBy: actorId,
          },
        });
      }

      const article = await prisma.article.update({
        where: { id },
        data: {
          title: input.title?.trim(),
          body: input.body?.trim(),
          category: input.category?.trim(),
          status: input.status,
          tags: input.tags ? JSON.stringify(input.tags) : undefined,
        },
      });

      return serializeArticle(article);
    },

    async deleteArticle(id: string) {
      await this.getArticle(id);
      await prisma.article.delete({ where: { id } });
      return { id, deleted: true };
    },

    async submitForReview(id: string, actorId: string) {
      const article = await prisma.article.update({
        where: { id },
        data: { status: ArticleStatus.IN_REVIEW },
      });
      const author = await prisma.user.findUnique({ where: { id: article.authorId } });
      const admins = await prisma.user.findMany({
        where: {
          organizationId: author?.organizationId ?? undefined,
          role: UserRole.ADMIN,
        },
        select: { id: true },
      });

      await notifications.notifyUsers(
        admins.map((admin) => admin.id),
        {
          type: NotificationType.ARTICLE_REVIEW_REQUESTED,
          title: 'Article ready for review',
          body: `"${article.title}" is waiting for approval.`,
        },
      );
      await outbox.enqueue('article', article.id, 'article.review_requested', { actorId });

      return serializeArticle(article);
    },

    async approveArticle(id: string, actorId: string) {
      const article = await prisma.article.update({
        where: { id },
        data: { status: ArticleStatus.PUBLISHED },
      });

      await outbox.enqueue('article', article.id, 'article.published', { actorId });

      return serializeArticle(article);
    },

    async archiveArticle(id: string) {
      const article = await prisma.article.update({
        where: { id },
        data: { status: ArticleStatus.ARCHIVED },
      });

      return serializeArticle(article);
    },

    async listVersions(id: string) {
      await this.getArticle(id);
      const versions = await prisma.articleVersion.findMany({
        where: { articleId: id },
        orderBy: { versionNumber: 'desc' },
      });

      return versions.map(serializeVersion);
    },

    async addFeedback(id: string, userId: string, helpful: boolean, comment?: string) {
      await this.getArticle(id);
      const feedback = await prisma.articleFeedback.create({
        data: {
          articleId: id,
          userId,
          helpful,
          comment: comment?.trim() || null,
        },
      });

      return serializeFeedback(feedback);
    },
  };
}

export const knowledgeBaseService = createKnowledgeBaseService();
