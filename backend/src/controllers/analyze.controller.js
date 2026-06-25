/**
 * analyze.controller.js
 * Handles analysis requests. No Python. Pure Node.js.
 */

import fs from 'node:fs';
import { runAnalysis } from '../agents/orchestrator.agent.js';
import { ReportService, AnalysisService } from '../services/database.service.js';

export async function analyzeReport(req, res, next) {
  try {
    const { fileId } = req.body;

    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).json({ error: 'Missing fileId', message: 'Please provide a valid fileId from a successful upload.' });
    }

    const uploadRecord = await ReportService.findReportByFileId(fileId);
    if (!uploadRecord) {
      return res.status(404).json({ error: 'File not found', message: 'Uploaded file record not found. Please upload your report again.' });
    }

    if (!fs.existsSync(uploadRecord.filePath)) {
      return res.status(404).json({ error: 'File missing', message: 'The uploaded file is no longer on the server. Please upload again.' });
    }

    const result = await runAnalysis(uploadRecord.filePath, uploadRecord.fileType, fileId);

    await AnalysisService.saveAnalysisResult({
      fileId,
      reportId: uploadRecord.id,
      detected_condition: result.detected_condition,
      risk_score: result.risk_score,
      condition_level: result.condition_level,
      clinical_explanation: result.clinical_explanation,
      recommended_guidance: result.recommended_guidance,
      estimated_cost: result.estimated_cost,
      extracted_metrics: JSON.stringify(result.extracted_metrics),
      detection_reasoning: result.detection_reasoning,
      ai_model_used: 'gpt-4o',
      processing_time_ms: result.processing_time_ms
    });

    return res.status(200).json({ success: true, ...result });

  } catch (err) {
    const msg = err.message || '';

    if (msg.startsWith('MEDICAL_VALIDATION_FAILED:')) {
      return res.status(422).json({
        error: 'Not a medical document',
        message: msg.replace('MEDICAL_VALIDATION_FAILED:', '').trim(),
        code: 'INVALID_MEDICAL_CONTENT'
      });
    }
    if (msg.startsWith('UNSUPPORTED_TYPE:')) {
      return res.status(415).json({
        error: 'Unsupported file type',
        message: msg.replace('UNSUPPORTED_TYPE:', '').trim(),
        code: 'UNSUPPORTED_TYPE'
      });
    }
    if (msg.startsWith('PDF_EMPTY:') || msg.startsWith('TXT_EMPTY:')) {
      return res.status(422).json({
        error: 'Empty or unreadable file',
        message: msg.split(':').slice(1).join(':').trim(),
        code: 'EMPTY_FILE'
      });
    }
    if (msg.startsWith('OPENAI_PARSE_FAILED:')) {
      return res.status(503).json({
        error: 'AI analysis temporarily unavailable',
        message: 'OpenAI could not process your report right now. Please try again in a few seconds.',
        code: 'AI_PARSE_ERROR'
      });
    }
    if (msg.startsWith('OPENAI_AUTH_ERROR:')) {
      return res.status(500).json({
        error: 'AI configuration error',
        message: 'The AI service is not properly configured. Please contact support.',
        code: 'AI_CONFIG_ERROR'
      });
    }
    if (msg.startsWith('OPENAI_RATE_LIMIT:')) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'The AI service is busy. Please wait a few seconds and try again.',
        code: 'AI_RATE_LIMIT'
      });
    }
    if (msg.startsWith('OPENAI_UNAVAILABLE:')) {
      return res.status(503).json({
        error: 'AI service unavailable',
        message: 'OpenAI is temporarily unavailable. Please try again shortly.',
        code: 'AI_UNAVAILABLE'
      });
    }

    console.error('[Analyze Controller]', err.stack);
    return res.status(500).json({
      error: 'Analysis failed',
      message: 'An unexpected error occurred during analysis. Please try again.',
      code: 'INTERNAL_ERROR'
    });
  }
}

export async function getResults(req, res) {
  try {
    const { fileId } = req.params;
    const result = await AnalysisService.findResultByFileId(fileId);
    if (!result) {
      return res.status(404).json({ error: 'Result not found', message: 'No analysis result found for this file.' });
    }
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to retrieve results', message: err.message });
  }
}
