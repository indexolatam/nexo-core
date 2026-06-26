export type ClientService = {
  id: string;
  title: string;
  shortDescription: string;
  detail: string;
  ctaLabel: string;
  whatsappMessage: string;
};

export type ClientFaqItem = {
  question: string;
  answer: string;
};

export const CLIENT = {
  id: "nexo-core",

  branding: {
    name: "NEXO",
    tagline: "Sistema base reutilizable",
    description: "Plataforma de gestión operativa con landing personalizable.",
  },

  contact: {
    city: "TODO_CIUDAD",
    whatsapp: "TODO_WHATSAPP",
    email: "TODO_CORREO",
    address: "TODO_DIRECCION",
    schedule: "TODO_HORARIOS",
    phoneCode: "TODO_CODIGO",
    privacyNotice:
      "No envíes diagnósticos, historia clínica ni información sensible por este formulario.",
    socialLinks: {
      facebook: "TODO_FACEBOOK",
      instagram: "TODO_INSTAGRAM",
      linkedin: "TODO_LINKEDIN",
    },
  },

  locale: {
    currency: "USD",
    currencySymbol: "$",
    timezone: "America/Managua",
    dateLocale: "es-NI",
  },

  roles: {
    root: "Root",
    admin: "Admin",
    owner: "Propietario",
    assistant: "Asistente",
  },

  landing: {
    template: "default" as "default" | "minimal" | "premium",
    sections: {
      hero: true,
      services: true,
      about: true,
      faq: true,
      contact: true,
      finalCta: true,
    },
    primaryCta: "Agendar por WhatsApp",
    secondaryCta: "Ver servicios",
  },

  dashboard: {
    modules: {
      people: true,
      finance: true,
      agenda: true,
      tasks: true,
      blog: true,
      users: true,
      audit: true,
      settings: true,
    },
    labels: {
      people: "Personas",
      finance: "Finanzas",
      agenda: "Agenda",
      tasks: "Tareas",
      blog: "Blog",
      users: "Usuarios",
      audit: "Auditoría",
      settings: "Configuración",
    },
  },

  assets: {
    headerLogo: "/img/logo.png",
    footerLogo: "/img/logo.png",
    isotipo: "/img/logo.png",
    heroPhoto: "/img/hero.jpg",
    favicon: "/favicon.svg",
  },

  services: [
    {
      id: "servicio-1",
      title: "Servicio 1",
      shortDescription: "Lorem ipsum dolor sit amet.",
      detail: "Sed ut perspiciatis unde omnis.",
      ctaLabel: "Consultar este servicio",
      whatsappMessage: "Hola, quiero consultar sobre el servicio.",
    },
    {
      id: "servicio-2",
      title: "Servicio 2",
      shortDescription: "Consectetur adipiscing elit.",
      detail: "Nemo enim ipsam voluptatem quia voluptas.",
      ctaLabel: "Consultar este servicio",
      whatsappMessage: "Hola, quiero consultar sobre el servicio.",
    },
  ] as ClientService[],

  faq: [
    {
      question: "¿Cómo puedo agendar?",
      answer:
        "Puedes escribir por WhatsApp o completar el formulario de contacto.",
    },
    {
      question: "¿Qué información debo enviar?",
      answer:
        "Nombre, teléfono y un mensaje breve. No envíes información sensible.",
    },
  ] as ClientFaqItem[],
} as const;

export function getContactHref(message = "Hola, quiero solicitar información sobre una cita.") {
  if (CLIENT.contact.whatsapp.startsWith("TODO")) {
    return "#contacto";
  }

  const normalizedPhone = CLIENT.contact.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}
