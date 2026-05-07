/**
 * Security Middleware for Midiscanai
 */

import jwt from 'jsonwebtoken';
import { AppError } from '../utils/errorHandler.js';

/**
 * Validates UUID v4 format for file identifiers
 */
export const validateFileId = (req, res, next) => {
  const fileId = req.body.fileId || req.params.fileId;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!fileId || !uuidRegex.test(fileId)) {
    return next(new AppError('Invalid file identifier format', 400));
  }
  next();
};

/**
 * Sanitizes input by trimming strings and removing HTML tags
 */
export const sanitizeInput = (req, res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim().replace(/<[^>]*>?/gm, '');
      }
    }
  }
  next();
};

/**
 * Requires valid JWT authentication
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Unauthorized — valid token required', 401));
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return next(new AppError('Unauthorized — valid token required', 401));
  }
};
