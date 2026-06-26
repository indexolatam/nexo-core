import { Button, Checkbox, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { usePermissions } from "../../../hooks/usePermissions";
import type { ModulePermissionsByRole, ModuleKey } from "../../../types/adminSettings";
import { ALL_MODULES } from "../../../types/adminSettings";

const ROLE_LABELS: Record<string, string> = {
  root: "Root",
  admin: "Administrador",
  doctor: "Doctor",
  asistente: "Asistente",
};

const ROLE_MAX: Record<string, Record<ModuleKey, { can_read: boolean; can_create: boolean; can_edit: boolean }>> = {
  root: {
    personas: { can_read: true, can_create: true, can_edit: true },
    finanzas: { can_read: true, can_create: true, can_edit: true },
    agenda: { can_read: true, can_create: true, can_edit: true },
    tareas: { can_read: true, can_create: true, can_edit: true },
    configuracion: { can_read: true, can_create: true, can_edit: true },
    auditoria: { can_read: true, can_create: true, can_edit: true },
    blog: { can_read: true, can_create: true, can_edit: true },
  },
  admin: {
    personas: { can_read: true, can_create: true, can_edit: true },
    finanzas: { can_read: true, can_create: true, can_edit: true },
    agenda: { can_read: true, can_create: true, can_edit: true },
    tareas: { can_read: true, can_create: true, can_edit: true },
    configuracion: { can_read: true, can_create: true, can_edit: true },
    auditoria: { can_read: false, can_create: false, can_edit: false },
    blog: { can_read: false, can_create: false, can_edit: false },
  },
  doctor: {
    personas: { can_read: false, can_create: false, can_edit: false },
    finanzas: { can_read: false, can_create: false, can_edit: false },
    agenda: { can_read: true, can_create: true, can_edit: true },
    tareas: { can_read: true, can_create: true, can_edit: true },
    configuracion: { can_read: false, can_create: false, can_edit: false },
    auditoria: { can_read: false, can_create: false, can_edit: false },
    blog: { can_read: false, can_create: false, can_edit: false },
  },
  asistente: {
    personas: { can_read: true, can_create: true, can_edit: true },
    finanzas: { can_read: true, can_create: true, can_edit: true },
    agenda: { can_read: true, can_create: true, can_edit: true },
    tareas: { can_read: true, can_create: true, can_edit: true },
    configuracion: { can_read: true, can_create: false, can_edit: false },
    auditoria: { can_read: false, can_create: false, can_edit: false },
    blog: { can_read: false, can_create: false, can_edit: false },
  },
};

function isAtMax(role: string, module: ModuleKey, field: "can_read" | "can_create" | "can_edit"): boolean {
  return ROLE_MAX[role]?.[module]?.[field] === false;
}

export function PermissionsManager() {
  const { permissions, loading, updatePermissions } = usePermissions();
  const [local, setLocal] = useState<ModulePermissionsByRole>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (Object.keys(permissions).length > 0) setLocal(permissions);
  }, [permissions]);

  const roles = Object.keys(local);

  const toggle = (role: string, module: ModuleKey, field: "can_read" | "can_create" | "can_edit") => {
    setLocal((prev) => {
      const next = { ...prev };
      next[role] = (next[role] || []).map((p) =>
        p.module === module ? { ...p, [field]: !p[field] } : p
      );
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePermissions(local);
      message.success("Permisos guardados");
    } catch {
      message.error("No se pudieron guardar los permisos");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-8 text-center"><Spin /></div>;
  if (roles.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              <th className="px-3 py-2 text-left font-semibold text-surface-main">Módulo</th>
              {roles.map((role) => (
                <th key={role} colSpan={3} className="px-3 py-2 text-center font-semibold text-surface-main border-l border-[var(--border-subtle)]">
                  {ROLE_LABELS[role] || role}
                </th>
              ))}
            </tr>
            <tr className="border-b border-[var(--border-subtle)] text-xs text-surface-muted">
              <th></th>
              {roles.map((role) => (
                <th key={role} className="border-l border-[var(--border-subtle)]" colSpan={3}>
                  <div className="grid grid-cols-3 gap-1 px-1">
                    <span className="text-center">Leer</span>
                    <span className="text-center">Crear</span>
                    <span className="text-center">Editar</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_MODULES.map((mod) => (
              <tr key={mod.key} className="border-b border-[var(--border-subtle)] hover:bg-[var(--accent-soft)]/10">
                <td className="px-3 py-2 font-medium text-surface-main">{mod.label}</td>
                {roles.map((role) => {
                  const perms = local[role]?.find((p) => p.module === mod.key);
                  const readMax = isAtMax(role, mod.key, "can_read");
                  const createMax = isAtMax(role, mod.key, "can_create");
                  const editMax = isAtMax(role, mod.key, "can_edit");
                  return (
                    <td key={role} className="border-l border-[var(--border-subtle)]">
                      <div className="grid grid-cols-3 gap-1 px-1">
                        <div className="flex justify-center">
                          <Checkbox
                            checked={perms?.can_read ?? false}
                            disabled={role === "root" || readMax}
                            onChange={() => toggle(role, mod.key, "can_read")}
                          />
                        </div>
                        <div className="flex justify-center">
                          <Checkbox
                            checked={perms?.can_create ?? false}
                            disabled={role === "root" || createMax}
                            onChange={() => toggle(role, mod.key, "can_create")}
                          />
                        </div>
                        <div className="flex justify-center">
                          <Checkbox
                            checked={perms?.can_edit ?? false}
                            disabled={role === "root" || editMax}
                            onChange={() => toggle(role, mod.key, "can_edit")}
                          />
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button type="primary" className="rounded-button" loading={saving} onClick={handleSave}>
          Guardar permisos
        </Button>
      </div>
    </div>
  );
}
