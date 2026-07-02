/**
 * aiAgent.service.js — Google Gemini AI Service
 * Midiscanai Medical Intelligence Platform
 *
 * This file has been migrated from OpenRouter to Google Gemini API.
 * It now uses the official @google/generative-ai SDK via the
 * centralized GeminiService module.
 *
 * If the project uses the Multi-Agent Orchestrator, this file acts
 * as a compatibility redirect. If the project uses this service
 * directly, it calls Gemini and returns the structured result.
 *
 * Built by BMS
 */

import { callGeminiJSON, getModelName, validateApiKey } from './gemini.service.js';
import { extractTextFromImage } from '../utils/ocr.util.js';
import { extractTextFromPDF, extractTextFromTXT } from '../utils/pdfParser.util.js';

/**
 * Extracts text from uploaded file based on MIME type.
 */
async function extractText(filePath, fileType) {
  if (['image/png','image/jpeg','image/jpg'].includes(fileType)) return extractTextFromImage(filePath);
  if (fileType === 'application/pdf') return extractTextFromPDF(filePath);
  if (fileType === 'text/plain') return extractTextFromTXT(filePath);
  throw new Error(`UNSUPPORTED_TYPE: File type "${fileType}" is not supported.`);
}

/**
 * Detects the report category from extracted text.
 */
function detectReportType(text) {
  const lower = text.toLowerCase();
  const types = [
    { label: 'Complete Blood Count (CBC) Report', keys: ['hemoglobin','hematocrit','wbc','rbc','platelets','mchc','mcv'] },
    { label: 'Blood Sugar / Diabetes Report', keys: ['glucose','hba1c','insulin','fasting','diabetes'] },
    { label: 'Lipid Panel Report', keys: ['cholesterol','ldl','hdl','triglycerides','lipid'] },
    { label: 'Kidney Function Test', keys: ['creatinine','urea','bun','gfr','kidney','renal'] },
    { label: 'Liver Function Test', keys: ['bilirubin','sgpt','sgot','alt','ast','liver'] },
    { label: 'Thyroid Function Test', keys: ['tsh','t3','t4','thyroxine','thyroid'] },
    { label: 'Cardiac / ECG Report', keys: ['ecg','ekg','cardiac','heart rate','arrhythmia'] },
    { label: 'Radiology / Imaging Report', keys: ['xray','radiograph','mri','ultrasound','opacity'] }
  ];
  let best = { label: 'General Medical Report', count: 2 };
  for (const t of types) {
    const count = t.keys.filter(k => lower.includes(k)).length;
    if (count > best.count) best = { label: t.label, count };
  }
  return best.label;
}

/**
 * Main analysis pipeline — called by the controller or orchestrator.
 * @param {string} filePath
 * @param {string} fileType
 * @returns {Promise<object>} structured medical analysis
 */
export async function runAnalysis(filePath, fileType) {
  const startTime = Date.now();

  console.log('[MediScan AI] Starting Google Gemini analysis pipeline');
  console.log(`[MediScan AI] Model: ${getModelName()}`);

  // Validate API key at start of each analysis request
  if (!validateApiKey()) {
    throw new Error('GEMINI_AUTH_ERROR: GOOGLE_API_KEY is not configured. Add your Google AI API key to the backend .env file. Get one free from https://aistudio.google.com/apikey');
  }

  try {
    const extractedText = await extractText(filePath, fileType);
    console.log(`[MediScan AI] Text extracted — ${extractedText.length} chars`);

    const reportType = detectReportType(extractedText);
    console.log(`[MediScan AI] Report type: ${reportType}`);

    const systemPrompt = `You are MediScan AI, a professional clinical medical report analysis agent built by BMS. Analyze medical reports and return results in simple clear patient-friendly language. Maximum 2 sentences per text field. Respond with raw JSON only — no markdown, no code fences, no extra text.`;

    const userPrompt = `Analyze this ${reportType}. Return raw JSON with exactly these 8 keys:
"detected_condition" — condition name plus key abnormal value. Max 15 words.
"risk_score" — integer 0-100.
"condition_level" — exactly "Low" (0-30), "Medium" (31-70), or "High" (71-100).
"clinical_explanation" — 2 sentences max. Plain words, no jargon.
"recommended_guidance" — 2 sentences max. Specific action and lifestyle change.
"estimated_cost" — specific INR range. Never "Not determined".
"extracted_metrics" — object with readable keys and values with normal ranges. Mark abnormal with ⚠.
"detection_reasoning" — 2 sentences max. Which values triggered diagnosis and why.

Medical report: ${extractedText}`;

    const result = await callGeminiJSON(systemPrompt, userPrompt);

    // Validate and correct the result
    result.risk_score = Math.max(0, Math.min(100, parseInt(result.risk_score) || 0));
    if (result.risk_score <= 30) result.condition_level = 'Low';
    else if (result.risk_score <= 70) result.condition_level = 'Medium';
    else result.condition_level = 'High';

    const strFields = ['detected_condition','clinical_explanation','recommended_guidance','estimated_cost','detection_reasoning'];
    for (const f of strFields) {
      if (!result[f] || typeof result[f] !== 'string') result[f] = 'Not determined from available data.';
    }
    if (!result.extracted_metrics || typeof result.extracted_metrics !== 'object' || Array.isArray(result.extracted_metrics)) {
      result.extracted_metrics = {};
    }

    result.report_type = reportType;
    result.processing_time_ms = Date.now() - startTime;
    result.ai_model_used = getModelName();
    result.ai_provider = 'Google Gemini';

    console.log(`[MediScan AI] Pipeline complete in ${result.processing_time_ms}ms`);
    return result;

  } catch (err) {
    console.error('[MediScan AI] Pipeline error:', err.message);
    const typedPrefixes = ['MEDICAL_VALIDATION_FAILED:','UNSUPPORTED_TYPE:','PDF_EMPTY:','TXT_EMPTY:','GEMINI_AUTH_ERROR:','GEMINI_QUOTA_EXCEEDED:','GEMINI_FAILED:','GEMINI_PARSE_FAILED:'];
    if (typedPrefixes.some(p => err.message.startsWith(p))) throw err;
    throw new Error(`ANALYSIS_PIPELINE_ERROR: ${err.message}`);
  }
}
