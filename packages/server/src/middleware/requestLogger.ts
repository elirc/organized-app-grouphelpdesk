// Author: Jordan Park
// Issue: #28 â€” Add request-scoped structured logs

import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

import { logger } from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const requestId = randomUUID();
  const childLogger = logger.child({ requestId });
  const startedAt = process.hrtime.bigint();

  req.requestId = requestId;
  req.log = childLogger;
  res.setHeader('X-Request-Id', requestId);

  childLogger.info({ method: req.method, path: req.path, query: req.query }, 'Incoming request');

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    childLogger.info(
      {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs,
      },
      'Request completed',
    );
  });

  next();
}
