// Author: Jordan Park
// Issue: Enterprise Sprint 2 - Map notification requests

import type { NextFunction, Request, Response } from 'express';

import { getValidatedParams } from '../middleware/validateRequest';
import { notificationService } from '../services/notificationService';
import type { IdParams } from '../validation/commonSchemas';

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await notificationService.listForUser(req.currentUser!.id) });
  } catch (error) {
    next(error);
  }
}

export async function markNotificationRead(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await notificationService.markRead(params.id, req.currentUser!.id) });
  } catch (error) {
    next(error);
  }
}
