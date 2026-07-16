import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, Typography, Alert } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "./AuthContext.js";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setError(""); setLoading(true);
    try { await login(values.username, values.password); navigate("/admin", { replace: true }); }
    catch (err) { setError(err instanceof Error ? err.message : "Error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <Typography.Title level={2} className="text-center !mb-6">NEXO</Typography.Title>
        {error && <Alert message={error} type="error" showIcon className="mb-4" />}
        <Form onFinish={onFinish} layout="vertical" size="large">
          <Form.Item name="username" rules={[{ required: true, message: "Usuario requerido" }]}>
            <Input prefix={<UserOutlined />} placeholder="Usuario" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: "Contraseña requerida" }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Contraseña" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>Iniciar sesión</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
