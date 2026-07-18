// Author: Alex Chen
// Issue: #4 â€” Return consistent API error responses

import type { ErrorRequestHandler } from 'express';

import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export const errorHandler: ErrorRequestHandler = (error, req, res, _next) => {
  const requestLogger = req.log ?? logger;

  if (error instanceof AppError) {
    requestLogger.warn(
      {
        errorCode: error.code,
        statusCode: error.statusCode,
        details: error.details,
      },
      error.message,
    );

    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
    return;
  }

  requestLogger.error({ error }, 'Unhandled server error');
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected server error occurred.',
    },
  });
};
