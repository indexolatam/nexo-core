import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "antd/dist/reset.css";
import "./index.css";
import App from "./App";
import { RequireAuth } from "./shared/components/RequireAuth";
import { RequireRole } from "./shared/components/RequireRole";
import { AuthProvider } from "./modules/auth/AuthContext";
import { BankConfigProvider } from "./context/BankConfigContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AdminLayout } from "./layouts/AdminLayout";
import { PublicLayout } from "./layouts/PublicLayout";
import { NotFoundPage } from "./pages/NotFoundPage";
import { AgendaPage } from "./pages/admin/AgendaPage";
import { AuditLogsPage } from "./pages/admin/AuditLogsPage";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { FinancePage } from "./pages/admin/FinancePage";
import { PeoplePage } from "./pages/admin/PeoplePage";
import { TasksPage } from "./pages/admin/TasksPage";
import { LoginPage } from "./pages/admin/LoginPage";
import { SettingsPage } from "./pages/admin/SettingsPage";
import { BlogPage } from "./pages/public/BlogPage";
import { ContactPage } from "./pages/public/ContactPage";
import { HomePage } from "./pages/public/HomePage";
import { ServicesPage } from "./pages/public/ServicesPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "admin",
        element: (
          <RequireAuth>
            <BankConfigProvider>
              <AdminLayout />
            </BankConfigProvider>
          </RequireAuth>
        ),
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "agenda", element: <RequireRole module="agenda" action="read"><AgendaPage /></RequireRole> },
          { path: "personas", element: <RequireRole module="usuarios" action="read"><PeoplePage /></RequireRole> },
          { path: "usuarios", element: <RequireRole module="usuarios" action="read"><PeoplePage /></RequireRole> },
          { path: "finanzas", element: <RequireRole module="finanzas" action="read"><FinancePage /></RequireRole> },
          { path: "tareas", element: <RequireRole module="tareas" action="read"><TasksPage /></RequireRole> },
          { path: "configuracion", element: <RequireRole module="configuracion" action="read"><SettingsPage /></RequireRole> },
          { path: "logs", element: <RequireRole module="auditoria" action="read"><AuditLogsPage /></RequireRole> },
          { path: "blog", element: <RequireRole module="blog" action="read"><BlogPage /></RequireRole> },
        ],
      },
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "servicios", element: <ServicesPage /> },
          { path: "blog", element: <BlogPage /> },
          { path: "contacto", element: <ContactPage /> },
          { path: "*", element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
