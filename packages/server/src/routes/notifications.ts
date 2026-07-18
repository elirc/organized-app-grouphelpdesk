// Author: Jordan Park
// Issue: Enterprise Sprint 2 - Register notification routes

import { Router } from 'express';

import { listNotifications, markNotificationRead } from '../controllers/notificationController';
import { requireAuth } from '../middleware/auth';
import { validateParams } from '../middleware/validateRequest';
import { idParamsSchema } from '../validation/commonSchemas';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get('/', listNotifications);
notificationRouter.post('/:id/read', validateParams(idParamsSchema), markNotificationRead);
