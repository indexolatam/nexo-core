const trustItems = [
  "Acompañamiento profesional",
  "Comunicación clara para agendar",
  "Orientación para personas, parejas y organizaciones",
  "Formulario sin datos clínicos sensibles",
];

export function TrustSection() {
  return (
    <section className="surface-section py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Confianza y cuidado</p>
          <h2 className="mt-3 text-3xl font-bold text-surface-main sm:text-4xl">
            Un espacio para iniciar tu proceso con información clara
          </h2>
          <p className="mt-4 text-surface-secondary">
            La landing debe presentar servicios y canales de contacto sin prometer resultados ni publicar información no validada.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item) => (
            <div key={item} className="surface-card rounded-2xl border border-[var(--border)] p-5 text-sm font-medium text-card-main">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
