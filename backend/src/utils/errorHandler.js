/**
 * Error Handling Utility for Midiscanai
 */

export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Wraps async functions to catch errors and pass them to next middleware
 * @param {Function} fn - Async function
 * @returns {Function}
 */
export const asyncWrapper = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
