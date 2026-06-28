import { Button, Form, Input, Select, message } from "antd";
import { CLIENT, getContactHref } from "../../config/client";
import { contactService } from "../../services";

const { TextArea } = Input;

type ContactFormValues = {
  name: string;
  phone: string;
  email?: string;
  service?: string;
  message?: string;
};

export function ContactSection() {
  const [form] = Form.useForm<ContactFormValues>();

  const handleSubmit = async (values: ContactFormValues) => {
    try {
      await contactService.submit(values);
      message.success("Solicitud enviada. Te contactaremos pronto.");
      form.resetFields();
    } catch {
      message.error("No se pudo enviar la solicitud. Intenta nuevamente.");
    }
  };

  return (
    <section id="contacto" className="surface-section py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">Contacto</p>
          <h2 className="mt-3 text-3xl font-bold text-surface-main sm:text-4xl">Solicita información para agendar</h2>
          <p className="mt-4 text-surface-secondary">{CLIENT.contact.privacyNotice}</p>
          <div className="mt-6 space-y-2 text-sm text-surface-secondary">
            <p>WhatsApp: {CLIENT.contact.whatsapp}</p>
            <p>Correo: {CLIENT.contact.email}</p>
            <p>Ciudad: {CLIENT.contact.city}</p>
          </div>
          <Button href={getContactHref()} size="large" type="primary" className="rounded-button brand-primary mt-6">
            {CLIENT.landing.primaryCta}
          </Button>
        </div>

        <Form form={form} layout="vertical" className="surface-card rounded-3xl border border-[var(--border)] p-6" onFinish={handleSubmit}>
          <Form.Item label="Nombre" name="name" rules={[{ required: true, message: "Ingresa tu nombre" }]}>
            <Input placeholder="Tu nombre" />
          </Form.Item>
          <Form.Item label="Teléfono / WhatsApp" name="phone" rules={[{ required: true, message: "Ingresa tu teléfono" }]}>
            <Input placeholder="Tu número de contacto" />
          </Form.Item>
          <Form.Item label="Correo" name="email" rules={[{ type: "email", message: "Ingresa un correo válido" }]}>
            <Input placeholder="tu@email.com" />
          </Form.Item>
          <Form.Item label="Servicio de interés" name="service">
            <Select
              placeholder="Selecciona un servicio"
              options={[
                "Consulta individual",
                "Terapia de pareja",
                "Terapia familiar",
                "Taller grupal",
                "Otro"
              ].map((s) => ({ value: s, label: s }))}
            />
          </Form.Item>
          <Form.Item label="Mensaje breve" name="message">
            <TextArea rows={4} placeholder="Cuéntanos de forma breve qué servicio necesitas. No envíes información clínica sensible." />
          </Form.Item>
          <Button type="primary" htmlType="submit" className="rounded-button brand-primary" block>
            Enviar solicitud
          </Button>
        </Form>
      </div>
    </section>
  );
}
