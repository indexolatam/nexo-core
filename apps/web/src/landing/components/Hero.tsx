import { Button } from "antd";
import { Link } from "react-router-dom";
import { CLIENT, getContactHref } from "../../config/client";

export function Hero() {
  return (
    <section className="hero-gradient soft-grid surface-app">
      <div className="mx-auto grid min-h-[78vh] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-[var(--accent-border)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--accent-deep)]">
            {CLIENT.branding.tagline}
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-surface-main sm:text-5xl lg:text-6xl">
            {CLIENT.branding.name}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-surface-secondary">
            {CLIENT.branding.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href={getContactHref()} size="large" type="primary" className="rounded-button brand-primary">
              {CLIENT.landing.primaryCta}
            </Button>
            <Link to="/servicios">
              <Button size="large" className="rounded-button brand-outline w-full sm:w-auto">
                {CLIENT.landing.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] shadow-sm">
          <div className="relative min-h-[320px] sm:min-h-[420px]">
            <img
              src={CLIENT.assets.heroPhoto}
              alt={CLIENT.branding.name}
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--hero-overlay-strong)] via-[var(--hero-overlay-soft)] to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-[var(--text-inverse)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--text-inverse)]">{CLIENT.landing.hero.overline}</p>
              <h2 className="mt-3 text-2xl font-bold text-[var(--text-inverse)]">{CLIENT.landing.hero.title}</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-[var(--text-inverse)] sm:text-base">
                {CLIENT.landing.hero.description}
              </p>
            </div>
          </div>
          <div className="grid gap-3 p-6 text-sm text-card-secondary sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--elevated-bg)] p-4">Modalidad: {CLIENT.contact.phoneCode || "TODO_CONFIRMAR"}</div>
            <div className="rounded-2xl bg-[var(--elevated-bg)] p-4">Ciudad: {CLIENT.contact.city}</div>
            <div className="rounded-2xl bg-[var(--elevated-bg)] p-4">Horario: {CLIENT.contact.schedule}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
