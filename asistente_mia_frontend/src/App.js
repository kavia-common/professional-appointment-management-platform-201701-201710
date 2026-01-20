import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import SidebarLayout from "./components/SidebarLayout";
import AppointmentsPage from "./pages/AppointmentsPage";
import UsersPage from "./pages/UsersPage";
import MessagesPage from "./pages/MessagesPage";
import SettingsPage from "./pages/SettingsPage";

// PUBLIC_INTERFACE
function App() {
  /** Root React component: provides app routes and shared layout. */
  return (
    <SidebarLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/citas" replace />} />
        <Route path="/citas" element={<AppointmentsPage />} />
        <Route path="/usuarios" element={<UsersPage />} />
        <Route path="/mensajes" element={<MessagesPage />} />
        <Route path="/configuracion" element={<SettingsPage />} />
        <Route
          path="*"
          element={
            <div className="page">
              <div className="alert alert-error" role="alert">
                Ruta no encontrada. Usa la navegación lateral para continuar.
              </div>
            </div>
          }
        />
      </Routes>
    </SidebarLayout>
  );
}

export default App;
