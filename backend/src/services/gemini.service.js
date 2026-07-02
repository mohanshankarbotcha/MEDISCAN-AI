/**
 * gemini.service.js — Google Gemini API Service
 * Midiscanai Medical Intelligence Platform
 *
 * Centralized wrapper for all Google Gemini API calls.
 * Replaces all OpenRouter API calls across all agents.
 * Uses the official @google/generative-ai SDK.
 *
 * All seven AI agents import and use this service.
 * Model is configured via GEMINI_MODEL environment variable.
 * API key is configured via GOOGLE_API_KEY environment variable.
 *
 * Built by BMS
 */

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Google Generative AI client
// Reads GOOGLE_API_KEY from process.env automatically
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Model name from environment variable with fallback
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Safety settings — configured permissively for medical content
// Medical reports contain clinical language that default safety filters may block
const SAFETY_SETTINGS = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
  }
];

/**
 * Calls the Gemini API with a system prompt and user prompt.
 * Returns the raw text response from the model.
 * Includes 3-attempt retry logic for transient failures.
 *
 * @param {string} systemPrompt - The system instruction for the model
 * @param {string} userPrompt - The user message containing the medical report
 * @param {object} options - Optional config overrides
 * @param {number} options.maxOutputTokens - Max tokens (default 2048)
 * @param {number} options.temperature - Temperature (default 0.1 for medical accuracy)
 * @returns {Promise<string>} - Raw text response from Gemini
 */
export async function callGemini(systemPrompt, userPrompt, options = {}) {
  const maxOutputTokens = options.maxOutputTokens || 2048;
  const temperature = options.temperature || 0.1;

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: systemPrompt,
    safetySettings: SAFETY_SETTINGS,
    generationConfig: {
      maxOutputTokens,
      temperature,
      responseMimeType: 'application/json'
    }
  });

  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`[GeminiService] Attempt ${attempt} — model: ${MODEL_NAME}`);

      const result = await model.generateContent(userPrompt);
      const response = result.response;

      // Check for blocked response
      if (!response || !response.candidates || response.candidates.length === 0) {
        throw new Error('GEMINI_BLOCKED: Response was blocked by safety filters or returned empty.');
      }

      const candidate = response.candidates[0];

      // Check finish reason
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('GEMINI_SAFETY_BLOCK: Content was blocked by Gemini safety filters. The medical report may contain flagged content.');
      }

      if (candidate.finishReason === 'RECITATION') {
        throw new Error('GEMINI_RECITATION: Response blocked due to recitation policy.');
      }

      const text = response.text();

      if (!text || text.trim().length === 0) {
        throw new Error('GEMINI_EMPTY: Gemini returned an empty response.');
      }

      console.log(`[GeminiService] Attempt ${attempt} succeeded — ${text.length} chars returned`);
      return text.trim();

    } catch (err) {
      lastError = err;

      // Do not retry on authentication errors
      if (err.message?.includes('API_KEY_INVALID') || err.message?.includes('API key not valid') || err.status === 400) {
        throw new Error(`GEMINI_AUTH_ERROR: Invalid Google API key. Please check your GOOGLE_API_KEY in the .env file. Get a valid key from https://aistudio.google.com/apikey`);
      }

      // Do not retry on quota exceeded
      if (err.status === 429 || err.message?.includes('RESOURCE_EXHAUSTED') || err.message?.includes('quota')) {
        throw new Error(`GEMINI_QUOTA_EXCEEDED: Google Gemini API quota exceeded. Please check your usage at https://aistudio.google.com or upgrade your plan.`);
      }

      // Do not retry on safety blocks
      if (err.message?.startsWith('GEMINI_SAFETY_BLOCK:') || err.message?.startsWith('GEMINI_BLOCKED:')) {
        throw err;
      }

      // Retry on transient errors
      if (attempt < 3) {
        const waitMs = attempt * 2000;
        console.warn(`[GeminiService] Attempt ${attempt} failed: ${err.message} — retrying in ${waitMs}ms`);
        await new Promise(r => setTimeout(r, waitMs));
      }
    }
  }

  throw new Error(`GEMINI_FAILED: Gemini API failed after 3 attempts. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Calls Gemini and parses the response as JSON.
 * Handles JSON extraction from response text with multiple fallback strategies.
 *
 * @param {string} systemPrompt - System instruction
 * @param {string} userPrompt - User message
 * @param {object} options - Optional config overrides
 * @returns {Promise<object>} - Parsed JSON object from Gemini response
 */
export async function callGeminiJSON(systemPrompt, userPrompt, options = {}) {
  const rawText = await callGemini(systemPrompt, userPrompt, options);

  // Strategy 1: Direct JSON parse (works when responseMimeType: application/json is honored)
  try {
    return JSON.parse(rawText);
  } catch (_) {}

  // Strategy 2: Strip markdown code fences and try again
  const stripped = rawText
    .replace(/^```(?:json)?\s*/im, '')
    .replace(/\s*```\s*$/m, '')
    .trim();
  try {
    return JSON.parse(stripped);
  } catch (_) {}

  // Strategy 3: Extract JSON object from text using regex
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]);
    } catch (_) {}
  }

  // All strategies failed
  throw new Error(`GEMINI_PARSE_FAILED: Could not parse Gemini response as JSON. Raw response preview: ${rawText.slice(0, 300)}`);
}

/**
 * Returns the current Gemini model name being used.
 * Useful for logging and audit purposes.
 * @returns {string}
 */
export function getModelName() {
  return MODEL_NAME;
}

/**
 * Validates that the GOOGLE_API_KEY environment variable is set.
 * Call this at server startup to fail fast if the key is missing.
 * @returns {boolean}
 */
export function validateApiKey() {
  if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your_google_gemini_api_key_here') {
    console.error('[GeminiService] ✗ GOOGLE_API_KEY is not configured in .env file');
    console.error('[GeminiService] Get your API key from: https://aistudio.google.com/apikey');
    return false;
  }
  console.log(`[GeminiService] ✓ GOOGLE_API_KEY is configured — model: ${MODEL_NAME}`);
  return true;
}
