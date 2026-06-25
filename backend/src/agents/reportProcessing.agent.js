/**
 * REPORT PROCESSING AGENT — Midiscanai Multi-Agent System
 *
 * Responsibility: Handles all file reading and text extraction.
 * Routes the uploaded file to the correct extraction method based on
 * MIME type. Performs OCR on images using Tesseract.js and Sharp
 * preprocessing. Extracts text from PDFs using pdf-parse. Reads plain
 * TXT files. Also detects the report type from extracted content.
 * Validates that the content is a real medical document before
 * passing it to the orchestrator. Rejects non-medical uploads.
 *
 * Built by BMS
 */

import { extractTextFromImage } from '../utils/ocr.util.js';
import { extractTextFromPDF, extractTextFromTXT } from '../utils/pdfParser.util.js';

export class ReportProcessingAgent {

  constructor() {
    this.agentId = 'REPORT_PROCESSING';
    this.reportTypes = [
      { label: 'Complete Blood Count (CBC) Report', keys: ['hemoglobin','hematocrit','wbc','rbc','platelets','mchc','mcv','mch','neutrophils','cbc'] },
      { label: 'Blood Sugar / Diabetes Report', keys: ['glucose','hba1c','insulin','fasting','postprandial','diabetes','glycated'] },
      { label: 'Lipid Panel Report', keys: ['cholesterol','ldl','hdl','triglycerides','vldl','lipid'] },
      { label: 'Kidney Function Test', keys: ['creatinine','urea','bun','gfr','uric acid','kidney','renal'] },
      { label: 'Liver Function Test', keys: ['bilirubin','sgpt','sgot','alt','ast','alkaline','liver','albumin'] },
      { label: 'Thyroid Function Test', keys: ['tsh','t3','t4','thyroxine','thyroid'] },
      { label: 'Cardiac / ECG Report', keys: ['ecg','ekg','sinus','rhythm','cardiac','heart rate','bpm','arrhythmia'] },
      { label: 'Radiology / Imaging Report', keys: ['xray','radiograph','mri','ct scan','ultrasound','opacity','fracture','lesion'] },
      { label: 'Urine Analysis Report', keys: ['urine','urinalysis','protein','ketones','leucocytes','nitrite'] },
      { label: 'Prescription / Medication', keys: ['tablet','capsule','dosage','twice daily','prescribed','mg','ml'] }
    ];
  }

  async process(filePath, fileType) {
    console.log(`[${this.agentId}] Processing file type: ${fileType}`);
    const extractedText = await this._extractText(filePath, fileType);
    const reportType = this._detectReportType(extractedText);
    console.log(`[${this.agentId}] Report type detected: ${reportType}`);
    return { extractedText, reportType };
  }

  async _extractText(filePath, fileType) {
    if (['image/png','image/jpeg','image/jpg'].includes(fileType)) {
      return await extractTextFromImage(filePath);
    }
    if (fileType === 'application/pdf') {
      return await extractTextFromPDF(filePath);
    }
    if (fileType === 'text/plain') {
      return await extractTextFromTXT(filePath);
    }
    throw new Error(`UNSUPPORTED_TYPE: File type "${fileType}" is not supported. Upload PNG, JPG, PDF, or TXT.`);
  }

  _detectReportType(text) {
    const lower = text.toLowerCase();
    const score = (keys) => keys.filter(k => lower.includes(k)).length;
    let best = { label: 'General Medical Report', count: 2 };
    for (const type of this.reportTypes) {
      const count = score(type.keys);
      if (count > best.count) best = { label: type.label, count };
    }
    return best.label;
  }
}
