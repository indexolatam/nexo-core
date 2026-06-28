import type { ReactNode } from "react";

export function formatTypeLabel(type: string): string {
  return type === "Participante Taller" ? "Taller" : type;
}

export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("es-NI", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export function highlight(text: string, query: string): ReactNode {
  if (!query.trim()) return text;
  const escaped = query.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.split(new RegExp(`(${escaped})`, "ig")).map((part, i) =>
    part.toLowerCase() === query.trim().toLowerCase()
      ? <mark key={i} className="rounded bg-[var(--accent-soft)] px-0.5 text-[var(--accent-deep)]">{part}</mark>
      : <span key={i}>{part}</span>
  );
}
