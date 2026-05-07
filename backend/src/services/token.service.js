/**
 * Token Service for Midiscanai using jsonwebtoken
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { AppError } from '../utils/errorHandler.js';

export class TokenService {
  /**
   * Generates a JWT access token
   */
  static generateAccessToken(userId, email, role) {
    const payload = {
      sub: userId.toString(),
      email,
      role,
      type: 'access'
    };
    
    return jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: 'HS256'
    });
  }

  /**
   * Generates a JWT refresh token
   */
  static generateRefreshToken(userId) {
    const payload = {
      sub: userId.toString(),
      type: 'refresh'
    };
    
    return jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: '7d'
    });
  }

  /**
   * Verifies a JWT token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw new AppError('Token has expired — please log in again', 401);
      }
      throw new AppError('Invalid token — please log in again', 401);
    }
  }

  /**
   * Generates a secure random 64-character hex string
   */
  static generateSecureToken() {
    return crypto.randomBytes(32).toString('hex');
  }
}
