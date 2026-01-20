import React, { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../services/apiClient";
import { EmptyState, InlineError, InlineLoader } from "../components/StateBlocks";

function normalizePhone(v) {
  return String(v || "")
    .trim()
    .replace(/[^\d+]/g, "");
}

function isValidPhone(v) {
  const x = normalizePhone(v);
  // Simple validation: requires at least 8 digits (plus optional + prefix).
  const digits = x.replace(/\D/g, "");
  return digits.length >= 8;
}

// PUBLIC_INTERFACE
export default function UsersPage() {
  /** Manage users/contacts that the bot is allowed to contact. */
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((u) => `${u.name} ${u.phone}`.toLowerCase().includes(q));
  }, [items, filter]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest("/users", { method: "GET" });
      const normalized = Array.isArray(data) ? data : data?.items || [];
      setItems(
        normalized.map((u) => ({
          id: u.id ?? u.phone ?? `${u.name ?? ""}-${Math.random()}`,
          name: u.name || u.full_name || "Sin nombre",
          phone: u.phone || u.msisdn || "",
        }))
      );
    } catch (e) {
      setItems([]);
      setError(e?.message || "No fue posible cargar los usuarios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onAdd(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Ingresa un nombre para el usuario.");
      return;
    }
    if (!isValidPhone(phone)) {
      setError("Ingresa un teléfono válido (mínimo 8 dígitos).");
      return;
    }

    setMutating(true);
    try {
      await apiRequest("/users", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), phone: normalizePhone(phone) }),
      });
      setName("");
      setPhone("");
      await load();
    } catch (e2) {
      setError(`${e2?.message || "No se pudo agregar el usuario."} (Se intentó POST /users)`);
    } finally {
      setMutating(false);
    }
  }

  async function onRemove(user) {
    setError("");
    const ok = window.confirm(`¿Eliminar a ${user.name} (${user.phone})?`);
    if (!ok) return;

    setMutating(true);
    try {
      // Common REST conventions: DELETE /users/{id}
      const id = encodeURIComponent(user.id);
      await apiRequest(`/users/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      setError(`${e?.message || "No se pudo eliminar el usuario."} (Se intentó DELETE /users/{id})`);
    } finally {
      setMutating(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-subtitle">
            Agrega o elimina usuarios que el bot puede contactar por WhatsApp.
          </p>
        </div>
      </div>

      {loading ? <InlineLoader label="Cargando usuarios…" /> : null}
      {error ? <InlineError title="Acción no completada" message={error} onRetry={load} /> : null}

      <div className="grid cols-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Listado</h2>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <input
                className="input"
                placeholder="Buscar por nombre o teléfono…"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                aria-label="Buscar usuarios"
              />
              <button className="btn" type="button" onClick={load} disabled={loading || mutating}>
                Actualizar
              </button>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="No hay usuarios"
                description="Cuando la API esté conectada, aquí aparecerán los usuarios permitidos."
              />
            ) : (
              <div className="table-wrap" role="region" aria-label="Tabla de usuarios">
                <table className="table" style={{ minWidth: 520 }}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Teléfono</th>
                      <th style={{ width: 120 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 700 }}>{u.name}</td>
                        <td>{u.phone || "—"}</td>
                        <td>
                          <button
                            className="btn btn-danger"
                            type="button"
                            onClick={() => onRemove(u)}
                            disabled={mutating}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Agregar usuario</h2>
          </div>
          <div className="card-body">
            <form onSubmit={onAdd}>
              <div className="field">
                <label className="label" htmlFor="userName">
                  Nombre
                </label>
                <input
                  id="userName"
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Dra. Pérez"
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="userPhone">
                  Teléfono (WhatsApp)
                </label>
                <input
                  id="userPhone"
                  className="input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: +5491122334455"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>

              <button className="btn btn-primary" type="submit" disabled={mutating}>
                {mutating ? "Guardando…" : "Agregar"}
              </button>

              <div style={{ marginTop: 10, color: "var(--text-muted)", fontSize: 12, lineHeight: 1.4 }}>
                Nota: este panel asume endpoints REST convencionales (<code>/users</code>). Si el backend usa
                rutas diferentes, se deben ajustar en esta página.
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
