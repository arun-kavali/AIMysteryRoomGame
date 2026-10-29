import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

/**
 * Strips secret tokens, database credentials, and API keys from error logs.
 */
function redactSecrets(text) {
  if (!text) return text;
  return String(text)
    .replace(/mongodb(\+srv)?:\/\/[^\s@]+@/gi, 'mongodb$1://***:***@')
    .replace(/(api[_-]?key|token|password|secret)=[^&\s]+/gi, '$1=***');
}

export function errorHandler(err, req, res, next) {
  const isHttpError = err instanceof HttpError;
  const status = isHttpError ? err.status : err.statusCode || 500;
  const code = isHttpError ? err.code : 'INTERNAL_SERVER_ERROR';

  const rawMessage = err.message || 'An unexpected error occurred';
  const safeMessage =
    status === 500 && env.NODE_ENV === 'production'
      ? 'An unexpected error occurred while processing your request. Please try again later.'
      : redactSecrets(rawMessage);

  // Redact secrets from server diagnostics
  if (status >= 500) {
    const sanitizedStack = redactSecrets(err.stack || err.message);
    console.error(`[Server Error] ${req.method} ${req.originalUrl}:`, sanitizedStack);
  }

  res.status(status).json({
    error: {
      code,
      message: safeMessage,
    },
  });
}
