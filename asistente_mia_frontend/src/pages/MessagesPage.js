import React, { useEffect, useState } from "react";
import { apiRequest } from "../services/apiClient";
import { InlineError, InlineLoader } from "../components/StateBlocks";

function safeJson(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

// PUBLIC_INTERFACE
export default function MessagesPage() {
  /** Allows professionals to customize automated messages and sending windows. */
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [templateConfirm, setTemplateConfirm] = useState(
    "Hola {nombre}, tu cita es el {fecha} a las {hora}. Responde OK para confirmar."
  );
  const [templateReminder, setTemplateReminder] = useState(
    "Recordatorio: tu cita es mañana {fecha} a las {hora}. ¿Necesitas reprogramar?"
  );
  const [sendingWindows, setSendingWindows] = useState(
    JSON.stringify(
      [
        { day: "Lunes", from: "09:00", to: "18:00" },
        { day: "Martes", from: "09:00", to: "18:00" },
      ],
      null,
      2
    )
  );

  async function load() {
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const data = await apiRequest("/settings/messages", { method: "GET" });
      const tConfirm = data?.confirmationTemplate ?? data?.confirm_template;
      const tReminder = data?.reminderTemplate ?? data?.reminder_template;
      const windows = data?.sendingWindows ?? data?.windows;

      if (typeof tConfirm === "string") setTemplateConfirm(tConfirm);
      if (typeof tReminder === "string") setTemplateReminder(tReminder);
      if (windows) setSendingWindows(JSON.stringify(windows, null, 2));
    } catch (e) {
      setError(`${e?.message || "No se pudo cargar configuración."} (Se intentó GET /settings/messages)`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSave() {
    setSaving(true);
    setError("");
    setSuccessMsg("");

    const windows = safeJson(sendingWindows, null);
    if (!windows || !Array.isArray(windows)) {
      setError("El JSON de horarios debe ser un array. Ejemplo: [{ day, from, to }].");
      setSaving(false);
      return;
    }

    try {
      await apiRequest("/settings/messages", {
        method: "PUT",
        body: JSON.stringify({
          confirmationTemplate: templateConfirm,
          reminderTemplate: templateReminder,
          sendingWindows: windows,
        }),
      });
      setSuccessMsg("Guardado correctamente.");
    } catch (e) {
      setError(`${e?.message || "No se pudo guardar."} (Se intentó PUT /settings/messages)`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mensajes</h1>
          <p className="page-subtitle">Personaliza mensajes automáticos y periodos/horarios de envío.</p>
        </div>
        <div className="header-actions">
          <button className="btn" type="button" onClick={load} disabled={loading || saving}>
            Recargar
          </button>
          <button className="btn btn-primary" type="button" onClick={onSave} disabled={loading || saving}>
            {saving ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>

      {loading ? <InlineLoader label="Cargando configuración…" /> : null}
      {error ? <InlineError title="No se pudo completar" message={error} /> : null}
      {successMsg ? <div className="alert alert-info">{successMsg}</div> : null}

      <div className="grid cols-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Plantillas</h2>
          </div>
          <div className="card-body">
            <div className="field">
              <label className="label" htmlFor="tmplConfirm">
                Confirmación de cita
              </label>
              <textarea
                id="tmplConfirm"
                className="textarea"
                value={templateConfirm}
                onChange={(e) => setTemplateConfirm(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor="tmplReminder">
                Recordatorio
              </label>
              <textarea
                id="tmplReminder"
                className="textarea"
                value={templateReminder}
                onChange={(e) => setTemplateReminder(e.target.value)}
              />
            </div>

            <div style={{ color: "var(--text-muted)", fontSize: 12, lineHeight: 1.4 }}>
              Variables sugeridas: <code>{"{nombre}"}</code>, <code>{"{fecha}"}</code>,{" "}
              <code>{"{hora}"}</code>.
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Horarios de envío (JSON)</h2>
          </div>
          <div className="card-body">
            <div className="field">
              <label className="label" htmlFor="windowsJson">
                Ventanas (array)
              </label>
              <textarea
                id="windowsJson"
                className="textarea"
                value={sendingWindows}
                onChange={(e) => setSendingWindows(e.target.value)}
                spellCheck="false"
              />
            </div>

            <div className="alert" style={{ color: "var(--text-muted)" }}>
              Ejemplo: <code>[{"{ \"day\": \"Lunes\", \"from\": \"09:00\", \"to\": \"18:00\" }"}]</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
