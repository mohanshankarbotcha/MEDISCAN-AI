/**
 * Analysis Routes for Midiscanai
 */

import express from 'express';
import * as analyzeController from '../controllers/analyze.controller.js';
import { analysisLimiter } from '../middleware/rateLimiter.middleware.js';
import { validateFileId } from '../middleware/security.middleware.js';
import { createAuditLogger } from '../middleware/audit.middleware.js';

const router = express.Router();

router.post('/', analysisLimiter, validateFileId, createAuditLogger, analyzeController.analyzeReport);
router.get('/:fileId', validateFileId, analyzeController.getResults);

export default router;
