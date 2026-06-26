import { editablePaletteConfig } from "../../../types/adminPalette";
import { useTheme } from "../../../context/ThemeContext";

export function ColorGrid({ items }: { items: typeof editablePaletteConfig }) {
  const { palette, updatePaletteColor } = useTheme();

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <label key={item.key} className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] p-4">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-surface-main">{item.label}</p>
            <p className="mt-1 text-xs text-surface-muted">{item.cssVariable}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="h-8 w-8 rounded-xl border border-[var(--border-subtle)]" style={{ backgroundColor: palette[item.key] }} />
            <input
              aria-label={item.label}
              type="color"
              value={palette[item.key]}
              onChange={(event) => updatePaletteColor(item.key, event.target.value)}
              className="h-8 w-10 cursor-pointer rounded border border-[var(--border-subtle)] bg-transparent p-0"
            />
          </div>
        </label>
      ))}
    </div>
  );
}