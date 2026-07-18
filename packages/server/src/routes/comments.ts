// Author: Alex Chen
// Issue: #12 â€” Register ticket comment routes

import { Router } from 'express';

import { createComment, listComments } from '../controllers/commentController';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../middleware/validateRequest';
import { ticketIdParamsSchema } from '../validation/commonSchemas';
import { createCommentBodySchema, listCommentsQuerySchema } from '../validation/commentSchemas';

export const commentRouter = Router({ mergeParams: true });

commentRouter.post(
  '/',
  validateParams(ticketIdParamsSchema),
  validateBody(createCommentBodySchema),
  requireAuth,
  createComment,
);
commentRouter.get(
  '/',
  validateParams(ticketIdParamsSchema),
  validateQuery(listCommentsQuerySchema),
  requireAuth,
  listComments,
);
