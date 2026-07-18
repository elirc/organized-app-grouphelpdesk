// Author: Alex Chen
// Issue: Learning Phase 3 - Register ticket module routes

import { Router } from 'express';
import { UserRole } from '@helpdesk/shared';

import { requireAuth, requireRole } from '../../middleware/auth';
import { validateBody, validateParams, validateQuery } from '../../middleware/validateRequest';
import { idParamsSchema } from '../../validation/commonSchemas';
import {
  assignTicket,
  createTicket,
  deleteTicket,
  getTicket,
  listTickets,
  updateTicket,
} from './ticket.controller';
import {
  assignTicketBodySchema,
  createTicketBodySchema,
  listTicketsQuerySchema,
  updateTicketBodySchema,
} from './ticket.schema';

export const ticketRouter = Router();

ticketRouter.post('/', validateBody(createTicketBodySchema), requireAuth, createTicket);
ticketRouter.get('/', validateQuery(listTicketsQuerySchema), requireAuth, listTickets);
ticketRouter.patch(
  '/:id/assign',
  validateParams(idParamsSchema),
  validateBody(assignTicketBodySchema),
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  assignTicket,
);
ticketRouter.get('/:id', validateParams(idParamsSchema), requireAuth, getTicket);
ticketRouter.patch(
  '/:id',
  validateParams(idParamsSchema),
  validateBody(updateTicketBodySchema),
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  updateTicket,
);
ticketRouter.delete(
  '/:id',
  validateParams(idParamsSchema),
  requireRole(UserRole.ADMIN),
  deleteTicket,
);
