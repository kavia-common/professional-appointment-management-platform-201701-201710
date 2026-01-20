import { getRuntimeConfig } from "../config/env";

/**
 * Attempts to parse JSON, falling back to text.
 */
async function safeParseBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) return response.json();
  return response.text();
}

/**
 * Creates an Error with extra HTTP context.
 */
function httpError(message, extra) {
  const err = new Error(message);
  err.name = "HttpError";
  Object.assign(err, extra);
  return err;
}

/**
 * Fetch wrapper with timeout.
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

// PUBLIC_INTERFACE
export async function apiRequest(path, options = {}) {
  /**
   * Make a request to the backend API.
   *
   * The backend base URL is configured through:
   * - REACT_APP_API_BASE (preferred), or
   * - REACT_APP_BACKEND_URL (fallback)
   *
   * If not configured, this function throws an error with actionable guidance.
   */
  const { apiBase } = getRuntimeConfig();
  if (!apiBase) {
    throw new Error(
      "Missing API base URL. Please set REACT_APP_API_BASE (or REACT_APP_BACKEND_URL) in the environment."
    );
  }

  const url = new URL(path, apiBase).toString();

  const headers = {
    "content-type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetchWithTimeout(url, { ...options, headers });

  const body = await safeParseBody(response);

  if (!response.ok) {
    const msg =
      (body && typeof body === "object" && (body.message || body.detail)) ||
      (typeof body === "string" && body) ||
      `Request failed with status ${response.status}`;

    throw httpError(msg, { status: response.status, body, url });
  }

  return body;
}
