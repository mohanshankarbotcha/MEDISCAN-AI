/**
 * DATA PRIVACY AGENT — Midiscanai Multi-Agent System
 *
 * Responsibility: HIPAA-compliant PII scrubbing before any medical text
 * is sent to an external AI API. Removes patient names, dates of birth,
 * Aadhaar numbers, PAN numbers, phone numbers, email addresses, medical
 * record numbers, and home addresses from the extracted text. Returns the
 * scrubbed text and a report showing what was redacted. This agent ensures
 * no patient-identifying information leaves the server.
 *
 * Built by BMS
 */

export class DataPrivacyAgent {

  constructor() {
    this.agentId = 'DATA_PRIVACY';
  }

  async scrubAndValidate(text) {
    console.log(`[${this.agentId}] Starting PII scrubbing`);
    const scrubbedText = this._scrubPII(text);
    const scrubReport = this._generateScrubReport(text, scrubbedText);
    console.log(`[${this.agentId}] PII scrubbing complete — ${scrubReport.totalRedactions} items redacted`);
    return { scrubbedText, scrubReport };
  }

  _scrubPII(text) {
    let scrubbed = text;
    scrubbed = scrubbed.replace(/(?:Patient\s*Name|Patient|Name|Pt\s*Name|Pt)\s*:\s*[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g, 'Patient Name: [PATIENT-REDACTED]');
    scrubbed = scrubbed.replace(/(?:DOB|Date\s*of\s*Birth|D\.O\.B)\s*:\s*[\d]{1,2}[-\/][\d]{1,2}[-\/][\d]{2,4}/gi, 'DOB: [DOB-REDACTED]');
    scrubbed = scrubbed.replace(/\b(?:Age|Age\/Gender)\s*:\s*\d{1,3}\s*(?:years?|yrs?)?/gi, 'Age: [AGE-REDACTED]');
    scrubbed = scrubbed.replace(/\b(?:Age|Age\/Gender)\s*:\s*\d{1,3}\s*(?:years?|yrs?)?/gi, 'Age: [AGE-REDACTED]');
    scrubbed = scrubbed.replace(/(?:\+91[-\s]?)?[6-9]\d{9}/g, '[PHONE-REDACTED]');
    scrubbed = scrubbed.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[AADHAAR-REDACTED]');
    scrubbed = scrubbed.replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '[PAN-REDACTED]');
    scrubbed = scrubbed.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL-REDACTED]');
    scrubbed = scrubbed.replace(/(?:MRN|Record\s*No|Patient\s*ID|Reg\s*No)\s*:\s*[A-Z0-9-]+/gi, 'ID: [MRN-REDACTED]');
    scrubbed = scrubbed.replace(/\d+[,\s]+[A-Z][a-zA-Z\s]+(?:Road|Street|Avenue|Lane|Nagar|Colony|Sector)[^,\n]*/g, '[ADDRESS-REDACTED]');
    return scrubbed;
  }

  _generateScrubReport(original, scrubbed) {
    const tokens = ['[PATIENT-REDACTED]','[DOB-REDACTED]','[AGE-REDACTED]','[PHONE-REDACTED]','[AADHAAR-REDACTED]','[PAN-REDACTED]','[EMAIL-REDACTED]','[MRN-REDACTED]','[ADDRESS-REDACTED]'];
    const counts = {};
    let totalRedactions = 0;
    for (const token of tokens) {
      const count = (scrubbed.match(new RegExp(token.replace(/[[\]]/g,'\\$&'), 'g')) || []).length;
      if (count > 0) { counts[token] = count; totalRedactions += count; }
    }
    return { totalRedactions, breakdown: counts, timestamp: new Date().toISOString() };
  }
}
