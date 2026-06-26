import { Button, Drawer } from "antd";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { MenuOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { CLIENT, getContactHref } from "../../config/client";
import { useTheme } from "../../context/ThemeContext";

const navItems = [
  { label: "Inicio", to: "/" },
  { label: "Servicios", to: "/servicios" },
  { label: "Blog", to: "/blog" },
  { label: "Contacto", to: "/contacto" },
];

export function PublicHeader() {
  const [open, setOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const themeButtonLabel = isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro";

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${
      isActive ? "text-[var(--accent-deep)]" : "text-[var(--text-secondary)] hover:text-[var(--accent)]"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card-bg)]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex min-w-0 items-center gap-3" aria-label={`${CLIENT.branding.name} - Inicio`}>
          <img
            src={CLIENT.assets.headerLogo}
            alt={CLIENT.branding.name}
            className="h-10 w-auto max-w-[180px] object-contain"
          />
          <span className="sr-only">{CLIENT.branding.name}</span>
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            aria-label={themeButtonLabel}
            className="rounded-button theme-toggle-button"
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            type="text"
            onClick={toggleTheme}
          >
            {isDarkMode ? "Modo claro" : "Modo oscuro"}
          </Button>
          <Button href={getContactHref()} type="primary" className="rounded-button brand-primary">
            {CLIENT.landing.primaryCta}
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Button
            aria-label={themeButtonLabel}
            className="theme-toggle-button"
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            type="text"
            onClick={toggleTheme}
          />
          <Button aria-label="Abrir menú" icon={<MenuOutlined />} type="text" onClick={() => setOpen(true)} />
        </div>
      </div>

      <Drawer
        title={
          <img
            src={CLIENT.assets.headerLogo}
            alt={CLIENT.branding.name}
            className="h-9 w-auto max-w-[170px] object-contain"
          />
        }
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className="flex flex-col gap-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkClass} onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          <Button
            aria-label={themeButtonLabel}
            className="rounded-button theme-toggle-button"
            icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
            type="text"
            onClick={toggleTheme}
          >
            {isDarkMode ? "Modo claro" : "Modo oscuro"}
          </Button>
          <Button href={getContactHref()} type="primary" className="rounded-button brand-primary">
            {CLIENT.landing.primaryCta}
          </Button>
        </div>
      </Drawer>
    </header>
  );
}
