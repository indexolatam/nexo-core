export type PaletteColorKey =
  | "landingPageBg"
  | "landingSectionBg"
  | "landingCardBg"
  | "landingCardText"
  | "landingCardTextSecondary"
  | "landingTextMain"
  | "landingTextSecondary"
  | "landingTextMuted"
  | "landingHeroGlow1"
  | "landingHeroGlow2"
  | "landingGridLine"
  | "landingLink"
  | "landingLinkHover"
  | "landingFooterBg"
  | "landingFooterText"
  | "landingFooterLink"
  | "landingFooterLinkHover"
  | "landingFooterDivider"
  | "adminPageBg"
  | "adminSectionBg"
  | "adminCardBg"
  | "adminCardText"
  | "adminCardTextSecondary"
  | "adminPanelBg"
  | "adminPanelText"
  | "adminPanelTextMuted"
  | "adminInputBg"
  | "adminInputText"
  | "adminInputPlaceholder"
  | "adminTextMain"
  | "adminTextSecondary"
  | "adminTextMuted"
  | "adminBorder"
  | "adminBorderSubtle"
  | "adminBorderStrong"
  | "accent"
  | "accentHover"
  | "accentDeep"
  | "accentSoft"
  | "accentBorder"
  | "accentText"
  | "dropdownBg"
  | "dropdownText"
  | "dropdownTextMuted"
  | "dropdownHoverBg"
  | "dropdownSelectedBg"
  | "dropdownSelectedText"
  | "dropdownBorder"
  | "dropdownShadow"
  | "modalBg"
  | "modalText"
  | "popoverBg"
  | "popoverText"
  | "tableHeaderBg"
  | "tableHeaderText"
  | "tableRowBg"
  | "tableRowText"
  | "tableRowMutedText"
  | "tableFirstColBg"
  | "tableFirstColText"
  | "tableBorder"
  | "tableHoverBg"
  | "tableStickyShadow"
  | "statusCorrect"
  | "statusCorrectBorder"
  | "statusAttention"
  | "statusAttentionBorder"
  | "statusNeutral"
  | "statusReprogrammedBorder"
  | "statusCancelledBorder"
  | "agendaSelectedShadow"
  | "agendaEventBorder"
  | "agendaActionBorder"
  | "agendaPanelBg"
  | "agendaControlBg"
  | "agendaControlActiveBg"
  | "agendaFilterBorder"
  | "agendaSearchBg";

export type EditablePalette = Record<PaletteColorKey, string>;

export type PaletteGroup = {
  id: string;
  title: string;
  description: string;
  keys: PaletteColorKey[];
};

