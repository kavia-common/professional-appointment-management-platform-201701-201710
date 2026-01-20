import React, { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/apiClient";
import { EmptyState, InlineError, InlineLoader } from "../components/StateBlocks";

function formatDateTime(value) {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  } catch {
    return String(value);
  }
}

function guessStatus(start, end) {
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  if (!Number.isFinite(s) || !Number.isFinite(e)) return "desconocido";
  if (e < now) return "pasada";
  if (s > now) return "futura";
  return "en curso";
}

function statusBadgeClass(status) {
  if (status === "en curso") return "success";
  if (status === "futura") return "warning";
  return "muted";
}

// PUBLIC_INTERFACE
export default function AppointmentsPage() {
  /** Shows appointments synced from Google Calendar (read-only view). */
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => {
      const hay = `${it.summary || ""} ${it.description || ""} ${it.attendee || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      /**
       * NOTE: Backend endpoints are not provided in this task.
       * We attempt a conventional REST path; if it fails, we present a helpful empty state and keep the UI usable.
       */
      const data = await apiRequest("/appointments", { method: "GET" });
      const normalized = Array.isArray(data) ? data : data?.items || [];
      setItems(
        normalized.map((a) => ({
          id: a.id ?? `${a.start ?? ""}-${a.summary ?? ""}`,
          summary: a.summary || a.title || "Cita",
          start: a.start || a.startTime || a.start_date,
          end: a.end || a.endTime || a.end_date,
          attendee: a.attendee || a.client || a.user || "",
          location: a.location || "",
          description: a.description || "",
        }))
      );
    } catch (e) {
      // If API not available yet, show a graceful message.
      setItems([]);
      setError(e?.message || "No fue posible cargar las citas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Citas</h1>
          <p className="page-subtitle">
            Visualiza citas pasadas, presentes y futuras sincronizadas con Google Calendar.
          </p>
        </div>

        <div className="header-actions">
          <input
            className="input"
            style={{ width: 260 }}
            placeholder="Buscar…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar citas"
          />
          <button className="btn btn-primary" type="button" onClick={load}>
            Actualizar
          </button>
        </div>
      </div>

      {loading ? <InlineLoader label="Cargando citas…" /> : null}
      {error ? (
        <InlineError
          title="No se pudieron cargar las citas"
          message={`${error} (Se intentó GET /appointments)`}
          onRetry={load}
        />
      ) : null}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Listado</h2>
        </div>
        <div className="card-body">
          {filtered.length === 0 ? (
            <EmptyState
              title="No hay citas para mostrar"
              description="Cuando la API esté conectada, aquí aparecerán tus citas sincronizadas."
            />
          ) : (
            <div className="table-wrap" role="region" aria-label="Tabla de citas">
              <table className="table">
                <thead>
                  <tr>
                    <th>Estado</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Título</th>
                    <th>Cliente</th>
                    <th>Ubicación</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => {
                    const status = guessStatus(a.start, a.end);
                    return (
                      <tr key={a.id}>
                        <td>
                          <span className={`badge ${statusBadgeClass(status)}`}>{status}</span>
                        </td>
                        <td>{formatDateTime(a.start)}</td>
                        <td>{formatDateTime(a.end)}</td>
                        <td style={{ fontWeight: 700 }}>{a.summary}</td>
                        <td>{a.attendee || "—"}</td>
                        <td>{a.location || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
