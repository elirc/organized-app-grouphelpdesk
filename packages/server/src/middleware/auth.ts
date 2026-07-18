// Author: Morgan Lee
// Issue: Learning Phase 4 - Derive current user identity on the server

import type { NextFunction, Request, Response } from 'express';

import { authService } from '../services/authService';
import { AppError } from '../utils/errors';

function extractBearerToken(req: Request) {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) return undefined;

  return header.slice('Bearer '.length).trim();
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    req.authToken = extractBearerToken(req);
    req.currentUser = (await authService.getCurrentUser(req.authToken)) ?? undefined;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.currentUser) {
    next(new AppError(401, 'UNAUTHENTICATED', 'You must be logged in to use this endpoint.'));
    return;
  }

  next();
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.currentUser) {
      next(new AppError(401, 'UNAUTHENTICATED', 'You must be logged in to use this endpoint.'));
      return;
    }

    if (!roles.includes(req.currentUser.role)) {
      next(new AppError(403, 'FORBIDDEN', 'You do not have permission to perform this action.'));
      return;
    }

    next();
  };
}
