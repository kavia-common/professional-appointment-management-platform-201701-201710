import React from "react";

// PUBLIC_INTERFACE
export function InlineLoader({ label = "Cargando…" }) {
  /** A small inline loading indicator. */
  return (
    <div className="alert alert-info" role="status" aria-live="polite">
      {label}
    </div>
  );
}

// PUBLIC_INTERFACE
export function InlineError({ title = "Ocurrió un error", message, onRetry }) {
  /** A small inline error block with optional retry action. */
  return (
    <div className="alert alert-error" role="alert">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>{title}</div>
          <div style={{ color: "inherit" }}>{message || "Intenta nuevamente en unos minutos."}</div>
        </div>
        {onRetry ? (
          <button className="btn btn-danger" type="button" onClick={onRetry}>
            Reintentar
          </button>
        ) : null}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export function EmptyState({ title = "Sin datos", description }) {
  /** Neutral empty-state block. */
  return (
    <div className="alert" role="status" aria-live="polite">
      <div style={{ fontWeight: 800, marginBottom: 4 }}>{title}</div>
      {description ? <div style={{ color: "var(--text-muted)" }}>{description}</div> : null}
    </div>
  );
}
