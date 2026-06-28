import { Button, Card, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { getContactHref, CLIENT } from "../../config/client";

type ServiceFromApi = {
  services_id: string;
  services_name: string;
  services_landing_paragraph?: string;
  services_description?: string;
  services_landing_cta?: string;
  services_landing_icon?: string;
};

export function ServicesPreview() {
  const [services, setServices] = useState<ServiceFromApi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((json) => setServices(Array.isArray(json?.data) ? json.data : []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="servicios" className="surface-app py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">{CLIENT.landing.servicesPreview.overline}</p>
          <h2 className="mt-3 text-3xl font-bold text-surface-main sm:text-4xl">{CLIENT.landing.servicesPreview.heading}</h2>
          <p className="mt-4 text-surface-secondary">{CLIENT.landing.servicesPreview.description}</p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="surface-card h-full border-[var(--border)]" bordered>
                  <Skeleton active />
                </Card>
              ))
            : services.map((service) => (
                <Card key={service.services_id} className="surface-card h-full border-[var(--border)]" bordered>
                  <h3 className="text-xl font-bold text-card-main">{service.services_name}</h3>
                  <p className="mt-3 text-card-secondary">{service.services_landing_paragraph || service.services_description}</p>
                  <Button
                    href={getContactHref(`Hola, quiero consultar sobre el servicio: ${service.services_name}.`)}
                    className="rounded-button brand-outline mt-5"
                  >
                    {service.services_landing_cta || "Consultar"}
                  </Button>
                </Card>
              ))}
          {!loading && services.length === 0 ? (
            <p className="col-span-full text-center text-surface-muted">No hay servicios disponibles por el momento.</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
