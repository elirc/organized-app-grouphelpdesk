// Author: Alex Chen
// Issue: Learning Phase 3 - Keep ticket HTTP mapping inside the ticket module

import type { NextFunction, Request, Response } from 'express';

import {
  getValidatedBody,
  getValidatedParams,
  getValidatedQuery,
} from '../../middleware/validateRequest';
import type { IdParams } from '../../validation/commonSchemas';
import { ticketService } from './ticket.service';
import type {
  AssignTicketBody,
  CreateTicketBody,
  ListTicketsQuery,
  UpdateTicketBody,
} from './ticket.schema';

export async function createTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const body = getValidatedBody<CreateTicketBody>(res);
    const ticket = await ticketService.createTicket({
      ...body,
      createdBy: req.currentUser!.id,
    });
    res.status(201).json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function listTickets(req: Request, res: Response, next: NextFunction) {
  try {
    const query = getValidatedQuery<ListTicketsQuery>(res);
    res.json(await ticketService.getTickets(query, req.currentUser));
  } catch (error) {
    next(error);
  }
}

export async function getTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await ticketService.getTicketById(params.id, req.currentUser) });
  } catch (error) {
    next(error);
  }
}

export async function updateTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    const body = getValidatedBody<UpdateTicketBody>(res);
    res.json({
      data: await ticketService.updateTicket(
        params.id,
        { ...body, actorId: req.currentUser!.id },
        req.currentUser,
      ),
    });
  } catch (error) {
    next(error);
  }
}

export async function assignTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    const body = getValidatedBody<AssignTicketBody>(res);
    const ticket = await ticketService.assignTicket(
      params.id,
      body.assigneeId,
      req.currentUser!.id,
      req.currentUser,
    );
    res.json({ data: ticket });
  } catch (error) {
    next(error);
  }
}

export async function deleteTicket(req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json(await ticketService.deleteTicket(params.id, req.currentUser));
  } catch (error) {
    next(error);
  }
}
