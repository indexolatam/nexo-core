import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  defaultEditablePalette,
  defaultDarkEditablePalette,
  editablePaletteConfig,
  type EditablePalette,
  type PaletteColorKey,
} from "../types/adminPalette";
import { apiRequest } from "../services/apiClient";
import { CLIENT } from "../config/client";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  palette: EditablePalette;
  toggleTheme: () => void;
  updatePaletteColor: (key: PaletteColorKey, value: string) => void;
  resetPalette: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const PALETTE_CACHE_KEY = `${CLIENT.id}-palette`;
const THEME_CACHE_KEY = `${CLIENT.id}-theme`;

function normalizePalette(value: Partial<EditablePalette> | null | undefined): EditablePalette {
  return { ...defaultEditablePalette, ...(value ?? {}) };
}

function applyLegacyAliases(root: HTMLElement, palette: EditablePalette) {
  const aliases: Record<string, string> = {
    "--app-bg": palette.adminPageBg,
    "--section-bg": palette.landingSectionBg,
    "--card-bg": palette.adminCardBg,
    "--elevated-bg": palette.adminSectionBg,
    "--input-bg": palette.adminInputBg,
    "--warm-bg": palette.landingSectionBg,
    "--surface-strong": palette.adminCardBg,
    "--surface-soft": palette.adminSectionBg,
    "--surface-secondary": palette.adminTextSecondary,
    "--surface-contrast": palette.adminCardBg,
    "--surface-hover": palette.dropdownHoverBg,
    "--surface-active": palette.dropdownSelectedBg,
    "--surface-disabled": palette.adminTextMuted,
    "--border": palette.adminBorder,
    "--border-subtle": palette.adminBorderSubtle,
    "--border-strong": palette.adminBorderStrong,
    "--text-main": palette.adminTextMain,
    "--text-secondary": palette.adminTextSecondary,
    "--text-muted": palette.adminTextMuted,
    "--text-inverse": palette.adminPanelBg,
    "--text-on-card": palette.adminCardText,
    "--text-on-card-secondary": palette.adminCardTextSecondary,
    "--text-on-card-muted": palette.adminTextMuted,
    "--text-on-accent": palette.accentText,
    "--text-on-accent-secondary": palette.accentText,
    "--text-on-accent-muted": palette.adminTextMuted,
    "--title-warm": palette.landingTextMain,
    "--placeholder": palette.adminInputPlaceholder,
    "--accent-text": palette.accentText,
    "--link": palette.landingLink,
    "--link-hover": palette.landingLinkHover,
    "--footer-bg": palette.landingFooterBg,
    "--footer-text": palette.landingFooterText,
    "--footer-link": palette.landingFooterLink,
    "--footer-link-hover": palette.landingFooterLinkHover,
    "--footer-divider": palette.landingFooterDivider,
    "--hero-glow-1": palette.landingHeroGlow1,
    "--hero-glow-2": palette.landingHeroGlow2,
    "--grid-line": palette.landingGridLine,
    "--focus-ring": palette.accentBorder,
    "--table-header-bg": palette.tableHeaderBg,
    "--table-header-text": palette.tableHeaderText,
    "--table-row-bg": palette.tableRowBg,
    "--table-row-text": palette.tableRowText,
    "--table-row-muted-text": palette.tableRowMutedText,
    "--table-first-col-bg": palette.tableFirstColBg,
    "--table-first-col-text": palette.tableFirstColText,
    "--table-border": palette.tableBorder,
  };
  Object.entries(aliases).forEach(([cssVariable, value]) => root.style.setProperty(cssVariable, value));
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    try { const stored = localStorage.getItem(THEME_CACHE_KEY); return stored === "dark" || stored === "light" ? stored : "light"; }
    catch { return "light"; }
  });

  const [lightPalette, setLightPalette] = useState<EditablePalette>(() => {
    try {
      const stored = localStorage.getItem(PALETTE_CACHE_KEY);
      if (stored) { const parsed = JSON.parse(stored); if (parsed && parsed.light) return normalizePalette(parsed.light); return normalizePalette(parsed); }
      return defaultEditablePalette;
    } catch { return defaultEditablePalette; }
  });

  const [darkPalette, setDarkPalette] = useState<EditablePalette>(() => {
    try {
      const stored = localStorage.getItem(PALETTE_CACHE_KEY);
      if (stored) { const parsed = JSON.parse(stored); if (parsed && parsed.dark) return normalizePalette(parsed.dark); }
      return defaultDarkEditablePalette;
    } catch { return defaultDarkEditablePalette; }
  });

  const palette = theme === "dark" ? darkPalette : lightPalette;

  useEffect(() => { document.documentElement.classList.toggle("dark", theme === "dark"); }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem(`${CLIENT.id}-admin-token`);
    if (!token) return;

    apiRequest<{ light?: EditablePalette; dark?: EditablePalette } | null>("/settings/palette")
      .then((result) => {
        if (result?.light && result?.dark) {
          setLightPalette(normalizePalette(result.light));
          setDarkPalette(normalizePalette(result.dark));
          localStorage.setItem(PALETTE_CACHE_KEY, JSON.stringify({ light: result.light, dark: result.dark }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const activePalette = theme === "dark" ? darkPalette : lightPalette;
    editablePaletteConfig.forEach(({ key, cssVariable }) => { root.style.setProperty(cssVariable, activePalette[key] || defaultEditablePalette[key]); });
    applyLegacyAliases(root, activePalette);
  }, [theme, lightPalette, darkPalette]);

  const updatePaletteColor = useCallback((key: PaletteColorKey, value: string) => {
    if (theme === "dark") {
      setDarkPalette((prev) => { const next = { ...prev, [key]: value }; const payload = { light: lightPalette, dark: next }; localStorage.setItem(PALETTE_CACHE_KEY, JSON.stringify(payload)); apiRequest("/settings/palette", { method: "PUT", body: payload }).catch(() => {}); return next; });
    } else {
      setLightPalette((prev) => { const next = { ...prev, [key]: value }; const payload = { light: next, dark: darkPalette }; localStorage.setItem(PALETTE_CACHE_KEY, JSON.stringify(payload)); apiRequest("/settings/palette", { method: "PUT", body: payload }).catch(() => {}); return next; });
    }
  }, [theme, lightPalette, darkPalette]);

  const resetPalette = useCallback(() => {
    setLightPalette(defaultEditablePalette);
    setDarkPalette(defaultDarkEditablePalette);
    const payload = { light: defaultEditablePalette, dark: defaultDarkEditablePalette };
    localStorage.setItem(PALETTE_CACHE_KEY, JSON.stringify(payload));
    apiRequest("/settings/palette", { method: "PUT", body: payload }).catch(() => {});
  }, []);

  const toggleTheme = useCallback(() => { setTheme((prev) => { const next = prev === "light" ? "dark" : "light"; localStorage.setItem(THEME_CACHE_KEY, next); return next; }); }, []);

  return <ThemeContext.Provider value={{ theme, palette, toggleTheme, updatePaletteColor, resetPalette }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}
