import { Link } from "react-router-dom";
import { CLIENT } from "../../config/client";

export function PublicFooter() {
  return (
    <footer className="bg-[var(--footer-bg)] text-[var(--footer-text)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <img
            src={CLIENT.assets.footerLogo}
            alt={CLIENT.branding.name}
            className="h-12 w-auto max-w-[210px] object-contain"
          />
          <p className="mt-3 text-sm text-[var(--footer-link)]">
            {CLIENT.footer.tagline}
          </p>
        </div>
        <div>
          <p className="font-semibold text-[var(--footer-text)]">Enlaces</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-[var(--footer-link)]">
            <Link to="/servicios" className="text-[var(--footer-link)] hover:text-[var(--footer-link-hover)]">
              Servicios
            </Link>
            <Link to="/contacto" className="text-[var(--footer-link)] hover:text-[var(--footer-link-hover)]">
              Contacto
            </Link>
            <Link to="/blog" className="text-[var(--footer-link)] hover:text-[var(--footer-link-hover)]">
              Blog
            </Link>
            <Link to="/login" className="text-[var(--footer-link)] hover:text-[var(--footer-link-hover)]">
              Acceso administrativo
            </Link>
          </div>
        </div>
        <div className="relative">
          <img
            src={CLIENT.assets.isotipo}
            alt=""
            aria-hidden="true"
            className="absolute right-0 top-0 hidden h-20 w-20 object-contain opacity-10 md:block"
          />
          <p className="font-semibold text-[var(--footer-text)]">Contacto</p>
          <div className="mt-3 space-y-2 text-sm text-[var(--footer-link)]">
            <p>WhatsApp: {CLIENT.contact.whatsapp}</p>
            <p>Correo: {CLIENT.contact.email}</p>
            <p>Ciudad: {CLIENT.contact.city}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--footer-divider)] px-4 py-5 text-center text-xs text-[var(--footer-link)]">
        <p>&copy; {new Date().getFullYear()} {CLIENT.branding.name}. Todos los derechos reservados.</p>
        {CLIENT.footer.showCredit && <p className="mt-1">{CLIENT.footer.credit}</p>}
      </div>
    </footer>
  );
}
