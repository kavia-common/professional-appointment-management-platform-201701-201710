import React, { useEffect, useState } from "react";
import { getRuntimeConfig } from "../config/env";
import { apiRequest } from "../services/apiClient";
import { InlineError, InlineLoader } from "../components/StateBlocks";

function parseJsonEnv(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

// PUBLIC_INTERFACE
export default function SettingsPage() {
  /** Shows runtime configuration and basic connectivity checks to the backend. */
  const cfg = getRuntimeConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [health, setHealth] = useState(null);

  const featureFlags = parseJsonEnv(process.env.REACT_APP_FEATURE_FLAGS, {});
  const experimentsEnabled = (process.env.REACT_APP_EXPERIMENTS_ENABLED || "").trim();
  const healthPath = (process.env.REACT_APP_HEALTHCHECK_PATH || "/health").trim();

  async function checkHealth() {
    setLoading(true);
    setError("");
    setHealth(null);
    try {
      const data = await apiRequest(healthPath, { method: "GET" });
      setHealth(data);
    } catch (e) {
      setError(`${e?.message || "No se pudo consultar healthcheck."} (Se intentó GET ${healthPath})`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Configuración</h1>
          <p className="page-subtitle">Verifica conectividad y revisa flags/entorno de ejecución.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" type="button" onClick={checkHealth} disabled={loading}>
            Revalidar conexión
          </button>
        </div>
      </div>

      {loading ? <InlineLoader label="Consultando backend…" /> : null}
      {error ? <InlineError title="No se pudo validar" message={error} onRetry={checkHealth} /> : null}

      <div className="grid cols-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Entorno</h2>
          </div>
          <div className="card-body">
            <div style={{ display: "grid", gap: 10 }}>
              <div>
                <div className="label">API Base</div>
                <div className="badge">{cfg.apiBase || "no configurado"}</div>
              </div>
              <div>
                <div className="label">Frontend URL</div>
                <div className="badge">{cfg.frontendUrl || "no configurado"}</div>
              </div>
              <div>
                <div className="label">WebSocket URL</div>
                <div className="badge">{cfg.wsUrl || "no configurado"}</div>
              </div>
              <div>
                <div className="label">Node env</div>
                <div className="badge">{cfg.nodeEnv}</div>
              </div>
              <div>
                <div className="label">Log level</div>
                <div className="badge">{cfg.logLevel}</div>
              </div>
              <div>
                <div className="label">Health path</div>
                <div className="badge">{healthPath}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Healthcheck</h2>
          </div>
          <div className="card-body">
            {health ? (
              <pre
                className="card"
                style={{
                  margin: 0,
                  padding: 12,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  overflow: "auto",
                }}
              >
                {JSON.stringify(health, null, 2)}
              </pre>
            ) : (
              <div className="alert" style={{ color: "var(--text-muted)" }}>
                Aún no hay respuesta. Usa <strong>Revalidar conexión</strong>.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Feature Flags</h2>
          </div>
          <div className="card-body">
            <pre
              className="card"
              style={{
                margin: 0,
                padding: 12,
                borderRadius: 10,
                border: "1px solid var(--border)",
                background: "var(--surface-2)",
                overflow: "auto",
              }}
            >
              {JSON.stringify(featureFlags, null, 2)}
            </pre>

            <div style={{ marginTop: 12 }}>
              <div className="label">Experiments enabled</div>
              <div className="badge">{experimentsEnabled || "false"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
