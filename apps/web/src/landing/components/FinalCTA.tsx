import { Button } from "antd";
import { CLIENT, getContactHref } from "../../config/client";

export function FinalCTA() {
  return (
    <section className="surface-accent py-16 text-accent-main">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold sm:text-4xl">{CLIENT.landing.finalCta.heading}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-accent-secondary">
          {CLIENT.landing.finalCta.description}
        </p>
        <Button href={getContactHref()} size="large" className="rounded-button mt-8 bg-[var(--surface-contrast)] text-[var(--accent)]">
          {CLIENT.landing.primaryCta}
        </Button>
      </div>
    </section>
  );
}