export const editablePaletteConfig: { key: PaletteColorKey; label: string; cssVariable: string }[] = [
  { key: "landingPageBg", label: "Landing · Fondo general", cssVariable: "--landing-page-bg" },
  { key: "landingSectionBg", label: "Landing · Fondo sección", cssVariable: "--landing-section-bg" },
  { key: "landingCardBg", label: "Landing · Fondo tarjeta", cssVariable: "--landing-card-bg" },
  { key: "landingCardText", label: "Landing · Texto tarjeta", cssVariable: "--landing-card-text" },
  { key: "landingCardTextSecondary", label: "Landing · Texto secundario tarjeta", cssVariable: "--landing-card-text-secondary" },
  { key: "landingTextMain", label: "Landing · Texto principal", cssVariable: "--landing-text-main" },
  { key: "landingTextSecondary", label: "Landing · Texto secundario", cssVariable: "--landing-text-secondary" },
  { key: "landingTextMuted", label: "Landing · Texto tenue", cssVariable: "--landing-text-muted" },
  { key: "landingHeroGlow1", label: "Landing · Hero brillo 1", cssVariable: "--landing-hero-glow-1" },
  { key: "landingHeroGlow2", label: "Landing · Hero brillo 2", cssVariable: "--landing-hero-glow-2" },
  { key: "landingGridLine", label: "Landing · Línea grilla", cssVariable: "--landing-grid-line" },
  { key: "landingLink", label: "Landing · Link", cssVariable: "--landing-link" },
  { key: "landingLinkHover", label: "Landing · Link hover", cssVariable: "--landing-link-hover" },
  { key: "landingFooterBg", label: "Landing · Footer fondo", cssVariable: "--landing-footer-bg" },
  { key: "landingFooterText", label: "Landing · Footer texto", cssVariable: "--landing-footer-text" },
  { key: "landingFooterLink", label: "Landing · Footer link", cssVariable: "--landing-footer-link" },
  { key: "landingFooterLinkHover", label: "Landing · Footer link hover", cssVariable: "--landing-footer-link-hover" },
  { key: "landingFooterDivider", label: "Landing · Footer divisor", cssVariable: "--landing-footer-divider" },
  { key: "adminPageBg", label: "Admin · Fondo general", cssVariable: "--admin-page-bg" },
  { key: "adminSectionBg", label: "Admin · Fondo sección", cssVariable: "--admin-section-bg" },
  { key: "adminCardBg", label: "Admin · Fondo card", cssVariable: "--admin-card-bg" },
  { key: "adminCardText", label: "Admin · Texto card", cssVariable: "--admin-card-text" },
  { key: "adminCardTextSecondary", label: "Admin · Texto secundario card", cssVariable: "--admin-card-text-secondary" },
  { key: "adminPanelBg", label: "Admin · Fondo panel/sidebar", cssVariable: "--admin-panel-bg" },
  { key: "adminPanelText", label: "Admin · Texto panel/sidebar", cssVariable: "--admin-panel-text" },
  { key: "adminPanelTextMuted", label: "Admin · Texto tenue panel", cssVariable: "--admin-panel-text-muted" },
  { key: "adminInputBg", label: "Admin · Fondo input", cssVariable: "--admin-input-bg" },
  { key: "adminInputText", label: "Admin · Texto input", cssVariable: "--admin-input-text" },
  { key: "adminInputPlaceholder", label: "Admin · Placeholder", cssVariable: "--admin-input-placeholder" },
  { key: "adminTextMain", label: "Admin · Texto principal", cssVariable: "--admin-text-main" },
  { key: "adminTextSecondary", label: "Admin · Texto secundario", cssVariable: "--admin-text-secondary" },
  { key: "adminTextMuted", label: "Admin · Texto tenue", cssVariable: "--admin-text-muted" },
  { key: "adminBorder", label: "Admin · Borde", cssVariable: "--admin-border" },
  { key: "adminBorderSubtle", label: "Admin · Borde sutil", cssVariable: "--admin-border-subtle" },
  { key: "adminBorderStrong", label: "Admin · Borde fuerte", cssVariable: "--admin-border-strong" },
  { key: "accent", label: "Acento", cssVariable: "--accent" },
  { key: "accentHover", label: "Acento hover", cssVariable: "--accent-hover" },
  { key: "accentDeep", label: "Acento profundo", cssVariable: "--accent-deep" },
  { key: "accentSoft", label: "Acento suave", cssVariable: "--accent-soft" },
  { key: "accentBorder", label: "Borde acento", cssVariable: "--accent-border" },
  { key: "accentText", label: "Texto sobre acento", cssVariable: "--accent-text" },
  { key: "dropdownBg", label: "Desplegable · Fondo", cssVariable: "--dropdown-bg" },
  { key: "dropdownText", label: "Desplegable · Texto", cssVariable: "--dropdown-text" },
  { key: "dropdownTextMuted", label: "Desplegable · Texto tenue", cssVariable: "--dropdown-text-muted" },
  { key: "dropdownHoverBg", label: "Desplegable · Hover", cssVariable: "--dropdown-hover-bg" },
  { key: "dropdownSelectedBg", label: "Desplegable · Seleccionado fondo", cssVariable: "--dropdown-selected-bg" },
  { key: "dropdownSelectedText", label: "Desplegable · Seleccionado texto", cssVariable: "--dropdown-selected-text" },
  { key: "dropdownBorder", label: "Desplegable · Borde", cssVariable: "--dropdown-border" },
  { key: "dropdownShadow", label: "Desplegable · Sombra", cssVariable: "--dropdown-shadow" },
  { key: "modalBg", label: "Modal · Fondo", cssVariable: "--modal-bg" },
  { key: "modalText", label: "Modal · Texto", cssVariable: "--modal-text" },
  { key: "popoverBg", label: "Popover · Fondo", cssVariable: "--popover-bg" },
  { key: "popoverText", label: "Popover · Texto", cssVariable: "--popover-text" },
  { key: "tableHeaderBg", label: "Tabla · Encabezado fondo", cssVariable: "--table-header-bg" },
  { key: "tableHeaderText", label: "Tabla · Encabezado texto", cssVariable: "--table-header-text" },
  { key: "tableRowBg", label: "Tabla · Fila fondo", cssVariable: "--table-row-bg" },
  { key: "tableRowText", label: "Tabla · Fila texto", cssVariable: "--table-row-text" },
  { key: "tableRowMutedText", label: "Tabla · Fila texto tenue", cssVariable: "--table-row-muted-text" },
  { key: "tableFirstColBg", label: "Tabla · Primera columna fondo", cssVariable: "--table-first-col-bg" },
  { key: "tableFirstColText", label: "Tabla · Primera columna texto", cssVariable: "--table-first-col-text" },
  { key: "tableBorder", label: "Tabla · Borde", cssVariable: "--table-border" },
  { key: "tableHoverBg", label: "Tabla · Hover fila", cssVariable: "--table-hover-bg" },
  { key: "tableStickyShadow", label: "Tabla · Sombra columna fija", cssVariable: "--table-sticky-shadow" },
  { key: "statusCorrect", label: "Estado correcto", cssVariable: "--status-correct" },
  { key: "statusCorrectBorder", label: "Borde correcto", cssVariable: "--status-correct-border" },
  { key: "statusAttention", label: "Estado atención", cssVariable: "--status-attention" },
  { key: "statusAttentionBorder", label: "Borde atención", cssVariable: "--status-attention-border" },
  { key: "statusNeutral", label: "Estado neutro", cssVariable: "--status-neutral" },
  { key: "statusReprogrammedBorder", label: "Borde reprogramado", cssVariable: "--status-reprogrammed-border" },
  { key: "statusCancelledBorder", label: "Borde cancelado", cssVariable: "--status-cancelled-border" },
  { key: "agendaSelectedShadow", label: "Agenda · Sombra seleccionado", cssVariable: "--agenda-selected-shadow" },
  { key: "agendaEventBorder", label: "Agenda · Borde eventos", cssVariable: "--agenda-event-border" },
  { key: "agendaActionBorder", label: "Agenda · Borde acciones", cssVariable: "--agenda-action-border" },
  { key: "agendaPanelBg", label: "Agenda · Fondo panel", cssVariable: "--agenda-panel-bg" },
  { key: "agendaControlBg", label: "Agenda · Fondo controles", cssVariable: "--agenda-control-bg" },
  { key: "agendaControlActiveBg", label: "Agenda · Control activo", cssVariable: "--agenda-control-active-bg" },
  { key: "agendaFilterBorder", label: "Agenda · Borde filtros", cssVariable: "--agenda-filter-border" },
  { key: "agendaSearchBg", label: "Agenda · Fondo buscador", cssVariable: "--agenda-search-bg" },
];

