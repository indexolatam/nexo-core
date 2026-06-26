import { Button, Card } from "antd";
import { CLIENT, getContactHref } from "../../config/client";

export function ServicesPreview() {
  return (
    <section id="servicios" className="surface-app py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Servicios</p>
          <h2 className="mt-3 text-3xl font-bold text-surface-main sm:text-4xl">Servicios principales</h2>
          <p className="mt-4 text-surface-secondary">Consulta los servicios disponibles y solicita información para agendar.</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {CLIENT.services.map((service) => (
            <Card key={service.id} className="surface-card h-full border-[var(--border)]" bordered>
              <h3 className="text-xl font-bold text-card-main">{service.title}</h3>
              <p className="mt-3 text-card-secondary">{service.shortDescription}</p>
              <p className="mt-3 text-sm text-card-soft">{service.detail}</p>
              <Button href={getContactHref(service.whatsappMessage)} className="rounded-button brand-outline mt-5">
                {service.ctaLabel}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
