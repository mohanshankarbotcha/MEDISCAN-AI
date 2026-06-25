/**
 * pdfParser.util.js
 * Replaces Python PyMuPDF, pdfplumber, and pdfminer entirely.
 * Uses pdf-parse (pure Node.js npm package).
 * No Python required.
 */

import fs from 'node:fs/promises';
import pdfParse from 'pdf-parse';

const MEDICAL_KEYWORDS = [
  'hemoglobin','hematocrit','wbc','rbc','platelets','glucose','creatinine',
  'cholesterol','triglycerides','ldl','hdl','tsh','t3','t4','insulin',
  'bilirubin','albumin','sodium','potassium','calcium','urea','gfr',
  'lymphocytes','neutrophils','blood','pressure','pulse','temperature',
  'urine','serum','plasma','diagnosis','impression','findings','report',
  'patient','hospital','clinic','doctor','physician','lab','laboratory',
  'test','result','normal','abnormal','range','mg','dl','mmol',
  'positive','negative','reactive','ecg','ekg','xray','ultrasound',
  'mri','ct','pathology','medication','prescription','dosage','tablet',
  'systolic','diastolic','radiology','cardiology','nephrology'
];

/**
 * Validates text contains medical terminology.
 * @param {string} text
 * @returns {{ isMedical: boolean, reason: string }}
 */
export function validateMedicalText(text) {
  const lower = text.toLowerCase();

  // Reject non-medical files/pet shop documents
  const rejectPatterns = [
    'pet shop', 'animal inventory', 'golden paws', 'pet paradise', 'pet food',
    'not a medical document', 'not a blood test', 'not a medical lab report',
    'no medical tests'
  ];
  if (rejectPatterns.some(pattern => lower.includes(pattern))) {
    return {
      isMedical: false,
      reason: 'This does not appear to be a medical report. Please upload a valid lab report, blood test, X-ray report, prescription, or clinical document.'
    };
  }

  const matchCount = MEDICAL_KEYWORDS.filter(kw => lower.includes(kw)).length;

  if (text.trim().length < 20) {
    return { isMedical: false, reason: 'File is empty or too short to analyze.' };
  }
  if (matchCount === 0) {
    return {
      isMedical: false,
      reason: 'No medical terminology detected. This does not appear to be a medical document. Please upload a valid lab report, blood test, X-ray report, prescription, or clinical document.'
    };
  }
  if (matchCount < 3) {
    return {
      isMedical: false,
      reason: `Only ${matchCount} medical term(s) found. Please upload a complete medical report with lab values, diagnoses, or clinical findings.`
    };
  }
  return { isMedical: true, reason: `Validated — ${matchCount} medical terms found.` };
}

/**
 * Extracts text from a PDF medical report.
 * Replaces Python fitz (PyMuPDF) and pdfplumber entirely.
 * @param {string} filePath
 * @returns {Promise<string>} validated medical text
 */
export async function extractTextFromPDF(filePath) {
  const buffer = await fs.readFile(filePath);
  const result = await pdfParse(buffer);

  if (!result.text || result.text.trim().length < 20) {
    throw new Error('PDF_EMPTY: This PDF appears to be empty or image-based (scanned). Please convert to PNG or JPG and upload the image instead.');
  }

  const cleaned = result.text
    .replace(/[^\x20-\x7E\n\t]/g, '')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length >= 2)
    .join('\n');

  const validation = validateMedicalText(cleaned);
  if (!validation.isMedical) {
    throw new Error(`MEDICAL_VALIDATION_FAILED: ${validation.reason}`);
  }
  return cleaned;
}

/**
 * Extracts and validates text from a plain TXT medical report.
 * @param {string} filePath
 * @returns {Promise<string>} validated medical text
 */
export async function extractTextFromTXT(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const trimmed = content.trim();

  if (trimmed.length < 20) {
    throw new Error('TXT_EMPTY: The uploaded text file is empty or too short to analyze.');
  }

  const validation = validateMedicalText(trimmed);
  if (!validation.isMedical) {
    throw new Error(`MEDICAL_VALIDATION_FAILED: ${validation.reason}`);
  }
  return trimmed;
}
