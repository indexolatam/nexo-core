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
    asistente: "Asistente",
    colaborador: "Colaborador",
  },

  landing: {
    template: "default" as "default" | "minimal" | "premium",
    sections: {
      hero: true,
      trust: true,
      services: true,
      process: true,
      faq: true,
      contact: true,
      finalCta: true,
    },
    primaryCta: "Agendar por WhatsApp",
    secondaryCta: "Ver servicios",
    hero: {
      overline: "Primer contacto",
      title: "Agenda una orientación",
      description: "Cuéntanos de forma breve qué servicio necesitas y coordinamos la disponibilidad.",
    },
    trust: {
      overline: "Confianza y cuidado",
      heading: "Un espacio para iniciar tu proceso con información clara",
      description: "La landing debe presentar servicios y canales de contacto sin prometer resultados ni publicar información no validada.",
      items: [
        "Acompañamiento profesional",
        "Comunicación clara para agendar",
        "Orientación para personas, parejas y organizaciones",
        "Formulario sin datos clínicos sensibles",
      ],
    },
    process: {
      overline: "Cómo agendar",
      heading: "Proceso simple para solicitar una cita",
      steps: [
        "Escribe por WhatsApp o completa el formulario.",
        "Indica el servicio de interés y tu preferencia de modalidad.",
        "Coordinamos disponibilidad y datos administrativos.",
        "Recibes confirmación de la cita o siguiente paso.",
      ],
    },
    faq: {
      overline: "Preguntas frecuentes",
      heading: "Antes de contactarnos",
    },
    servicesPreview: {
      overline: "Servicios",
      heading: "Servicios principales",
      description: "Consulta los servicios disponibles y solicita información para agendar.",
    },
    finalCta: {
      heading: "Da el primer paso para agendar tu consulta",
      description: "Escríbenos y coordinamos la disponibilidad según el servicio que necesitas.",
    },
  },

  navigation: [
    { label: "Inicio", to: "/" },
    { label: "Servicios", to: "/servicios" },
    { label: "Blog", to: "/blog" },
    { label: "Contacto", to: "/contacto" },
  ],

  footer: {
    tagline: "Acompañamiento personalizado y orientación para agendar servicios.",
    credit: "Desarrollado por INDEXO.",
    showCredit: true,
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

  theme: {
    palette: {
      light: {
        accent: "#696F55",
        accentHover: "#585933",
        accentDeep: "#464A37",
        accentSoft: "#F2EEC9",
        accentBorder: "#ACB984",
        accentText: "#FCF0E1",
        landingPageBg: "#FFFBF7",
        landingSectionBg: "#F7FFDE",
        landingFooterBg: "#323313",
        landingFooterText: "#F5EBE2",
        landingFooterLink: "#ACB984",
      },
      dark: {
        accent: "#ACB984",
        accentHover: "#C0CC9A",
        accentDeep: "#8FA596",
        accentSoft: "#26322F",
        accentBorder: "#585933",
        accentText: "#1E2B26",
        landingPageBg: "#20211F",
        landingSectionBg: "#252610",
        landingFooterBg: "#14150F",
        landingFooterText: "#F5EBE2",
        landingFooterLink: "#ACB984",
      },
    },
    fonts: {
      title: "Inter",
      body: "Inter",
    },
  },

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
