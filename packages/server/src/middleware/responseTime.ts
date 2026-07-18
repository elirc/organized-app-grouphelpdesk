// Author: Morgan Lee
// Issue: #38 â€” Track response timing and slow requests

import type { NextFunction, Request, Response } from 'express';

import { logger } from '../utils/logger';

interface SlowRequest {
  method: string;
  path: string;
  route: string;
  query: Record<string, unknown>;
  durationMs: number;
  timestamp: string;
}

const SLOW_REQUEST_THRESHOLD_MS = 500;
const rollingDurations: number[] = [];
const slowRequests: SlowRequest[] = [];
let requestCount = 0;

export function responseTime(req: Request, res: Response, next: NextFunction) {
  const startedAt = process.hrtime.bigint();
  req.startedAt = startedAt;
  const originalWriteHead = res.writeHead.bind(res);

  res.writeHead = ((...args: Parameters<Response['writeHead']>) => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    res.setHeader('X-Response-Time', `${durationMs.toFixed(1)}ms`);
    return originalWriteHead(...args);
  }) as Response['writeHead'];

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    requestCount += 1;
    rollingDurations.push(durationMs);

    if (rollingDurations.length > 100) {
      rollingDurations.shift();
    }

    if (durationMs > SLOW_REQUEST_THRESHOLD_MS) {
      const slowRequest = {
        method: req.method,
        path: req.path,
        route: req.route?.path?.toString() ?? req.path,
        query: req.query,
        durationMs,
        timestamp: new Date().toISOString(),
      };

      slowRequests.unshift(slowRequest);
      slowRequests.splice(10);
      logger.warn(slowRequest, 'Slow request detected');
    }
  });

  next();
}

export function getSystemMetrics() {
  const total = rollingDurations.reduce((sum, duration) => sum + duration, 0);

  return {
    requestCount,
    averageResponseTimeMs: rollingDurations.length === 0 ? 0 : total / rollingDurations.length,
    slowRequests,
  };
}
