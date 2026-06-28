import { Spin } from "antd";
import { Navigate } from "react-router-dom";
import { usePermissions } from "../hooks/usePermissions";

interface RequireRoleProps {
  module: string;
  action: "read" | "create" | "edit" | "delete";
  children: React.ReactNode;
}

export function RequireRole({ module, action, children }: RequireRoleProps) {
  const { hasPermission, loading } = usePermissions();
  if (loading) return <div className="flex min-h-[200px] items-center justify-center"><Spin /></div>;
  if (!hasPermission(module, action)) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}
