// Author: Alex Chen
// Issue: Enterprise Sprint 2 - Register ticket attachment routes

import { Router } from 'express';

import { createAttachment, listAttachments } from '../controllers/attachmentController';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validateRequest';
import { ticketIdParamsSchema } from '../validation/commonSchemas';
import { attachmentBodySchema } from '../validation/attachmentSchemas';

export const attachmentRouter = Router({ mergeParams: true });

attachmentRouter.use(validateParams(ticketIdParamsSchema), requireAuth);
attachmentRouter.get('/', listAttachments);
attachmentRouter.post('/', validateBody(attachmentBodySchema), createAttachment);
