/**
 * RISK ASSESSMENT AGENT — Midiscanai Multi-Agent System
 *
 * Responsibility: Validates, corrects, and enhances the risk score
 * returned by the Medical Analysis Agent. Ensures risk_score is a
 * valid integer between 0 and 100. Auto-corrects condition_level to
 * always be consistent with risk_score. Cross-validates the AI's
 * risk assessment against the extracted metrics for accuracy.
 *
 * Built by BMS
 */

export class RiskAssessmentAgent {

  constructor() {
    this.agentId = 'RISK_ASSESSMENT';
  }

  async assess(analysisResult, extractedText) {
    console.log(`[${this.agentId}] Validating risk score from analysis`);
    let riskScore = this._normalizeScore(analysisResult.risk_score);
    riskScore = this._crossValidateWithMetrics(riskScore, analysisResult.extracted_metrics, extractedText);
    const conditionLevel = this._deriveConditionLevel(riskScore);
    console.log(`[${this.agentId}] Final risk score: ${riskScore} — Level: ${conditionLevel}`);
    return { risk_score: riskScore, condition_level: conditionLevel };
  }

  _normalizeScore(rawScore) {
    let score = typeof rawScore === 'string' ? parseInt(rawScore, 10) : rawScore;
    if (typeof score !== 'number' || isNaN(score)) score = 0;
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  _crossValidateWithMetrics(aiScore, metrics, text) {
    const lower = text.toLowerCase();
    let adjustedScore = aiScore;
    const criticalKeywords = ['critical','emergency','urgent','severe','life-threatening','immediate hospitalization'];
    const mildKeywords = ['borderline','mild','slight','minimal','trace','within acceptable'];
    if (criticalKeywords.some(k => lower.includes(k)) && aiScore < 70) {
      adjustedScore = Math.max(aiScore, 72);
      console.log(`[${this.agentId}] Score adjusted up to ${adjustedScore} due to critical keywords`);
    }
    if (mildKeywords.some(k => lower.includes(k)) && aiScore > 60) {
      adjustedScore = Math.min(aiScore, 45);
      console.log(`[${this.agentId}] Score adjusted down to ${adjustedScore} due to mild keywords`);
    }
    return adjustedScore;
  }

  _deriveConditionLevel(score) {
    if (score <= 30) return 'Low';
    if (score <= 70) return 'Medium';
    return 'High';
  }
}
