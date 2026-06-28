import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { Drawer, Button } from "antd";
import {
  DashboardOutlined, CalendarOutlined, TeamOutlined, DollarOutlined,
  UnorderedListOutlined, SettingOutlined, AuditOutlined, MenuOutlined,
  MoonOutlined, SunOutlined,
} from "@ant-design/icons";
import { useAuth } from "../modules/auth/AuthContext";
import { useTheme } from "../context/ThemeContext";

const ALL_NAV_ITEMS = [
  { key: "inicio", label: "Inicio", to: "/admin", icon: <DashboardOutlined /> },
  { key: "agenda", label: "Agenda", to: "/admin/agenda", icon: <CalendarOutlined /> },
  { key: "tareas", label: "Tareas", to: "/admin/tareas", icon: <UnorderedListOutlined /> },
  { key: "finanzas", label: "Finanzas", to: "/admin/finanzas", icon: <DollarOutlined /> },
  { key: "usuarios", label: "Usuarios", to: "/admin/usuarios", icon: <TeamOutlined /> },
  { key: "auditoria", label: "Auditoría", to: "/admin/logs", icon: <AuditOutlined /> },
  { key: "configuracion", label: "Configuración", to: "/admin/configuracion", icon: <SettingOutlined /> },
];

const ROLE_ALLOWED_KEYS: Record<string, readonly string[]> = {
  root: ["inicio", "agenda", "tareas", "finanzas", "usuarios", "auditoria", "configuracion"],
  admin: ["inicio", "agenda", "tareas", "finanzas", "usuarios", "configuracion"],
  colaborador: ["inicio", "agenda", "tareas"],
  asistente: ["inicio", "agenda", "tareas", "usuarios", "finanzas", "configuracion"],
};

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allowedKeys = ROLE_ALLOWED_KEYS[user?.role || "admin"] || ROLE_ALLOWED_KEYS.admin;
  const navItems = ALL_NAV_ITEMS.filter((item) => allowedKeys.includes(item.key));

  const currentPage = ALL_NAV_ITEMS.find((item) =>
    item.to === "/admin" ? location.pathname === "/admin" : location.pathname.startsWith(item.to)
  );

  return (
    <div className="flex min-h-screen bg-[var(--app-bg)]">
      <aside className="hidden w-72 flex-col border-r border-[var(--border)] bg-[var(--card-bg)] lg:flex">
        <div className="flex h-16 items-center border-b border-[var(--border)] px-6">
          <span className="text-lg font-bold text-[var(--accent)]">NEXO</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <NavLink key={item.key} to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`
              }>
              {item.icon}{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-[var(--border)] p-4">
          <div className="mb-2 text-xs text-[var(--text-muted)]">{user?.display_label}</div>
          <Button onClick={logout} size="small" block>Cerrar sesión</Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--card-bg)]/95 px-6 backdrop-blur">
          <div className="flex items-center gap-4">
            <Button className="lg:hidden" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} type="text" />
            <h1 className="text-lg font-semibold">{currentPage?.label || "Panel"}</h1>
          </div>
          <Button icon={theme === "dark" ? <SunOutlined /> : <MoonOutlined />} onClick={toggleTheme} type="text" />
        </header>
        <main className="flex-1 overflow-y-auto p-6"><Outlet /></main>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} placement="left">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <NavLink key={item.key} to={item.to} onClick={() => setDrawerOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium ${
                  isActive ? "bg-[var(--accent)]/10 text-[var(--accent)]" : "text-[var(--text-secondary)]"
                }`
              }>
              {item.icon}{item.label}
            </NavLink>
          ))}
        </nav>
      </Drawer>
    </div>
  );
}
