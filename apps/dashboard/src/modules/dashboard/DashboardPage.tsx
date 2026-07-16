import { Typography } from "antd";
import { useAuth } from "../auth/AuthContext.js";

export function DashboardPage() {
  const { user } = useAuth();
  return (
    <div>
      <Typography.Title level={3}>Bienvenido, {user?.name} {user?.lastname}</Typography.Title>
      <Typography.Paragraph type="secondary">Panel de administración NEXO</Typography.Paragraph>
    </div>
  );
}
