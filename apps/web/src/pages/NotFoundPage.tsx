import { Button } from "antd";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-[var(--text-muted)]">404</h1>
      <p className="mt-4 text-lg">Página no encontrada</p>
      <Link to="/"><Button type="primary" className="mt-6">Volver al inicio</Button></Link>
    </div>
  );
}
