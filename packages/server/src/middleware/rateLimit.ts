// Author: Jordan Park
// Issue: Enterprise Sprint 3 - Add lightweight request throttling

import type { NextFunction, Request, Response } from 'express';

import { config } from '../config/env';
import { AppError } from '../utils/errors';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function rateLimit(req: Request, _res: Response, next: NextFunction) {
  if (config.NODE_ENV === 'test') {
    next();
    return;
  }

  const key = req.ip ?? 'unknown';
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  bucket.count += 1;
  if (bucket.count > config.RATE_LIMIT_MAX) {
    next(new AppError(429, 'RATE_LIMITED', 'Too many requests. Please try again shortly.'));
    return;
  }

  next();
}
