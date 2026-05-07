/**
 * Password Service for Midiscanai using bcryptjs
 */

import bcrypt from 'bcryptjs';

export class PasswordService {
  /**
   * Hashes a plaintext password
   */
  static async hash(password) {
    return await bcrypt.hash(password, 12);
  }

  /**
   * Verifies a password against a hash
   */
  static async verify(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Validates password strength
   */
  static validateStrength(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*()_+\-=\[\]{}|;':,.<>?]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
