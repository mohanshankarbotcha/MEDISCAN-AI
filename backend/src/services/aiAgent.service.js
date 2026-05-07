/**
 * aiAgent.service.js
 * Midiscanai Medical Analysis AI Agent
 * Provider: OpenAI GPT-4o
 * Replaces: Anthropic Claude API
 * Built by BMS
 */

import OpenAI from 'openai';
import { extractTextFromImage } from '../utils/ocr.util.js';
import { extractTextFromPDF, extractTextFromTXT } from '../utils/pdfParser.util.js';

// Initialize OpenAI client for OpenRouter
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

/**
 * Routes the uploaded file to the correct text extractor based on MIME type.
 * Supports PNG, JPG (Tesseract.js OCR), PDF (pdf-parse), TXT (plain read).
 * @param {string} filePath - Absolute path to the uploaded file
 * @param {string} fileType - MIME type of the file
 * @returns {Promise<string>} - Extracted and validated medical text
 */
export async function extractText(filePath, fileType) {
  if (fileType === 'image/png' || fileType === 'image/jpeg' || fileType === 'image/jpg') {
    return await extractTextFromImage(filePath);
  }
  if (fileType === 'application/pdf') {
    return await extractTextFromPDF(filePath);
  }
  if (fileType === 'text/plain') {
    return await extractTextFromTXT(filePath);
  }
  throw new Error(
    `UNSUPPORTED_TYPE: File type "${fileType}" is not supported. ` +
    `Please upload PNG, JPG, PDF, or TXT files only.`
  );
}

/**
 * Detects the category of medical report from extracted text using keyword scoring.
 * @param {string} text - Extracted medical text
 * @returns {Promise<string>} - Human-readable report type label
 */
export async function detectReportType(text) {
  const lower = text.toLowerCase();
  const score = (keywords) => keywords.filter(k => lower.includes(k)).length;

  const types = [
    {
      label: 'Complete Blood Count (CBC) Report',
      keys: ['hemoglobin','hematocrit','wbc','rbc','platelets','mchc',
             'mcv','mch','neutrophils','lymphocytes','eosinophils','cbc','blood count']
    },
    {
      label: 'Blood Sugar / Diabetes Report',
      keys: ['glucose','hba1c','insulin','fasting','postprandial','diabetes','glycated','glucometer']
    },
    {
      label: 'Lipid Panel Report',
      keys: ['cholesterol','ldl','hdl','triglycerides','vldl','lipid','cardiovascular risk']
    },
    {
      label: 'Kidney Function Test',
      keys: ['creatinine','urea','bun','gfr','uric acid','kidney','renal','nephro','electrolytes']
    },
    {
      label: 'Liver Function Test',
      keys: ['bilirubin','sgpt','sgot','alt','ast','alkaline','phosphatase',
             'liver','hepatic','albumin','globulin']
    },
    {
      label: 'Thyroid Function Test',
      keys: ['tsh','t3','t4','thyroxine','thyroid','hypothyroid','hyperthyroid','free t4','free t3']
    },
    {
      label: 'Cardiac / ECG Report',
      keys: ['ecg','ekg','sinus','rhythm','cardiac','heart rate','arrhythmia',
             'bpm','atrial','ventricular','qrs','p-wave','st segment']
    },
    {
      label: 'Radiology / Imaging Report',
      keys: ['xray','x-ray','radiograph','mri','ct scan','ultrasound','opacity',
             'consolidation','fracture','effusion','calcification','lesion','mass','nodule']
    },
    {
      label: 'Urine Analysis Report',
      keys: ['urine','urinalysis','protein','ketones','leucocytes','nitrite',
             'specific gravity','ph','urea','creatinine clearance']
    },
    {
      label: 'Prescription / Medication Record',
      keys: ['tablet','capsule','syrup','injection','dosage','twice daily',
             'once daily','prescribed','refill','mg','ml','drops']
    }
  ];

  let best = { label: 'General Medical Report', count: 2 };
  for (const type of types) {
    const count = score(type.keys);
    if (count > best.count) best = { label: type.label, count };
  }
  return best.label;
}

