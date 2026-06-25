/**
 * AUDIT AGENT — Midiscanai Multi-Agent System
 *
 * Responsibility: Records an audit trail for every analysis request.
 * Logs which agents were used, how long each took, what PII was
 * scrubbed, the risk score assigned, and any errors encountered.
 * Runs asynchronously in the background and never blocks the main
 * pipeline response. Writes to the database audit_logs table.
 *
 * Built by BMS
 */

export class AuditAgent {

  constructor() {
    this.agentId = 'AUDIT';
  }

  async logAnalysis({ fileId, reportType, riskScore, conditionLevel, processingTimeMs, agentLog, scrubReport }) {
    try {
      console.log(`[${this.agentId}] Writing audit log for fileId: ${fileId}`);
      const auditEntry = {
        fileId,
        reportType,
        riskScore,
        conditionLevel,
        processingTimeMs,
        agentCount: 7,
        agentsUsed: ['OrchestratorAgent','ReportProcessingAgent','DataPrivacyAgent','MedicalAnalysisAgent','RiskAssessmentAgent','RecommendationAgent','AuditAgent'],
        piiItemsRedacted: scrubReport?.totalRedactions || 0,
        agentLog: agentLog || [],
        timestamp: new Date().toISOString()
      };
      // Write to database if AuditService is available
      try {
        const { AuditService } = await import('../services/database.service.js');
        await AuditService.log('MULTI_AGENT_ANALYSIS_COMPLETE', {
          resourceType: 'report',
          resourceId: fileId,
          additionalData: auditEntry
        });
      } catch {
        // Database logging optional — log to console if DB unavailable
        console.log(`[${this.agentId}] Audit (console fallback):`, JSON.stringify(auditEntry, null, 2));
      }
    } catch (err) {
      console.error(`[${this.agentId}] Audit logging failed (non-critical):`, err.message);
    }
  }
}