export const paletteGroups: PaletteGroup[] = [
  { id: "landing-bg", title: "Landing · Fondos", description: "Fondos principales de secciones públicas.", keys: ["landingPageBg", "landingSectionBg", "landingCardBg"] },
  { id: "landing-text", title: "Landing · Textos por fondo", description: "Textos separados para garantizar contraste en landing.", keys: ["landingTextMain", "landingTextSecondary", "landingTextMuted", "landingCardText", "landingCardTextSecondary", "landingLink", "landingLinkHover"] },
  { id: "landing-decor", title: "Landing · Footer y decorativos", description: "Footer, hero y líneas visuales.", keys: ["landingFooterBg", "landingFooterText", "landingFooterLink", "landingFooterLinkHover", "landingFooterDivider", "landingHeroGlow1", "landingHeroGlow2", "landingGridLine"] },
  { id: "admin-bg", title: "Admin · Fondos", description: "Fondos principales del panel administrativo.", keys: ["adminPageBg", "adminSectionBg", "adminCardBg", "adminPanelBg"] },
  { id: "admin-text", title: "Admin · Textos por fondo", description: "Textos independientes para cards, paneles e inputs.", keys: ["adminTextMain", "adminTextSecondary", "adminTextMuted", "adminCardText", "adminCardTextSecondary", "adminPanelText", "adminPanelTextMuted", "adminInputText", "adminInputPlaceholder"] },
  { id: "admin-components", title: "Admin · Componentes", description: "Inputs, bordes, acentos y estados interactivos.", keys: ["adminInputBg", "adminBorder", "adminBorderSubtle", "adminBorderStrong", "accent", "accentHover", "accentDeep", "accentSoft", "accentBorder", "accentText"] },
  { id: "dropdowns", title: "Desplegables y overlays", description: "Select, dropdown, popover y modal de Ant Design.", keys: ["dropdownBg", "dropdownText", "dropdownTextMuted", "dropdownHoverBg", "dropdownSelectedBg", "dropdownSelectedText", "dropdownBorder", "dropdownShadow", "modalBg", "modalText", "popoverBg", "popoverText"] },
  { id: "tables", title: "Tablas", description: "Encabezado, filas, primera columna fija, hover y bordes.", keys: ["tableHeaderBg", "tableHeaderText", "tableRowBg", "tableRowText", "tableRowMutedText", "tableFirstColBg", "tableFirstColText", "tableBorder", "tableHoverBg", "tableStickyShadow"] },
  { id: "states", title: "Estados", description: "Estados correctos, atención y neutral.", keys: ["statusCorrect", "statusCorrectBorder", "statusAttention", "statusAttentionBorder", "statusNeutral", "statusReprogrammedBorder", "statusCancelledBorder"] },
  { id: "agenda", title: "Agenda", description: "Colores específicos de calendario y acciones.", keys: ["agendaSelectedShadow", "agendaEventBorder", "agendaActionBorder", "agendaPanelBg", "agendaControlBg", "agendaControlActiveBg", "agendaFilterBorder", "agendaSearchBg"] },
];

