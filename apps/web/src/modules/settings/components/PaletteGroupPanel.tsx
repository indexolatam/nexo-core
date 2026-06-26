import { paletteGroups, type PaletteColorKey, editablePaletteConfig } from "../../../types/adminPalette";
import { ColorGrid } from "./ColorGrid";

const itemsByKey = new Map(editablePaletteConfig.map((item) => [item.key, item]));

function itemsForGroup(keys: PaletteColorKey[]) {
  return keys.map((key) => itemsByKey.get(key)).filter((item): item is typeof editablePaletteConfig[number] => Boolean(item));
}

export function PaletteGroupPanel({ title, groups, theme }: { title: string; groups: typeof paletteGroups; theme: "light" | "dark" }) {
  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] p-4 sm:p-5">
      <h2 className="text-xl font-bold text-surface-main">{title}{theme === "dark" ? " (modo oscuro)" : ""}</h2>
      <div className="mt-5 space-y-6">
        {groups.map((group) => (
          <div key={group.id} className="rounded-2xl border border-[var(--border-subtle)] p-4">
            <h3 className="text-base font-bold text-surface-main">{group.title.replace(/^Landing · /, "").replace(/^Admin · /, "")}</h3>
            <p className="mt-1 text-sm text-surface-secondary">{group.description}</p>
            <ColorGrid items={itemsForGroup(group.keys)} />
          </div>
        ))}
      </div>
    </div>
  );
}