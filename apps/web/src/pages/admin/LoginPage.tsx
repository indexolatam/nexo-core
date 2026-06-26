import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Form, Input } from "antd";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../modules/auth/AuthContext";
import { CLIENT } from "../../config/client";

interface LoginFormValues { username: string; password: string; }

export function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? "/admin";

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  const handleFinish = async (values: LoginFormValues) => {
    setError(null);
    setLoading(true);
    try {
      await login(values.username, values.password);
      navigate(from, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] px-4 py-12">
      <Card className="w-full max-w-md rounded-3xl border-[var(--border)] shadow-sm">
        <div className="mb-8 text-center">
          <img src={CLIENT.assets.headerLogo} alt={CLIENT.branding.name} className="mx-auto h-16 w-auto object-contain" />
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">Acceso interno</p>
          <h1 className="mt-3 text-3xl font-bold text-surface-main">Panel administrativo</h1>
          <p className="mt-3 text-sm text-surface-secondary">
            Ingresa con credenciales administrativas registradas en D1. En desarrollo: usuario y contraseña pueden ser iguales.
          </p>
        </div>

        {error ? <Alert className="mb-5" message={error} type="error" showIcon /> : null}

        <Form layout="vertical" onFinish={handleFinish} requiredMark={false}>
          <Form.Item label="Usuario" name="username" rules={[{ required: true, message: "Ingresa tu usuario." }]}>
            <Input prefix={<UserOutlined />} placeholder="doc, admin, root, asis" size="large" />
          </Form.Item>
          <Form.Item label="Contraseña" name="password" rules={[{ required: true, message: "Ingresa la contraseña." }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Ej.: admin / doc / root / asis" size="large" />
          </Form.Item>
          <Button htmlType="submit" type="primary" size="large" loading={loading} className="brand-primary rounded-button w-full">Ingresar</Button>
          <Link to="/" className="mt-3 block">
            <Button size="large" className="rounded-button brand-outline w-full">Volver a la landing</Button>
          </Link>
        </Form>

        <p className="mt-6 rounded-2xl bg-[var(--accent-soft)] px-4 py-3 text-xs text-[var(--accent-deep)]">
          Nota: no registrar diagnósticos, historia clínica ni información sensible en el panel.
        </p>
      </Card>
    </section>
  );
}