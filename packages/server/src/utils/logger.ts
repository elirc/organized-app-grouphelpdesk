// Author: Jordan Park
// Issue: #27 â€” Configure structured logging with Pino

import pino from 'pino';

import { config } from '../config/env';

export const logger = pino({
  level: config.LOG_LEVEL,
  base: {
    service: 'helpdesk-api',
    environment: config.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export type AppLogger = typeof logger;
