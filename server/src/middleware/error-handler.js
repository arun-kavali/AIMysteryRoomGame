import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

export function errorHandler(err, req, res, next) {
  const isHttpError = err instanceof HttpError;
  const status = isHttpError ? err.status : err.statusCode || 500;
  const code = isHttpError ? err.code : 'INTERNAL_SERVER_ERROR';

  const message =
    status === 500 && env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'An error occurred';

  // Log server errors for developer observability
  if (status >= 500) {
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, err);
  }

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
}