/**
 * Calls the OpenAI GPT-4o API to analyze the medical report text.
 * Uses structured JSON mode to guarantee a parseable response.
 * Includes a 3-attempt retry system for maximum reliability.
 * @param {string} extractedText - Validated medical text from OCR/PDF/TXT
 * @param {string} reportType - Detected report category
 * @returns {Promise<object>} - Structured medical analysis JSON object
 */
export async function callOpenAIAgent(extractedText, reportType) {

  const systemPrompt = `You are MediScan AI, a medical report analysis agent built by BMS. You analyze medical reports and return results in simple, clear, patient-friendly language. Your responses must be brief — maximum 2 sentences per text field. Write like a doctor explaining results to a patient in plain English, not like an academic paper. Every field must contain real specific information extracted from the report — never use generic placeholder sentences. Always include actual values, actual costs in INR, and actual next steps. Respond with a single raw JSON object only — no markdown, no code fences, no extra text before or after the JSON.`;

  const userPrompt = `Analyze this medical report classified as: ${reportType}

Read every value carefully. Return a single raw JSON object with exactly these 8 keys. Follow the instructions for each key strictly:

"detected_condition" — Write the condition name followed by a dash and the single most important abnormal value that proves it. Maximum 15 words. Example: "Hyperglycemia — Post-prandial glucose 228 mg/dL (Normal: below 140 mg/dL)". Never write just the condition name alone.

"risk_score" — An integer 0 to 100. Base it strictly on how far the values deviate from normal reference ranges. 0-30 means mild or no concern. 31-70 means moderate — needs doctor visit. 71-100 means severe — needs urgent care.

"condition_level" — Exactly "Low" if risk_score is 0-30. Exactly "Medium" if risk_score is 31-70. Exactly "High" if risk_score is 71-100. Must match risk_score.

"clinical_explanation" — Maximum 2 sentences. First sentence: state which specific value is abnormal and by how much. Second sentence: explain in simple words what this means for the patient's health. Use plain English. No medical jargon. No generic sentences like "based on biomarkers". Example: "Your post-meal blood sugar of 228 mg/dL is well above the normal limit of 140 mg/dL. This means your body is struggling to process sugar after meals, which is an early sign of diabetes."

"recommended_guidance" — Maximum 2 sentences. First sentence: state the most important single action the patient must take right now (see a doctor, go to ER, get a follow-up test). Second sentence: state one lifestyle change relevant to the condition. Be specific. Example: "See an endocrinologist within 2 weeks for diabetes evaluation and HbA1c testing. Cut sugar and refined carbohydrates from your diet and walk for 30 minutes daily."

"estimated_cost" — A specific INR cost range for the exact treatment this patient needs. Include consultation fee, tests, and medicine estimate. Never write "Not determined". If uncertain give a reasonable estimate. Example: "INR 1,200 to INR 3,500 covering endocrinologist consultation (INR 500-800), HbA1c and fasting glucose tests (INR 400-700), and initial diabetes medication if prescribed (INR 300-2,000)."

"extracted_metrics" — An object where each key is a clean human-readable label with no underscores (use spaces and proper capitalization like "Blood Sugar Fasting" not "blood_sugar_fasting") and each value is a string with the measured number, unit, and normal range in brackets. Example: "228 mg/dL [Normal: below 140 mg/dL]". Mark values outside normal range with ⚠ symbol at the start of the value string. Example: "⚠ 228 mg/dL [Normal: below 140 mg/dL]".

"detection_reasoning" — Maximum 2 sentences. First sentence: name the exact metric values that triggered this diagnosis. Second sentence: explain briefly why those values point to this specific condition and not something else. Example: "The post-prandial glucose of 228 mg/dL combined with a fasting glucose of 120 mg/dL are the key indicators. Fasting glucose above 126 mg/dL or post-meal glucose above 200 mg/dL are diagnostic criteria for diabetes mellitus, making hyperglycemia the primary finding."

Medical report text:
${extractedText}`;

  let lastError = null;
  let rawResponse = '';

  // Attempt 1 — Standard GPT-4o call with JSON mode enforced
  try {
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      max_tokens: 2048,
      temperature: 0.1,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    });

    rawResponse = response.choices[0].message.content.trim();
    const parsed = JSON.parse(rawResponse);
    console.log('[OpenAI Agent] Attempt 1 succeeded — JSON parsed successfully');
    return validateAndCorrect(parsed);

  } catch (err) {
    lastError = err;
    console.warn('[OpenAI Agent] Attempt 1 failed:', err.message);
  }

  // Attempt 2 — Retry with stricter prompt and no JSON mode (in case model refused)
  try {
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      max_tokens: 2048,
      temperature: 0,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
        {
          role: 'assistant',
          content: 'I will now return only the raw JSON object with no other text:'
        },
        {
          role: 'user',
          content: 'Return the JSON object now. Your response must begin with { and end with }. No markdown. No explanation. Only JSON.'
        }
      ]
    });

    rawResponse = response.choices[0].message.content.trim();
    const stripped = rawResponse
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed = JSON.parse(stripped);
    console.log('[OpenAI Agent] Attempt 2 succeeded');
    return validateAndCorrect(parsed);

  } catch (err) {
    lastError = err;
    console.warn('[OpenAI Agent] Attempt 2 failed:', err.message);
  }

  // Attempt 3 — GPT-4o-mini as fallback with minimal prompt
  try {
    const fallbackPrompt = `Analyze this medical report and return ONLY a JSON object with these exact keys: detected_condition, risk_score (0-100 integer), condition_level (Low/Medium/High), clinical_explanation, recommended_guidance, estimated_cost, extracted_metrics (object), detection_reasoning. Medical report: ${extractedText.slice(0, 2000)}`;

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini',
      max_tokens: 2048,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: 'You are a medical report analyzer. Return only valid JSON.' },
        { role: 'user', content: fallbackPrompt }
      ]
    });

    rawResponse = response.choices[0].message.content.trim();
    const parsed = JSON.parse(rawResponse);
    console.log('[OpenAI Agent] Attempt 3 (gpt-4o-mini fallback) succeeded');
    return validateAndCorrect(parsed);

  } catch (err) {
    lastError = err;
    console.error('[OpenAI Agent] All 3 attempts failed. Last error:', err.message);
    throw new Error(
      `OPENAI_PARSE_FAILED: OpenAI returned an unparseable response after 3 attempts. ` +
      `Raw response preview: ${rawResponse.slice(0, 300)}`
    );
  }
}

