/**
 * Audit Logging Middleware for Midiscanai
 */

import { AuditService } from '../services/database.service.js';

export const createAuditLogger = (req, res, next) => {
  const originalEnd = res.end;
  
  // Intercept response end to log
  res.end = function(...args) {
    const userId = req.user ? parseInt(req.user.sub) : null;
    const action = `${req.method} ${req.path}`;
    const ipAddress = req.headers['x-forwarded-for'] || req.ip;
    const userAgent = req.headers['user-agent'];
    
    // Non-blocking fire-and-forget
    AuditService.log(action, {
      userId,
      ipAddress,
      additionalData: {
        userAgent,
        statusCode: res.statusCode
      }
    }).catch(err => console.error('Audit Log Middleware Error:', err));
    
    return originalEnd.apply(this, args);
  };
  
  next();
};
