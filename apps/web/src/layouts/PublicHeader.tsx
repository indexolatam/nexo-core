import { Button, Drawer } from "antd";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { MenuOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useTheme } from "../context/ThemeContext";

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const navItems = [
    { label: "Inicio", to: "/" },
    { label: "Servicios", to: "/servicios" },
    { label: "Contacto", to: "/contacto" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card-bg)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="text-lg font-bold text-[var(--accent)]">NEXO</NavLink>
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}
              className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? "text-[var(--accent-deep)]" : "text-[var(--text-secondary)] hover:text-[var(--accent)]"}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Button icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />} type="text" onClick={toggleTheme} />
          <Button type="primary" className="rounded-button brand-primary">Contactar</Button>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <Button icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />} type="text" onClick={toggleTheme} />
          <Button icon={<MenuOutlined />} type="text" onClick={() => setOpen(true)} />
        </div>
      </div>
      <Drawer title="NEXO" placement="right" open={open} onClose={() => setOpen(false)}>
        <div className="flex flex-col gap-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>{item.label}</NavLink>
          ))}
          <Button type="primary" className="rounded-button brand-primary">Contactar</Button>
        </div>
      </Drawer>
    </header>
  );
}