/**
 * Validates and auto-corrects the raw OpenAI result object.
 * Ensures all required fields exist, risk_score is clamped,
 * and condition_level is always consistent with risk_score.
 * @param {object} result - Raw parsed JSON from OpenAI
 * @returns {object} - Validated and corrected result object
 */
export function validateAndCorrect(result) {
  const r = { ...result };

  // Ensure risk_score is a valid integer clamped 0–100
  if (typeof r.risk_score === 'string') r.risk_score = parseInt(r.risk_score, 10);
  if (typeof r.risk_score === 'number' && !Number.isInteger(r.risk_score)) r.risk_score = Math.round(r.risk_score);
  if (typeof r.risk_score !== 'number' || isNaN(r.risk_score)) r.risk_score = 0;
  r.risk_score = Math.max(0, Math.min(100, r.risk_score));

  // Auto-correct condition_level based on risk_score — always override to guarantee consistency
  if (r.risk_score <= 30)       r.condition_level = 'Low';
  else if (r.risk_score <= 70)  r.condition_level = 'Medium';
  else                           r.condition_level = 'High';

  // Ensure all required string fields exist and are non-empty
  const requiredStringFields = [
    'detected_condition',
    'clinical_explanation',
    'recommended_guidance',
    'estimated_cost',
    'detection_reasoning'
  ];
  for (const field of requiredStringFields) {
    if (!r[field] || typeof r[field] !== 'string' || r[field].trim() === '') {
      r[field] = 'Not determined from the available report data.';
    }
  }

  // Ensure extracted_metrics is a plain non-null non-array object
  if (
    !r.extracted_metrics ||
    typeof r.extracted_metrics !== 'object' ||
    Array.isArray(r.extracted_metrics)
  ) {
    if (typeof r.extracted_metrics === 'string') {
      try {
        r.extracted_metrics = JSON.parse(r.extracted_metrics);
      } catch {
        r.extracted_metrics = {};
      }
    } else {
      r.extracted_metrics = {};
    }
  }

  return r;
}

