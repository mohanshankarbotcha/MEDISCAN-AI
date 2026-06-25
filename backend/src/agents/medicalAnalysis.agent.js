/**
 * MEDICAL ANALYSIS AGENT — Midiscanai Multi-Agent System
 *
 * Responsibility: Calls the AI API (OpenRouter / OpenAI / Claude) with
 * the scrubbed medical text and returns the raw structured analysis.
 * Handles prompt construction, API call retries, JSON parsing, and
 * fallback logic. Does NOT calculate final risk scores or recommendations
 * — those are handled by specialized downstream agents.
 *
 * Built by BMS
 */

export class MedicalAnalysisAgent {

  constructor() {
    this.agentId = 'MEDICAL_ANALYSIS';
    this.apiUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    this.model = process.env.AI_MODEL || 'openai/gpt-4o';
  }

  async analyze(scrubbedText, reportType) {
    console.log(`[${this.agentId}] Calling AI model: ${this.model}`);
    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt(scrubbedText, reportType);
    const result = await this._callWithRetry(systemPrompt, userPrompt);
    console.log(`[${this.agentId}] AI analysis complete — condition: ${result.detected_condition}`);
    return result;
  }

  _buildSystemPrompt() {
    return `You are MediScan AI, a professional clinical medical report analysis agent built by BMS. Analyze medical reports and return results in simple clear patient-friendly language. Maximum 2 sentences per text field. Write like a doctor explaining to a patient — not academic language. Every field must contain real specific information from the report. Respond with raw JSON only — no markdown, no code fences, no extra text.`;
  }

  _buildUserPrompt(text, reportType) {
    return `Analyze this ${reportType}. Return a raw JSON object with exactly these keys:
"detected_condition" — condition name plus the key abnormal value. Max 15 words. Example: "Iron Deficiency Anemia — Hemoglobin 8.2 g/dL (Normal: 12-16 g/dL)".
"risk_score" — integer 0-100 based on deviation from normal ranges. 0-30 mild, 31-70 moderate, 71-100 severe.
"condition_level" — exactly "Low" (0-30), "Medium" (31-70), or "High" (71-100).
"clinical_explanation" — 2 sentences max. State which value is abnormal and what it means for the patient in plain words.
"recommended_guidance" — 2 sentences max. Most important action + one lifestyle change. Be specific.
"estimated_cost" — specific INR range for this condition. Never write "Not determined". Example: "INR 800 to INR 2,500 for specialist consultation, repeat tests, and iron supplements".
"extracted_metrics" — object where keys are clean readable names (no underscores, use spaces) and values are "measured value [Normal: reference range]". Mark abnormal values with ⚠ prefix.
"detection_reasoning" — 2 sentences max. Which specific values triggered this diagnosis and why.

Medical report:
${text}`;
  }

  async _callWithRetry(systemPrompt, userPrompt) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await fetch(`${this.apiUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://midiscanai.com',
            'X-Title': 'Midiscanai Medical Platform'
          },
          body: JSON.stringify({
            model: this.model,
            max_tokens: 2048,
            temperature: 0.1,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ]
          }),
          signal: AbortSignal.timeout(60000)
        });

        if (response.status === 401) throw new Error('AI_AUTH_ERROR: Invalid API key. Check OPENROUTER_API_KEY in .env file.');
        if (response.status === 429) throw new Error('AI_RATE_LIMIT: API rate limit reached. Please wait and try again.');
        if (!response.ok) throw new Error(`AI_HTTP_ERROR: API returned status ${response.status}`);

        const data = await response.json();
        const rawText = data.choices?.[0]?.message?.content?.trim() || '';
        const cleaned = rawText.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/i,'').trim();

        try {
          return JSON.parse(cleaned);
        } catch {
          if (attempt === 3) throw new Error(`AI_PARSE_FAILED: Could not parse JSON after 3 attempts. Raw: ${cleaned.slice(0,200)}`);
          console.warn(`[${this.agentId}] Attempt ${attempt} parse failed — retrying`);
        }
      } catch (err) {
        if (err.message.startsWith('AI_AUTH_ERROR:') || err.message.startsWith('AI_RATE_LIMIT:')) throw err;
        if (attempt === 3) throw err;
        console.warn(`[${this.agentId}] Attempt ${attempt} failed: ${err.message} — retrying in 2s`);
        await new Promise(r => setTimeout(r, 2000));
      }
    }
  }
}
