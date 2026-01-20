/**
 * Centralized env access for the frontend.
 * IMPORTANT: Values are read from the container's .env (injected at build time by CRA).
 */

// PUBLIC_INTERFACE
export function getRuntimeConfig() {
  /**
   * Returns runtime configuration derived from environment variables.
   * Prefers REACT_APP_API_BASE, falls back to REACT_APP_BACKEND_URL.
   */
  const apiBase =
    (process.env.REACT_APP_API_BASE || "").trim() ||
    (process.env.REACT_APP_BACKEND_URL || "").trim();

  const frontendUrl = (process.env.REACT_APP_FRONTEND_URL || "").trim();
  const wsUrl = (process.env.REACT_APP_WS_URL || "").trim();

  const nodeEnv = (process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV || "development").trim();
  const logLevel = (process.env.REACT_APP_LOG_LEVEL || "info").trim();

  return {
    apiBase,
    frontendUrl,
    wsUrl,
    nodeEnv,
    logLevel,
  };
}
