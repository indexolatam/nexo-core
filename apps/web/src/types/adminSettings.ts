export type BankConfig = {
  id: string;
  name: string;
  enabled: boolean;
};

export type ServiceConfig = {
  services_id: string;
  services_name: string;
  services_duration: number;
  services_price: number;
  services_active: boolean;
};

export type UserConfig = {
  id: string;
  name: string;
  role: string;
  active: boolean;
};

export type BlogPostStatus = "Borrador" | "Publicado";

export type BlogPostConfig = {
  id: string;
  title: string;
  status: BlogPostStatus;
  tags: string;
  content: string;
  image: string;
  date: string;
};

export type ModulePermission = {
  module: string;
  can_read: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
};

export type ModulePermissionsByRole = Record<string, ModulePermission[]>;

export type ModuleKey = "usuarios" | "finanzas" | "agenda" | "tareas" | "configuracion" | "auditoria" | "blog";

export const ALL_MODULES: { key: ModuleKey; label: string }[] = [
  { key: "usuarios", label: "Usuarios" },
  { key: "finanzas", label: "Finanzas" },
  { key: "agenda", label: "Agenda" },
  { key: "tareas", label: "Tareas" },
  { key: "configuracion", label: "Configuración" },
  { key: "auditoria", label: "Auditoría" },
  { key: "blog", label: "Blog" },
];