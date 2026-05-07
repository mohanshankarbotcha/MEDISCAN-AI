/**
 * Rate Limiter Middleware for Midiscanai
 */

import rateLimit from 'express-rate-limit';

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests", message: "Please wait before trying again." }
});

export const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { 
    error: "Too many analysis requests", 
    message: "You have exceeded the analysis request limit. Please wait 15 minutes before trying again.", 
    retryAfter: 900 
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { 
    error: "Too many authentication attempts", 
    message: "Too many login attempts from this IP. Please wait 15 minutes.", 
    retryAfter: 900 
  }
});
