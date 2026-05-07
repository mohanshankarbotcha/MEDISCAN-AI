/**
 * AES-256-CBC Encryption Service for Midiscanai
 */

import crypto from 'node:crypto';

export class EncryptionService {
  static get key() {
    // 32-byte key from hex string
    return Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  }

  static encrypt(plaintext) {
    if (!plaintext) return plaintext;
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return `${iv.toString('hex')}:${encrypted}`;
  }

  static decrypt(encryptedText) {
    if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
    
    try {
      const [ivHex, ciphertextHex] = encryptedText.split(':');
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
      
      let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (err) {
      throw new Error("Decryption failed — data may be corrupted or tampered");
    }
  }

  static encryptObject(obj) {
    return this.encrypt(JSON.stringify(obj));
  }

  static decryptObject(encryptedText) {
    const decrypted = this.decrypt(encryptedText);
    return JSON.parse(decrypted);
  }
}
