// Author: Alex Chen
// Issue: #3 â€” Define structured application errors

export interface ErrorDetails {
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: ErrorDetails;

  constructor(statusCode: number, code: string, message: string, details?: ErrorDetails) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Restoring the prototype keeps instanceof checks reliable after TypeScript compilation.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource could not be found.', details?: ErrorDetails) {
    super(404, 'NOT_FOUND', message, details);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Request failed validation.', details?: ErrorDetails) {
    super(422, 'VALIDATION_ERROR', message, details);
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Request is malformed.', details?: ErrorDetails) {
    super(400, 'BAD_REQUEST', message, details);
  }
}
