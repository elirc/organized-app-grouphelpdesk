// Author: Alex Chen
// Issue: #12 â€” Map comment HTTP requests to service operations

import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@helpdesk/shared';

import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from '../middleware/validateRequest';
import { commentService } from '../services/commentService';
import type { TicketIdParams } from '../validation/commonSchemas';
import type { CreateCommentBody, ListCommentsQuery } from '../validation/commentSchemas';

export async function createComment(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<TicketIdParams>(res);
    const body = getValidatedBody<CreateCommentBody>(res);
    const comment = await commentService.createComment(
      params.ticketId,
      req.currentUser!.id,
      body.body,
      body.isInternal,
    );

    res.status(201).json({ data: comment });
  } catch (error) {
    next(error);
  }
}

export async function listComments(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<TicketIdParams>(res);
    const query = getValidatedQuery<ListCommentsQuery>(res);
    const comments = await commentService.getComments(
      params.ticketId,
      query.includeInternal,
      req.currentUser!.role as UserRole,
    );

    res.json({ data: comments });
  } catch (error) {
    next(error);
  }
}
