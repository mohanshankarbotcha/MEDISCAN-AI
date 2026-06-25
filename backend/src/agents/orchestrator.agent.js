/**
 * ORCHESTRATOR AGENT — Midiscanai Multi-Agent System
 * 
 * Responsibility: Central coordinator for the entire AI analysis pipeline.
 * Receives the analysis request from the controller, delegates tasks to
 * specialized agents in the correct sequence, collects results, and
 * returns the final structured output. All agents report back to this
 * orchestrator. No other agent calls another agent directly — all
 * communication routes through the orchestrator.
 *
 * Agent Communication Flow:
 * Controller → OrchestratorAgent → ReportProcessingAgent
 *                                → DataPrivacyAgent
 *                                → MedicalAnalysisAgent
 *                                → RiskAssessmentAgent
 *                                → RecommendationAgent
 *                                → AuditAgent
 *                               ← Collects all results
 * Controller ← Final structured result
 *
 * Built by BMS
 */

import { ReportProcessingAgent } from './reportProcessing.agent.js';
import { DataPrivacyAgent } from './dataPrivacy.agent.js';
import { MedicalAnalysisAgent } from './medicalAnalysis.agent.js';
import { RiskAssessmentAgent } from './riskAssessment.agent.js';
import { RecommendationAgent } from './recommendation.agent.js';
import { AuditAgent } from './audit.agent.js';

export class OrchestratorAgent {

  constructor() {
    this.agentId = 'ORCHESTRATOR';
    this.version = '1.0.0';
    this.reportProcessingAgent = new ReportProcessingAgent();
    this.dataPrivacyAgent = new DataPrivacyAgent();
    this.medicalAnalysisAgent = new MedicalAnalysisAgent();
    this.riskAssessmentAgent = new RiskAssessmentAgent();
    this.recommendationAgent = new RecommendationAgent();
    this.auditAgent = new AuditAgent();
  }

  /**
   * Main orchestration pipeline — entry point called by the controller.
   * @param {string} filePath - Absolute path to the uploaded file
   * @param {string} fileType - MIME type of the uploaded file
   * @param {string} fileId - Unique identifier for this upload
   * @returns {Promise<object>} - Complete structured medical analysis result
   */
  async orchestrate(filePath, fileType, fileId) {
    const startTime = Date.now();
    const context = {
      filePath,
      fileType,
      fileId,
      startTime,
      agentLog: []
    };

    this._log(context, 'Orchestrator initialized — starting pipeline');

    try {
      // STEP 1: Extract text from the uploaded file
      this._log(context, 'Delegating to ReportProcessingAgent');
      const processingResult = await this.reportProcessingAgent.process(filePath, fileType);
      context.extractedText = processingResult.extractedText;
      context.reportType = processingResult.reportType;
      this._log(context, `ReportProcessingAgent complete — ${context.extractedText.length} chars, type: ${context.reportType}`);

      // STEP 2: Scrub PII from extracted text before sending to AI
      this._log(context, 'Delegating to DataPrivacyAgent');
      const privacyResult = await this.dataPrivacyAgent.scrubAndValidate(context.extractedText);
      context.scrubbedText = privacyResult.scrubbedText;
      context.scrubReport = privacyResult.scrubReport;
      this._log(context, `DataPrivacyAgent complete — ${privacyResult.scrubReport.totalRedactions} PII items redacted`);

      // STEP 3: Perform AI medical analysis on scrubbed text
      this._log(context, 'Delegating to MedicalAnalysisAgent');
      const analysisResult = await this.medicalAnalysisAgent.analyze(
        context.scrubbedText,
        context.reportType
      );
      context.rawAnalysis = analysisResult;
      this._log(context, `MedicalAnalysisAgent complete — condition: ${analysisResult.detected_condition}`);

      // STEP 4: Calculate and validate risk assessment
      this._log(context, 'Delegating to RiskAssessmentAgent');
      const riskResult = await this.riskAssessmentAgent.assess(
        context.rawAnalysis,
        context.extractedText
      );
      context.riskResult = riskResult;
      this._log(context, `RiskAssessmentAgent complete — risk score: ${riskResult.risk_score}, level: ${riskResult.condition_level}`);

      // STEP 5: Generate patient recommendations
      this._log(context, 'Delegating to RecommendationAgent');
      const recommendResult = await this.recommendationAgent.recommend(
        context.rawAnalysis,
        context.riskResult,
        context.reportType
      );
      context.recommendations = recommendResult;
      this._log(context, 'RecommendationAgent complete');

      // STEP 6: Compile final result from all agent outputs
      const finalResult = this._compileFinalResult(context);

      // STEP 7: Log audit trail (fire and forget — does not block response)
      this.auditAgent.logAnalysis({
        fileId,
        reportType: context.reportType,
        riskScore: finalResult.risk_score,
        conditionLevel: finalResult.condition_level,
        processingTimeMs: Date.now() - startTime,
        agentLog: context.agentLog,
        scrubReport: context.scrubReport
      }).catch(err => console.error('[AuditAgent] Non-blocking log error:', err.message));

      this._log(context, `Orchestration complete in ${Date.now() - startTime}ms`);
      return finalResult;

    } catch (err) {
      console.error('[OrchestratorAgent] Pipeline failed:', err.message);
      // Re-throw typed errors so controller returns correct HTTP status
      const typedPrefixes = [
        'MEDICAL_VALIDATION_FAILED:',
        'UNSUPPORTED_TYPE:',
        'PDF_EMPTY:',
        'TXT_EMPTY:',
        'AI_PARSE_FAILED:',
        'AI_AUTH_ERROR:',
        'AI_RATE_LIMIT:'
      ];
      if (typedPrefixes.some(p => err.message.startsWith(p))) throw err;
      throw new Error(`ORCHESTRATOR_ERROR: ${err.message}`);
    }
  }

  _log(context, message) {
    const entry = `[${this.agentId}][${Date.now() - context.startTime}ms] ${message}`;
    context.agentLog.push(entry);
    console.log(entry);
  }

  _compileFinalResult(context) {
    return {
      detected_condition:    context.rawAnalysis.detected_condition,
      risk_score:            context.riskResult.risk_score,
      condition_level:       context.riskResult.condition_level,
      clinical_explanation:  context.rawAnalysis.clinical_explanation,
      recommended_guidance:  context.recommendations.recommended_guidance,
      estimated_cost:        context.recommendations.estimated_cost,
      extracted_metrics:     context.rawAnalysis.extracted_metrics,
      detection_reasoning:   context.rawAnalysis.detection_reasoning,
      report_type:           context.reportType,
      processing_time_ms:    Date.now() - context.startTime,
      agents_used: [
        'OrchestratorAgent',
        'ReportProcessingAgent',
        'DataPrivacyAgent',
        'MedicalAnalysisAgent',
        'RiskAssessmentAgent',
        'RecommendationAgent',
        'AuditAgent'
      ]
    };
  }
}

// Backwards-compatible function export for the controller
export async function runAnalysis(filePath, fileType, fileId = 'unknown') {
  const orchestrator = new OrchestratorAgent();
  return orchestrator.orchestrate(filePath, fileType, fileId);
}