export const defaultEditablePalette: EditablePalette = {
  landingPageBg: "#FFFBF7",
  landingSectionBg: "#F7FFDE",
  landingCardBg: "#6F755A",
  landingCardText: "#F5EBE2",
  landingCardTextSecondary: "#E0EDAF",
  landingTextMain: "#35382B",
  landingTextSecondary: "#484D3B",
  landingTextMuted: "#827C74",
  landingHeroGlow1: "#ACB984",
  landingHeroGlow2: "#735443",
  landingGridLine: "#696F55",
  landingLink: "#696F55",
  landingLinkHover: "#585933",
  landingFooterBg: "#323313",
  landingFooterText: "#F5EBE2",
  landingFooterLink: "#ACB984",
  landingFooterLinkHover: "#E0EDAF",
  landingFooterDivider: "#CFC4BE",
  adminPageBg: "#FFFBF7",
  adminSectionBg: "#FFFBF7",
  adminCardBg: "#FFFBF7",
  adminCardText: "#35382B",
  adminCardTextSecondary: "#484D3B",
  adminPanelBg: "#6F755A",
  adminPanelText: "#F5EBE2",
  adminPanelTextMuted: "#D4C9BC",
  adminInputBg: "#FFFBF7",
  adminInputText: "#35382B",
  adminInputPlaceholder: "#827C74",
  adminTextMain: "#35382B",
  adminTextSecondary: "#484D3B",
  adminTextMuted: "#827C74",
  adminBorder: "#CFC4BE",
  adminBorderSubtle: "#CFC4BE",
  adminBorderStrong: "#ACB984",
  accent: "#696F55",
  accentHover: "#585933",
  accentDeep: "#464A37",
  accentSoft: "#F2EEC9",
  accentBorder: "#ACB984",
  accentText: "#FCF0E1",
  dropdownBg: "#FFFBF7",
  dropdownText: "#35382B",
  dropdownTextMuted: "#827C74",
  dropdownHoverBg: "#F2EEC9",
  dropdownSelectedBg: "#F2EEC9",
  dropdownSelectedText: "#464A37",
  dropdownBorder: "#CFC4BE",
  dropdownShadow: "#35382B",
  modalBg: "#FFFBF7",
  modalText: "#35382B",
  popoverBg: "#FFFBF7",
  popoverText: "#35382B",
  tableHeaderBg: "#FFFBF7",
  tableHeaderText: "#827C74",
  tableRowBg: "#FFFBF7",
  tableRowText: "#35382B",
  tableRowMutedText: "#827C74",
  tableFirstColBg: "#FFFBF7",
  tableFirstColText: "#35382B",
  tableBorder: "#CFC4BE",
  tableHoverBg: "#F2EEC9",
  tableStickyShadow: "#35382B",
  statusCorrect: "#6F7D55",
  statusCorrectBorder: "#DFE7CF",
  statusAttention: "#9A7928",
  statusAttentionBorder: "#EADCB9",
  statusNeutral: "#827C74",
  statusReprogrammedBorder: "#B8A46A",
  statusCancelledBorder: "#B9897F",
  agendaSelectedShadow: "#EDE5C5",
  agendaEventBorder: "#CFC4BE",
  agendaActionBorder: "#ACB984",
  agendaPanelBg: "#FFFBF7",
  agendaControlBg: "#FFFBF7",
  agendaControlActiveBg: "#F2EEC9",
  agendaFilterBorder: "#CFC4BE",
  agendaSearchBg: "#FFFBF7",
};

