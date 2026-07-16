import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Button, Typography } from "antd";
import { DashboardOutlined, TeamOutlined, LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useAuth } from "../modules/auth/AuthContext.js";

const { Header, Sider, Content } = Layout;

const NAV = [
  { key: "/admin", icon: <DashboardOutlined />, label: "Inicio" },
  { key: "/admin/personas", icon: <TeamOutlined />, label: "Personas" },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const selected = NAV.find((i) => location.pathname === i.key || (i.key !== "/admin" && location.pathname.startsWith(i.key)))?.key || "/admin";

  return (
    <Layout className="min-h-screen">
      <Sider trigger={null} collapsible collapsed={collapsed} breakpoint="lg" onBreakpoint={(b) => setCollapsed(b)}>
        <div className="p-4 text-center text-white font-bold text-xl">{collapsed ? "N" : "NEXO"}</div>
        <Menu mode="inline" selectedKeys={[selected]} theme="dark" items={NAV} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header className="flex items-center justify-between px-4 bg-white shadow-sm">
          <Button type="text" icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} onClick={() => setCollapsed(!collapsed)} />
          <div className="flex items-center gap-4">
            <Typography.Text>{user?.display_label || user?.name}</Typography.Text>
            <Button type="text" icon={<LogoutOutlined />} onClick={logout}>Salir</Button>
          </div>
        </Header>
        <Content className="m-4 p-6 bg-white rounded"><Outlet /></Content>
      </Layout>
    </Layout>
  );
}
