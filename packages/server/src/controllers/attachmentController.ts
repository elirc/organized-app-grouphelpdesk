// Author: Alex Chen
// Issue: Enterprise Sprint 2 - Map attachment metadata requests

import type { NextFunction, Request, Response } from 'express';

import { getValidatedBody, getValidatedParams } from '../middleware/validateRequest';
import { attachmentService } from '../services/attachmentService';
import type { TicketIdParams } from '../validation/commonSchemas';
import type { AttachmentBody } from '../validation/attachmentSchemas';

export async function listAttachments(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<TicketIdParams>(res);
    res.json({
      data: await attachmentService.listForTicket(params.ticketId, req.currentUser),
    });
  } catch (error) {
    next(error);
  }
}

export async function createAttachment(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<TicketIdParams>(res);
    const body = getValidatedBody<AttachmentBody>(res);
    const attachment = await attachmentService.createForTicket(
      params.ticketId,
      body,
      req.currentUser!,
    );
    res.status(201).json({ data: attachment });
  } catch (error) {
    next(error);
  }
}
