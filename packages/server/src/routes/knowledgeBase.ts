// Author: Morgan Lee
// Issue: #35 â€” Register knowledge base routes

import { Router } from 'express';
import { UserRole } from '@helpdesk/shared';

import {
  createArticle,
  addArticleFeedback,
  approveArticle,
  archiveArticle,
  deleteArticle,
  getArticle,
  listArticleVersions,
  listArticles,
  submitArticle,
  updateArticle,
} from '../controllers/knowledgeBaseController';
import { requireAuth, requireRole } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validateRequest';
import { idParamsSchema, optionalSearchQuerySchema } from '../validation/commonSchemas';
import {
  articleBodySchema,
  articleFeedbackBodySchema,
  updateArticleBodySchema,
} from '../validation/knowledgeBaseSchemas';

export const knowledgeBaseRouter = Router();

knowledgeBaseRouter.post(
  '/',
  validateBody(articleBodySchema),
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  createArticle,
);
knowledgeBaseRouter.get('/', validateQuery(optionalSearchQuerySchema), listArticles);
knowledgeBaseRouter.get('/:id', validateParams(idParamsSchema), getArticle);
knowledgeBaseRouter.get(
  '/:id/versions',
  validateParams(idParamsSchema),
  requireAuth,
  listArticleVersions,
);
knowledgeBaseRouter.post(
  '/:id/feedback',
  validateParams(idParamsSchema),
  validateBody(articleFeedbackBodySchema),
  requireAuth,
  addArticleFeedback,
);
knowledgeBaseRouter.post(
  '/:id/submit',
  validateParams(idParamsSchema),
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  submitArticle,
);
knowledgeBaseRouter.post(
  '/:id/approve',
  validateParams(idParamsSchema),
  requireRole(UserRole.ADMIN),
  approveArticle,
);
knowledgeBaseRouter.post(
  '/:id/archive',
  validateParams(idParamsSchema),
  requireRole(UserRole.ADMIN),
  archiveArticle,
);
knowledgeBaseRouter.patch(
  '/:id',
  validateParams(idParamsSchema),
  validateBody(updateArticleBodySchema),
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  updateArticle,
);
knowledgeBaseRouter.delete(
  '/:id',
  validateParams(idParamsSchema),
  requireRole(UserRole.ADMIN),
  deleteArticle,
);
