// Author: Alex Chen
// Issue: Enterprise Sprint 1 - Register SLA routes

import { Router } from 'express';
import { UserRole } from '@helpdesk/shared';

import { createSlaPolicy, listSlaPolicies, reviewEscalations } from '../controllers/slaController';
import { requireRole } from '../middleware/auth';
import { validateBody } from '../middleware/validateRequest';
import { slaPolicyBodySchema } from '../validation/slaSchemas';

export const slaRouter = Router();

slaRouter.use(requireRole(UserRole.AGENT, UserRole.ADMIN));
slaRouter.get('/policies', listSlaPolicies);
slaRouter.post(
  '/policies',
  validateBody(slaPolicyBodySchema),
  requireRole(UserRole.ADMIN),
  createSlaPolicy,
);
slaRouter.post('/escalations/review', requireRole(UserRole.ADMIN), reviewEscalations);
