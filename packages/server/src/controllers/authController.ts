// Author: Morgan Lee
// Issue: Learning Phase 4 - Map auth HTTP requests to the auth service

import type { NextFunction, Request, Response } from 'express';

import { getValidatedBody } from '../middleware/validateRequest';
import { authService } from '../services/authService';
import type { LoginBody } from '../validation/authSchemas';

export async function login(_req: Request, res: Response, next: NextFunction) {
  try {
    const body = getValidatedBody<LoginBody>(res);
    res.json({ data: await authService.login(body.email, body.password) });
  } catch (error) {
    next(error);
  }
}

export function me(req: Request, res: Response) {
  res.json({ data: req.currentUser });
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.authToken);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
