import { CaretRightOutlined, DeleteOutlined, EditOutlined, PlusOutlined, UndoOutlined } from "@ant-design/icons";
import { Button, Card, Input, message, Modal, Select, Tag } from "antd";
import { useEffect, useState } from "react";
import { paletteGroups } from "./types/adminPalette";
import { useTheme } from "../../context/ThemeContext";
import type { UserConfig, BlogPostConfig } from "./types/adminSettings";
import type { D1Role } from "../../shared/types/d1";
import { blogService, usersService } from "../../services";
import { useAuth } from "../auth/AuthContext";
import { usePermissions } from "../../shared/hooks/usePermissions";
import { PaletteGroupPanel } from "./components/PaletteGroupPanel";
import { ConfigListItem } from "./components/ConfigListItem";
import { BankManager } from "./components/BankManager";
import { ServiceManager } from "./components/ServiceManager";
import { PermissionsManager } from "./components/PermissionsManager";

const landingPaletteGroups = paletteGroups.filter((group) => group.id.startsWith("landing"));
const adminPaletteGroups = paletteGroups.filter((group) => !group.id.startsWith("landing"));

type ConfigSection = "apariencia" | "servicios" | "horarios" | "usuarios" | "preferencias" | "blog" | "permisos";

function toD1Role(role: string): D1Role {
  if (role === "Administrador") return "admin";
  if (role === "Operativo") return "asistente";
  return "asistente";
}

const sectionLabels: Record<ConfigSection, string> = {
  apariencia: "Apariencia",
  servicios: "Servicios",
  horarios: "Horarios",
  usuarios: "Usuarios",
  preferencias: "Preferencias",
  blog: "Blog",
  permisos: "Permisos de módulos",
};

