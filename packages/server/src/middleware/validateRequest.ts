// Author: Morgan Lee
// Issue: Learning Phase 2 - Validate untrusted HTTP input with Zod

import type { NextFunction, Request, Response } from 'express';
import type { ZodError, ZodTypeAny } from 'zod';

import { AppError } from '../utils/errors';

type RequestPart = 'body' | 'query' | 'params';

function formatZodError(error: ZodError) {
  return error.issues.map((issue) => ({
    path: issue.path.join('.') || '(root)',
    message: issue.message,
    code: issue.code,
  }));
}

function validate(part: RequestPart, schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      next(
        new AppError(400, 'VALIDATION_ERROR', `Invalid request ${part}.`, {
          issues: formatZodError(result.error),
        }),
      );
      return;
    }

    res.locals[`validated${part[0].toUpperCase()}${part.slice(1)}`] = result.data;
    next();
  };
}

export function validateBody(schema: ZodTypeAny) {
  return validate('body', schema);
}

export function validateQuery(schema: ZodTypeAny) {
  return validate('query', schema);
}

export function validateParams(schema: ZodTypeAny) {
  return validate('params', schema);
}

export function getValidatedBody<T>(res: Response): T {
  return res.locals.validatedBody as T;
}

export function getValidatedQuery<T>(res: Response): T {
  return res.locals.validatedQuery as T;
}

export function getValidatedParams<T>(res: Response): T {
  return res.locals.validatedParams as T;
}
