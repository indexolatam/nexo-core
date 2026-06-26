import { useCallback, useEffect, useState } from "react";
import { permissionsService } from "../services";
import type { ModulePermissionsByRole } from "../types/adminSettings";
import { useAuth } from "../modules/auth/AuthContext";

const EMPTY: ModulePermissionsByRole = {};

export function usePermissions() {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<ModulePermissionsByRole>(EMPTY);
  const [loading, setLoading] = useState(true);

  const isRoot = user?.role === "root";
  const isAdmin = user?.role === "admin";
  const canManage = isRoot || isAdmin;

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let active = true;
    setLoading(true);
    permissionsService.list()
      .then((data) => { if (active) setPermissions(data); })
      .catch(() => { if (active) setPermissions(EMPTY); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const hasPermission = useCallback((module: string, action: "read" | "create" | "edit"): boolean => {
    if (isRoot) return true;
    if (!user) return false;
    const rolePerms = permissions[user.role];
    if (!rolePerms) return false;
    const mod = rolePerms.find((p) => p.module === module);
    if (!mod) return false;
    return action === "read" ? mod.can_read : action === "create" ? mod.can_create : mod.can_edit;
  }, [isRoot, user, permissions]);

  const updatePermissions = useCallback(async (next: ModulePermissionsByRole) => {
    await permissionsService.update(next);
    setPermissions(next);
  }, []);

  return { permissions, loading, isRoot, isAdmin, canManage, hasPermission, updatePermissions };
}
