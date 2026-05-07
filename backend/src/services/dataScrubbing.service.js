/**
 * HIPAA-Compliant Data Scrubbing Service for Midiscanai
 */

export class DataScrubbingService {
  /**
   * Redacts Personally Identifiable Information (PII) from text
   * @param {string} text - The text to scrub
   * @returns {string} - Scrubbed text
   */
  static scrubPII(text) {
    let scrubbed = text;

    // Redact Patient Names
    const nameRegex = /(Patient Name:|Patient:|Name:|Pt Name:|Pt:)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/g;
    scrubbed = scrubbed.replace(nameRegex, "$1 [PATIENT-REDACTED]");

    // Redact Dates of Birth (DOB)
    const dobRegex = /(DOB:|Date of Birth:|D\.O\.B:)\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|[A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/gi;
    scrubbed = scrubbed.replace(dobRegex, "$1 [DOB-REDACTED]");

    // Redact Age
    const ageRegex = /Age:\s+\d+|(\d+\s+years?)|(\d+\s+year\s+old)/gi;
    scrubbed = scrubbed.replace(ageRegex, "[AGE-REDACTED]");

    // Redact Phone Numbers (Indian format)
    const phoneRegex = /(\+91[\-\s]?)?[6-9]\d{9}|\b\d{10}\b/g;
    scrubbed = scrubbed.replace(phoneRegex, "[PHONE-REDACTED]");

    // Redact Aadhaar (12 digits)
    const aadhaarRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
    scrubbed = scrubbed.replace(aadhaarRegex, "[AADHAAR-REDACTED]");

    // Redact PAN (5 letters, 4 digits, 1 letter)
    const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
    scrubbed = scrubbed.replace(panRegex, "[PAN-REDACTED]");

    // Redact Emails
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    scrubbed = scrubbed.replace(emailRegex, "[EMAIL-REDACTED]");

    // Redact Medical Record Numbers (MRN)
    const mrnRegex = /(MRN:|Record No:|Patient ID:|Reg No:)\s+[A-Z0-9\-]+/gi;
    scrubbed = scrubbed.replace(mrnRegex, "$1 [MRN-REDACTED]");

    // Redact Addresses
    const addressRegex = /\d+\s+[A-Z][a-z]+\s+(Road|Street|Avenue|Lane|Nagar|Colony)/gi;
    scrubbed = scrubbed.replace(addressRegex, "[ADDRESS-REDACTED]");

    return scrubbed;
  }

  /**
   * Generates a report of how many redactions were made
   */
  static getScrubReport(originalText, scrubbedText) {
    const types = [
      '[PATIENT-REDACTED]', '[DOB-REDACTED]', '[AGE-REDACTED]',
      '[PHONE-REDACTED]', '[AADHAAR-REDACTED]', '[PAN-REDACTED]',
      '[EMAIL-REDACTED]', '[MRN-REDACTED]', '[ADDRESS-REDACTED]'
    ];

    const report = {};
    types.forEach(type => {
      const count = (scrubbedText.match(new RegExp(type.replace(/[\[\]]/g, '\\$&'), 'g')) || []).length;
      if (count > 0) report[type] = count;
    });

    return report;
  }
}
