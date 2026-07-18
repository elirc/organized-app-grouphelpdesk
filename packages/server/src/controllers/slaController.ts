// Author: Alex Chen
// Issue: Enterprise Sprint 1 - Map SLA HTTP requests to service operations

import type { NextFunction, Request, Response } from 'express';

import { getValidatedBody, getValidatedParams } from '../middleware/validateRequest';
import { slaService } from '../services/slaService';
import type { IdParams } from '../validation/commonSchemas';
import type { SlaPolicyBody } from '../validation/slaSchemas';

export async function listSlaPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await slaService.listPolicies(req.currentUser) });
  } catch (error) {
    next(error);
  }
}

export async function createSlaPolicy(req: Request, res: Response, next: NextFunction) {
  try {
    const body = getValidatedBody<SlaPolicyBody>(res);
    const policy = await slaService.createPolicy(body, req.currentUser!);
    res.status(201).json({ data: policy });
  } catch (error) {
    next(error);
  }
}

export async function reviewEscalations(req: Request, res: Response, next: NextFunction) {
  try {
    res.json({ data: await slaService.reviewEscalations(req.currentUser!) });
  } catch (error) {
    next(error);
  }
}

export async function listTicketEscalations(_req: Request, res: Response, next: NextFunction) {
  try {
    const params = getValidatedParams<IdParams>(res);
    res.json({ data: await slaService.listEscalations(params.id) });
  } catch (error) {
    next(error);
  }
}
