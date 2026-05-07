/**
 * Auth Routes for Midiscanai
 */

import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = express.Router();

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);

export default router;
