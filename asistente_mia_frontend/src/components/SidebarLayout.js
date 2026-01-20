import React from "react";
import { NavLink } from "react-router-dom";
import { getRuntimeConfig } from "../config/env";

const navItems = [
  { to: "/citas", label: "Citas", icon: "📅" },
  { to: "/usuarios", label: "Usuarios", icon: "👥" },
  { to: "/mensajes", label: "Mensajes", icon: "💬" },
  { to: "/configuracion", label: "Configuración", icon: "⚙️" },
];

// PUBLIC_INTERFACE
export default function SidebarLayout({ children }) {
  /** Application shell with sidebar navigation and a main content area. */
  const cfg = getRuntimeConfig();

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true" />
          <div className="brand-title">
            <strong>Asistente Mia</strong>
            <span>Panel de administración</span>
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Conexión</div>
          <div style={{ lineHeight: 1.4 }}>
            API:{" "}
            <span className="badge muted" title="REACT_APP_API_BASE / REACT_APP_BACKEND_URL">
              {cfg.apiBase || "no configurado"}
            </span>
          </div>
          {cfg.wsUrl ? (
            <div style={{ marginTop: 6, lineHeight: 1.4 }}>
              WS: <span className="badge muted">{cfg.wsUrl}</span>
            </div>
          ) : null}
        </div>
      </aside>

      <main className="main">{children}</main>
    </div>
  );
}
