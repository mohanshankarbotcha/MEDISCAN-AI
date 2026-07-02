/**
 * MEDICAL ANALYSIS AGENT — Midiscanai Multi-Agent System
 *
 * Responsibility: Calls Google Gemini API with the scrubbed medical text
 * and returns the raw structured analysis. Uses the centralized
 * GeminiService for all API calls. Handles prompt construction,
 * response parsing, and validation.
 *
 * Provider: Google Gemini API (replaces OpenRouter)
 * Model: gemini-2.5-flash (configured via GEMINI_MODEL env var)
 *
 * Built by BMS
 */

import { callGeminiJSON, getModelName } from '../services/gemini.service.js';

export class MedicalAnalysisAgent {

  constructor() {
    this.agentId = 'MEDICAL_ANALYSIS';
  }

  async analyze(scrubbedText, reportType) {
    console.log(`[${this.agentId}] Calling Google Gemini — model: ${getModelName()}`);
    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt(scrubbedText, reportType);
    const result = await callGeminiJSON(systemPrompt, userPrompt);
    console.log(`[${this.agentId}] Gemini analysis complete — condition: ${result.detected_condition}`);
    return result;
  }

  _buildSystemPrompt() {
    return `You are MediScan AI, a professional clinical medical report analysis agent built by BMS. Analyze medical reports and return results in simple clear patient-friendly language. Maximum 2 sentences per text field. Write like a doctor explaining to a patient — not academic language. Every field must contain real specific information from the report. Respond with raw JSON only — no markdown, no code fences, no extra text. The first character of your response must be { and the last must be }.`;
  }

  _buildUserPrompt(text, reportType) {
    return `Analyze this medical report classified as: ${reportType}

Return a raw JSON object with exactly these 8 keys:

"detected_condition" — condition name plus the single most important abnormal value. Max 15 words. Example: "Iron Deficiency Anemia — Hemoglobin 8.2 g/dL (Normal: 12-16 g/dL)". Never just the condition name alone.

"risk_score" — integer 0 to 100 based on how far values deviate from normal ranges. 0-30 mild or none, 31-70 moderate needs doctor, 71-100 severe needs urgent care.

"condition_level" — exactly "Low" if 0-30, exactly "Medium" if 31-70, exactly "High" if 71-100. Must match risk_score.

"clinical_explanation" — maximum 2 sentences. Sentence 1: which value is abnormal and by how much. Sentence 2: what this means for the patient in plain words. No medical jargon.

"recommended_guidance" — maximum 2 sentences. Sentence 1: most important single action the patient must take right now with specialist type and urgency. Sentence 2: one specific lifestyle or dietary change relevant to this condition.

"estimated_cost" — specific INR cost range for this exact condition. Include consultation, tests, and medication estimate. Never write "Not determined". Example: "INR 800 to INR 2,500 covering specialist consultation, repeat blood tests, and prescribed supplements."

"extracted_metrics" — JSON object where each key is a clean human-readable metric name with no underscores (use spaces and proper capitalization) and each value is the measured result plus normal range in brackets. Mark abnormal values with ⚠ prefix. Example: "⚠ 8.2 g/dL [Normal: 12.0-16.0 g/dL]".

"detection_reasoning" — maximum 2 sentences. Sentence 1: exact metric values that triggered this diagnosis. Sentence 2: why those values point to this condition and not something else.

Medical report text:
${text}`;
  }
}
