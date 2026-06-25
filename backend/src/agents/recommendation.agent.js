/**
 * RECOMMENDATION AGENT — Midiscanai Multi-Agent System
 *
 * Responsibility: Reviews the medical analysis and risk assessment results
 * and generates or validates patient-friendly recommended guidance and
 * estimated cost. Ensures recommendations are specific, actionable, and
 * relevant to the detected condition and risk level. Also validates that
 * estimated_cost always contains a real INR range and never returns
 * "Not determined" placeholders.
 *
 * Built by BMS
 */

export class RecommendationAgent {

  constructor() {
    this.agentId = 'RECOMMENDATION';
    this.costFallbacks = {
      'Blood': 'INR 500 to INR 2,000 for follow-up blood tests, specialist consultation, and prescribed supplements.',
      'Diabetes': 'INR 1,200 to INR 4,000 for endocrinologist consultation, HbA1c test, glucose monitoring kit, and initial medication.',
      'Kidney': 'INR 1,500 to INR 5,000 for nephrologist consultation, urine and serum tests, and dietary management.',
      'Liver': 'INR 1,000 to INR 3,500 for hepatologist consultation, liver panel repeat tests, and prescribed medication.',
      'Thyroid': 'INR 800 to INR 2,500 for endocrinologist consultation, TSH follow-up test, and thyroid medication if prescribed.',
      'Cardiac': 'INR 2,000 to INR 8,000 for cardiologist consultation, ECG, echocardiogram, and cardiac medication.',
      'Lipid': 'INR 800 to INR 2,500 for physician consultation, lipid profile repeat test, and statin medication if prescribed.',
      'General': 'INR 500 to INR 2,000 for physician consultation and follow-up tests based on findings.'
    };
  }

  async recommend(analysisResult, riskResult, reportType) {
    console.log(`[${this.agentId}] Generating recommendations for risk level: ${riskResult.condition_level}`);
    const recommendedGuidance = this._validateGuidance(analysisResult.recommended_guidance, riskResult.condition_level, reportType);
    const estimatedCost = this._validateCost(analysisResult.estimated_cost, reportType);
    console.log(`[${this.agentId}] Recommendations finalized`);
    return { recommended_guidance: recommendedGuidance, estimated_cost: estimatedCost };
  }

  _validateGuidance(guidance, conditionLevel, reportType) {
    if (!guidance || typeof guidance !== 'string' || guidance.includes('Not determined') || guidance.trim().length < 20) {
      const urgency = conditionLevel === 'High' ? 'See a doctor urgently within 24-48 hours.' : conditionLevel === 'Medium' ? 'Schedule a doctor appointment within 1-2 weeks.' : 'Monitor your health and follow up with your doctor in 4-6 weeks.';
      return `${urgency} Follow a balanced diet, stay hydrated, exercise moderately, and take all prescribed medications as directed.`;
    }
    return guidance;
  }

  _validateCost(cost, reportType) {
    if (!cost || typeof cost !== 'string' || cost.includes('Not determined') || cost.trim().length < 10 || !cost.toLowerCase().includes('inr')) {
      const reportKey = Object.keys(this.costFallbacks).find(k => reportType.toLowerCase().includes(k.toLowerCase())) || 'General';
      return this.costFallbacks[reportKey];
    }
    return cost;
  }
}