export const defaultDarkEditablePalette: EditablePalette = {
  ...defaultEditablePalette,
  landingPageBg: "#20211F",
  landingSectionBg: "#252610",
  landingCardBg: "#464A37",
  landingCardText: "#F5EBE2",
  landingCardTextSecondary: "#F2EEC9",
  landingTextMain: "#F5EBE2",
  landingTextSecondary: "#F2EEC9",
  landingTextMuted: "#BEBF9F",
  landingHeroGlow1: "#ACB984",
  landingHeroGlow2: "#735443",
  landingGridLine: "#F5EBE2",
  landingLink: "#ACB984",
  landingLinkHover: "#E0EDAF",
  landingFooterBg: "#323309",
  landingFooterText: "#F5EBE2",
  landingFooterLink: "#ACB984",
  landingFooterLinkHover: "#E0EDAF",
  landingFooterDivider: "#73715F",
  adminPageBg: "#20211F",
  adminSectionBg: "#252610",
  adminCardBg: "#464A37",
  adminCardText: "#F5EBE2",
  adminCardTextSecondary: "#F2EEC9",
  adminPanelBg: "#323309",
  adminPanelText: "#F5EBE2",
  adminPanelTextMuted: "#BEBF9F",
  adminInputBg: "#323313",
  adminInputText: "#F5EBE2",
  adminInputPlaceholder: "#BEBF9F",
  adminTextMain: "#F5EBE2",
  adminTextSecondary: "#F2EEC9",
  adminTextMuted: "#BEBF9F",
  adminBorder: "#73715F",
  adminBorderSubtle: "#73715F",
  adminBorderStrong: "#ACB984",
  accent: "#ACB984",
  accentHover: "#B4BF8E",
  accentDeep: "#E0EDAF",
  accentSoft: "#585933",
  accentBorder: "#8B8C6C",
  accentText: "#323309",
  dropdownBg: "#323313",
  dropdownText: "#F5EBE2",
  dropdownTextMuted: "#BEBF9F",
  dropdownHoverBg: "#464A37",
  dropdownSelectedBg: "#585933",
  dropdownSelectedText: "#F5EBE2",
  dropdownBorder: "#73715F",
  dropdownShadow: "#000000",
  modalBg: "#323313",
  modalText: "#F5EBE2",
  popoverBg: "#323313",
  popoverText: "#F5EBE2",
  tableHeaderBg: "#464A37",
  tableHeaderText: "#F2EEC9",
  tableRowBg: "#20211F",
  tableRowText: "#F5EBE2",
  tableRowMutedText: "#BEBF9F",
  tableFirstColBg: "#464A37",
  tableFirstColText: "#F5EBE2",
  tableBorder: "#73715F",
  tableHoverBg: "#585933",
  tableStickyShadow: "#000000",
  statusCorrect: "#ACB984",
  statusCorrectBorder: "#8B8C6C",
  statusAttention: "#E0EDAF",
  statusAttentionBorder: "#B4BF8E",
  statusNeutral: "#BEBF9F",
  statusReprogrammedBorder: "#B8A46A",
  statusCancelledBorder: "#B9897F",
  agendaSelectedShadow: "#585933",
  agendaEventBorder: "#73715F",
  agendaActionBorder: "#8B8C6C",
  agendaPanelBg: "#20211F",
  agendaControlBg: "#323313",
  agendaControlActiveBg: "#585933",
  agendaFilterBorder: "#73715F",
  agendaSearchBg: "#323313",
};