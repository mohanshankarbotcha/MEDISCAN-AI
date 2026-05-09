// =============================================================================
// MediScan AI — API Client
// =============================================================================
// Frontend API utility for communicating with the FastAPI backend.
// =============================================================================

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://mediscan-backend-ki6y.onrender.com').replace(/\/$/, '');

/**
 * Upload a medical report file to the backend.
 * @param {File} file - The file to upload
 * @returns {Promise<{fileId: string, originalFilename: string, fileType: string, fileSizeKb: number}>}
 */
export async function uploadReport(file) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: formData,
      signal: controller.signal,
      // Do NOT set Content-Type — let browser set multipart boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Upload failed (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Upload timed out — please try again");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Trigger AI analysis for an uploaded report.
 * @param {string} fileId - The file ID returned from upload
 * @returns {Promise<Object>} - The analysis result
 */
export async function analyzeReport(fileId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout (AI takes time)

  try {
    const response = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Analysis failed (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Analysis timed out — the AI is taking too long, please retry");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch previously stored analysis results.
 * @param {string} fileId
 * @returns {Promise<Object>}
 */
export async function getResults(fileId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URL}/api/results/${fileId}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Failed to fetch results (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Delete a file and its associated records.
 * @param {string} fileId
 * @returns {Promise<Object>}
 */
export async function deleteFile(fileId) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${BASE_URL}/api/file/${fileId}`, {
      method: "DELETE",
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `Delete failed (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

