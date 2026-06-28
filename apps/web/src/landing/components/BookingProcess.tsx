import { CLIENT } from "../../config/client";

export function BookingProcess() {
  return (
    <section className="surface-section py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">{CLIENT.landing.process.overline}</p>
          <h2 className="mt-3 text-3xl font-bold text-surface-main sm:text-4xl">{CLIENT.landing.process.heading}</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {CLIENT.landing.process.steps.map((step, index) => (
            <div key={step} className="surface-card rounded-2xl border border-[var(--border)] p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] font-bold text-[var(--accent-text)]">{index + 1}</span>
              <p className="mt-4 text-sm text-card-secondary">{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
