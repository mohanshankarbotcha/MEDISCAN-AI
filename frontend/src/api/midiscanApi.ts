/**
 * midiscanApi.ts
 * Frontend API client. Pure TypeScript/JavaScript. No Python.
 * Calls the Node.js Express backend at NEXT_PUBLIC_API_URL.
 */

export interface AnalysisResult {
  detected_condition: string;
  risk_score: number;
  condition_level: 'Low' | 'Medium' | 'High';
  clinical_explanation: string;
  recommended_guidance: string;
  estimated_cost: string;
  extracted_metrics: Record<string, string>;
  detection_reasoning: string;
  report_type?: string;
  processing_time_ms?: number;
  ai_model_used?: string;
}

export interface UploadResult {
  fileId: string;
  originalFilename: string;
  fileType: string;
  fileSizeKb: number;
  uploadedAt: string;
}

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://mediscan-backend-ki6y.onrender.com').replace(/\/$/, '');

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. The server is taking too long to respond. Please try again.');
    }
      throw new Error(`Cannot connect to the Midiscanai server at ${BASE_URL}. If using the deployed version, the server may be starting up (cold start) — please wait 30 seconds and try again.`);
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function uploadReport(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  // DO NOT set Content-Type header — browser sets it automatically for FormData
  const response = await fetchWithTimeout(`${BASE_URL}/api/upload`, { method: 'POST', body: formData }, 20000);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || data.message || 'Upload failed');
  return data as UploadResult;
}

export async function analyzeReport(fileId: string): Promise<AnalysisResult> {
  const response = await fetchWithTimeout(
    `${BASE_URL}/api/analyze`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fileId }) },
    90000 // 90 seconds — Claude can be slow
  );
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 422) throw new Error(`INVALID_MEDICAL_CONTENT: ${data.message}`);
    if (response.status === 503) throw new Error(`AI_UNAVAILABLE: ${data.message}`);
    if (response.status === 415) throw new Error(data.message || 'Unsupported file type');
    throw new Error(data.message || 'Analysis failed');
  }
  return data as AnalysisResult;
}

export async function getResults(fileId: string): Promise<AnalysisResult> {
  const response = await fetchWithTimeout(`${BASE_URL}/api/results/${fileId}`, { method: 'GET' }, 10000);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to retrieve results');
  return data as AnalysisResult;
}

export async function deleteUploadedFile(fileId: string): Promise<void> {
  await fetchWithTimeout(`${BASE_URL}/api/upload/${fileId}`, { method: 'DELETE' }, 10000);
}
