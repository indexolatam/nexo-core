import { NavLink } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--card-bg)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-lg font-bold text-[var(--accent)]">NEXO</h3>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">
              Sistema base reutilizable para landing y gestión interna.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Enlaces</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><NavLink to="/servicios" className="text-[var(--text-secondary)] hover:text-[var(--accent)]">Servicios</NavLink></li>
              <li><NavLink to="/contacto" className="text-[var(--text-secondary)] hover:text-[var(--accent)]">Contacto</NavLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Contacto</h3>
            <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
              <li>info@nexo.local</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-[var(--border)] pt-8 text-center text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} NEXO. Desarrollado por INDEXO.
        </div>
      </div>
    </footer>
  );
}
