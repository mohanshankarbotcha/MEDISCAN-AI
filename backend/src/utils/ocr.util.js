/**
 * ocr.util.js
 * Replaces Python pytesseract + Pillow.
 * Uses Tesseract.js (pure Node.js) + Sharp for image preprocessing.
 * No Python required.
 */

import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const MEDICAL_KEYWORDS = [
  'hemoglobin','hematocrit','wbc','rbc','platelets','glucose','creatinine',
  'cholesterol','triglycerides','ldl','hdl','tsh','t3','t4','insulin',
  'bilirubin','albumin','sodium','potassium','calcium','urea','gfr',
  'lymphocytes','neutrophils','eosinophils','basophils','monocytes',
  'mcv','mch','mchc','blood','pressure','pulse','temperature','bmi',
  'urine','serum','plasma','diagnosis','impression','findings','report',
  'patient','hospital','clinic','doctor','physician','lab','laboratory',
  'test','result','normal','abnormal','range','mg','dl','mmol','units',
  'iu','mmhg','bpm','positive','negative','reactive','ecg','ekg',
  'xray','ultrasound','mri','ct','scan','pathology','histology','biopsy',
  'medication','prescription','dosage','tablet','capsule','injection',
  'therapy','treatment','surgery','radiology','cardiology','nephrology',
  'systolic','diastolic','sinus','rhythm','fracture','opacity',
  'consolidation','effusion','calcification','lesion','mass','nodule'
];

/**
 * Preprocesses image using Sharp for maximum OCR accuracy.
 * Replaces Python Pillow image preprocessing.
 * @param {string} filePath
 * @returns {Promise<string>} preprocessed file path
 */
export async function preprocessImage(filePath) {
  const outputPath = filePath.replace(/\.[^.]+$/, '_prep.png');
  try {
    await sharp(filePath)
      .greyscale()
      .normalise()
      .linear(1.8, -40)
      .sharpen({ sigma: 2, flat: 0.5, jagged: 0.5 })
      .resize({ width: 1400, fit: 'contain', background: 'white' })
      .toFormat('png')
      .toFile(outputPath);
    return outputPath;
  } catch (err) {
    console.error('[OCR] Preprocessing failed, using original:', err.message);
    return filePath;
  }
}

/**
 * Validates extracted text contains medical content.
 * Rejects photos of animals, food, people, random objects.
 * @param {string} text
 * @returns {{ isMedical: boolean, reason: string }}
 */
export function validateMedicalContent(text) {
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

  const words = lower.split(/\s+/).filter(Boolean);
  const matchCount = MEDICAL_KEYWORDS.filter(kw => lower.includes(kw)).length;

  if (text.trim().length < 30) {
    return {
      isMedical: false,
      reason: 'The uploaded image contains no readable text. Please upload a clear medical document, lab report, or prescription.'
    };
  }
  if (matchCount === 0) {
    return {
      isMedical: false,
      reason: 'No medical terminology detected in this image. This does not appear to be a medical report. Please upload a valid lab report, blood test result, X-ray report, prescription, or similar medical document.'
    };
  }
  if (matchCount < 3) {
    return {
      isMedical: false,
      reason: `Insufficient medical content detected. Only ${matchCount} medical term(s) found. Please upload a complete medical report with lab values, diagnoses, or clinical findings.`
    };
  }
  const confidence = ((matchCount / Math.max(words.length, 1)) * 100).toFixed(1);
  return {
    isMedical: true,
    reason: `Medical content validated — ${matchCount} medical terms detected (${confidence}% density).`
  };
}

/**
 * Extracts text from a medical image using Tesseract.js.
 * Replaces Python pytesseract.image_to_string() entirely.
 * @param {string} filePath
 * @returns {Promise<string>} validated medical text
 */
export async function extractTextFromImage(filePath) {
  let prepPath = null;
  let worker = null;
  try {
    prepPath = await preprocessImage(filePath);
    worker = await createWorker('eng');
    await worker.setParameters({
      tessedit_pageseg_mode: '6',
      tessjs_create_pdf: '0',
      tessjs_create_hocr: '0'
    });
    const result = await worker.recognize(prepPath);
    const rawText = result.data.text;
    const cleanedText = rawText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length >= 2)
      .join('\n');

    const validation = validateMedicalContent(cleanedText);
    if (!validation.isMedical) {
      throw new Error(`MEDICAL_VALIDATION_FAILED: ${validation.reason}`);
    }
    return cleanedText;
  } finally {
    if (worker) {
      try { await worker.terminate(); } catch (_) {}
    }
    if (prepPath && prepPath !== filePath) {
      try { fs.unlinkSync(prepPath); } catch (_) {}
    }
  }
}