export function SettingsPage() {
  const { resetPalette, theme } = useTheme();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isRootOrAdmin = user?.role === "root" || user?.role === "admin";
  const canEditUsers = hasPermission("configuracion", "edit");
  const [openSection, setOpenSection] = useState<ConfigSection | null>("apariencia");
  const [users, setUsers] = useState<UserConfig[]>([]);
  const [posts, setPosts] = useState<BlogPostConfig[]>([]);
  const [userOpen, setUserOpen] = useState(false);
  const [postEditorOpen, setPostEditorOpen] = useState(false);
  const [userDraft, setUserDraft] = useState({ name: "", role: "Operativo" });
  const [postDraft, setPostDraft] = useState<BlogPostConfig>({ id: "", title: "", status: "Borrador", tags: "", content: "", image: "", date: "2026-06-14" });
  const [blogFilter, setBlogFilter] = useState<"Todos" | "Borradores" | "Publicados">("Todos");
  const [blogSearch, setBlogSearch] = useState("");

  useEffect(() => {
    usersService.list().then((data) => setUsers(data as unknown as UserConfig[])).catch(() => message.error("No se pudieron cargar los usuarios"));
    blogService.list().then((data) => setPosts(data as unknown as BlogPostConfig[])).catch(() => message.error("No se pudieron cargar los posts del blog"));
  }, []);

  const toggleSection = (section: ConfigSection) => setOpenSection((current) => (current === section ? null : section));

  const createUser = async () => {
    const name = userDraft.name.trim();
    if (!name) return message.warning("Escribe el nombre del usuario");
    try {
      const created = await usersService.create({ username: name.toLowerCase().replace(/\s+/g, "-"), name, lastname: "", email: "", display_label: name, role: toD1Role(userDraft.role), active: true, password: "changeme" });
      setUsers((prev) => [...prev, created as unknown as UserConfig]);
      setUserDraft({ name: "", role: "Operativo" });
      setUserOpen(false);
      message.success("Usuario agregado");
    } catch { message.error("No se pudo crear el usuario"); }
  };

  const openPostEditor = (post?: BlogPostConfig) => {
    setPostDraft(post ?? { id: "", title: "", status: "Borrador", tags: "", content: "", image: "", date: "2026-06-14" });
    setPostEditorOpen(true);
  };

  const deletePost = async (id: string) => {
    try { await blogService.remove(id); setPosts((prev) => prev.filter((p) => p.id !== id)); message.success("Post eliminado"); }
    catch { message.error("No se pudo eliminar el post"); }
  };

  const savePost = async (status?: BlogPostConfig["status"]) => {
    const title = postDraft.title.trim();
    if (!title) return message.warning("Escribe el título del post");
    const nextStatus = status ?? postDraft.status;
    try {
      if (postDraft.id) {
        const updated = await blogService.update(postDraft.id, { ...postDraft, title, status: nextStatus });
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated as BlogPostConfig : p)));
      } else {
        const created = await blogService.create({ ...postDraft, title, status: nextStatus });
        setPosts((prev) => [created as BlogPostConfig, ...prev]);
      }
      setPostEditorOpen(false);
      message.success(nextStatus === "Publicado" ? "Post publicado" : "Post guardado");
    } catch { message.error("No se pudo guardar el post"); }
  };

  const visiblePosts = posts.filter((post) => {
    const statusMatch = blogFilter === "Todos" || (blogFilter === "Borradores" ? post.status === "Borrador" : post.status === "Publicado");
    const searchMatch = !blogSearch.trim() || post.title.toLowerCase().includes(blogSearch.trim().toLowerCase());
    return statusMatch && searchMatch;
  });

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Resumen de configuración</p>
        <h1 className="mt-3 text-2xl font-bold text-surface-main sm:text-4xl">Configuración</h1>
        <p className="mt-2 max-w-3xl text-sm text-surface-secondary">Configuración del sistema administrativo. Preferencias generales.</p>
      </section>

      <Card className="rounded-3xl border-[var(--border)]" styles={{ body: { padding: 0 } }}>
        {(Object.keys(sectionLabels) as ConfigSection[]).map((section) => (
          <section key={section} className="border-b border-[var(--border-subtle)] last:border-b-0">
            <button type="button" onClick={() => toggleSection(section)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-[var(--accent-soft)]/20 sm:px-6">
              <span className="text-base font-bold text-surface-main">{sectionLabels[section]}</span>
              <CaretRightOutlined className={`text-xs text-surface-muted transition-transform duration-200 ${openSection === section ? "rotate-90" : ""}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-200 ease-in-out ${openSection === section ? "max-h-[900px]" : "max-h-0"}`}>
              <div className="max-h-[820px] overflow-y-auto px-5 pb-5 thin-task-scrollbar sm:px-6">
                {section === "apariencia" ? (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-surface-main">Paleta visual{theme === "dark" ? " (modo oscuro)" : ""}</h2>
                        <p className="mt-1 text-sm text-surface-secondary">Dos grupos grandes: landing y panel admin. Dentro de cada uno, los colores están separados por fondos, textos, componentes y estados.</p>
                      </div>
                      <Button className="rounded-button" icon={<UndoOutlined />} onClick={resetPalette}>Restaurar</Button>
                    </div>
                    <PaletteGroupPanel title="Landing" groups={landingPaletteGroups} theme={theme} />
                    <PaletteGroupPanel title="Panel admin" groups={adminPaletteGroups} theme={theme} />
                  </div>
                ) : null}

                {section === "servicios" ? (
                  <ServiceManager />
                ) : null}

                {section === "horarios" ? (
                  <div className="rounded-2xl border border-[var(--border-subtle)] p-4">
                    <p className="font-semibold text-surface-main">Lunes - Viernes</p>
                    <p className="mt-1 text-sm text-surface-secondary">09:00 - 18:00</p>
                    <p className="mt-3 text-sm text-surface-secondary">Duración consulta: 60 min</p>
                    <Button className="mt-4 rounded-button" icon={<EditOutlined />} onClick={() => message.info("Edición de horarios pendiente de backend")}>Editar</Button>
                  </div>
                ) : null}

                {section === "usuarios" ? (
                  canEditUsers ? (
                    <div className="space-y-4">
                      <Button icon={<PlusOutlined />} className="rounded-button" onClick={() => setUserOpen(true)}>Nuevo usuario</Button>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {users.map((user) => <ConfigListItem key={user.id} title={user.name} subtitle={`${user.role} · ${user.active ? "Activo" : "Inactivo"}`} />)}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-surface-secondary">No tienes permiso para gestionar usuarios.</p>
                  )
                ) : null}

                {section === "preferencias" ? (
                  <div className="space-y-6">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <ConfigListItem title="Moneda" subtitle="USD" />
                      <ConfigListItem title="Formato fecha" subtitle="DD/MM/YYYY" />
                      <ConfigListItem title="Zona horaria" subtitle="GMT-6" />
                    </div>
                    <div className="border-t border-[var(--border-subtle)] pt-5">
                      <h2 className="text-xl font-bold text-surface-main">Cuentas bancarias</h2>
                      <p className="mt-1 text-sm text-surface-secondary">Agrega, elimina o deshabilita bancos para Finanzas.</p>
                      <BankManager />
                    </div>
                  </div>
                ) : null}

                {section === "blog" ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Input value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)} placeholder="Buscar post" className="rounded-button sm:max-w-xs" />
                      <Button icon={<PlusOutlined />} className="rounded-button" onClick={() => openPostEditor()}>Nuevo post</Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(["Todos", "Borradores", "Publicados"] as const).map((filter) => (
                        <Button key={filter} size="small" type={blogFilter === filter ? "primary" : "default"} className="rounded-button" onClick={() => setBlogFilter(filter)}>{filter}</Button>
                      ))}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {visiblePosts.map((post) => (
                        <div key={post.id} className="group relative rounded-2xl border border-[var(--border-subtle)] p-4 transition-colors hover:border-[var(--accent-border)]">
                          <button type="button" onClick={() => openPostEditor(post)} className="w-full text-left">
                            <p className="font-semibold text-surface-main">{post.title}</p>
                            <Tag className="mt-2" color={post.status === "Publicado" ? "green" : "default"}>{post.status}</Tag>
                          </button>
                          <button type="button" onClick={() => deletePost(post.id)} className="absolute right-2 top-2 hidden rounded-full p-1 text-surface-muted opacity-0 transition-all hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 sm:block" title="Eliminar post">
                            <DeleteOutlined />
                          </button>
                        </div>
                      ))}
                    </div>
                    {visiblePosts.length === 0 ? <p className="text-sm text-surface-muted">Sin posts para mostrar. Crea el primero.</p> : null}
                  </div>
                ) : null}

                {section === "permisos" && isRootOrAdmin ? (
                  <div className="space-y-4">
                    <p className="text-sm text-surface-secondary">Define qué puede hacer cada rol en cada módulo. Los permisos solo pueden reducirse, no exceder el máximo del rol.</p>
                    <PermissionsManager />
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ))}
      </Card>

      <Modal title="Nuevo usuario" open={userOpen} onOk={createUser} onCancel={() => setUserOpen(false)} okText="Guardar" cancelText="Cancelar" centered>
        <div className="space-y-3">
          <Input value={userDraft.name} onChange={(e) => setUserDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder="Nombre del usuario" />
          <Select className="w-full" value={userDraft.role} onChange={(role) => setUserDraft((prev) => ({ ...prev, role }))} options={["Administrador", "Operativo", "Lectura"].map((r) => ({ value: r, label: r }))} />
        </div>
      </Modal>

      <Modal title={postDraft.id ? "Editar post" : "Nuevo post"} open={postEditorOpen} onCancel={() => setPostEditorOpen(false)} footer={[<Button key="save" onClick={() => savePost()}>Guardar</Button>, <Button key="publish" type="primary" onClick={() => savePost("Publicado")}>Publicar</Button>]} centered width={720}>
        <div className="space-y-3">
          <Input value={postDraft.title} onChange={(e) => setPostDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder="Título" />
          <Input.TextArea rows={6} value={postDraft.content} onChange={(e) => setPostDraft((prev) => ({ ...prev, content: e.target.value }))} placeholder="Contenido" />
          <Input value={postDraft.tags} onChange={(e) => setPostDraft((prev) => ({ ...prev, tags: e.target.value }))} placeholder="Tags" />
          <Input value={postDraft.image} onChange={(e) => setPostDraft((prev) => ({ ...prev, image: e.target.value }))} placeholder="Imagen" />
          <Select className="w-full" value={postDraft.status} onChange={(status) => setPostDraft((prev) => ({ ...prev, status }))} options={["Borrador", "Publicado"].map((s) => ({ value: s, label: s }))} />
          <Input value={postDraft.date} onChange={(e) => setPostDraft((prev) => ({ ...prev, date: e.target.value }))} placeholder="Fecha" />
        </div>
      </Modal>
    </div>
  );
}