/**
 * MAIN ANALYSIS PIPELINE — The only function called by the Express controller.
 * Orchestrates: text extraction → report type detection → OpenAI analysis → validation.
 * @param {string} filePath - Absolute path to uploaded file on disk
 * @param {string} fileType - MIME type of the uploaded file
 * @returns {Promise<object>} - Complete structured medical analysis result
 */
export async function runAnalysis(filePath, fileType) {
  const startTime = Date.now();

  try {
    console.log('[MediScan Agent] ── Starting OpenAI analysis pipeline ──');
    console.log(`[MediScan Agent] File: ${filePath} | Type: ${fileType}`);

    // Step 1: Extract text from the uploaded file
    const extractedText = await extractText(filePath, fileType);
    console.log(`[MediScan Agent] ✓ Text extracted — ${extractedText.length} characters`);

    // Step 2: Detect the type of medical report
    const reportType = await detectReportType(extractedText);
    console.log(`[MediScan Agent] ✓ Report type detected: ${reportType}`);

    // Step 3: Call OpenAI GPT-4o for clinical analysis
    const result = await callOpenAIAgent(extractedText, reportType);
    console.log('[MediScan Agent] ✓ OpenAI GPT-4o analysis complete');

    // Step 4: Attach metadata to result
    result.report_type = reportType;
    result.processing_time_ms = Date.now() - startTime;
    result.ai_model_used = 'gpt-4o';
    result.ai_provider = 'OpenAI';

    console.log(`[MediScan Agent] ✓ Pipeline complete in ${result.processing_time_ms}ms`);
    console.log('[MediScan Agent] ── Analysis pipeline finished successfully ──');

    return result;

  } catch (err) {
    console.error('[MediScan Agent] ✗ Pipeline error:', err.message);

    // Re-throw typed errors so the controller can return the correct HTTP status
    const typedPrefixes = [
      'MEDICAL_VALIDATION_FAILED:',
      'UNSUPPORTED_TYPE:',
      'PDF_EMPTY:',
      'TXT_EMPTY:',
      'OPENAI_PARSE_FAILED:'
    ];

    if (typedPrefixes.some(prefix => err.message.startsWith(prefix))) {
      throw err;
    }

    // Check for OpenAI API-specific errors
    if (err.status === 401) {
      throw new Error('OPENAI_AUTH_ERROR: Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.');
    }
    if (err.status === 429) {
      throw new Error('OPENAI_RATE_LIMIT: OpenAI API rate limit reached. Please wait a few seconds and try again.');
    }
    if (err.status === 503 || err.code === 'ECONNREFUSED') {
      throw new Error('OPENAI_UNAVAILABLE: OpenAI API is temporarily unavailable. Please try again in a moment.');
    }

    throw new Error(`ANALYSIS_PIPELINE_ERROR: ${err.message}`);
  }
}
