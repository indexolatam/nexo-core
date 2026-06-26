import { Collapse } from "antd";
import { CLIENT } from "../../config/client";

export function FaqSection() {
  return (
    <section className="surface-app py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Preguntas frecuentes</p>
        <h2 className="mt-3 text-3xl font-bold text-surface-main sm:text-4xl">Antes de contactarnos</h2>
        <Collapse
          className="surface-card mt-8"
          items={CLIENT.faq.map((item, index) => ({ key: String(index), label: item.question, children: <p>{item.answer}</p> }))}
        />
      </div>
    </section>
  );
}
