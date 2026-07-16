import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../modules/auth/AuthContext.js";
import { LoginPage } from "../modules/auth/LoginPage.js";
import { AdminLayout } from "../layouts/AdminLayout.js";
import { DashboardPage } from "../modules/dashboard/DashboardPage.js";
import { PersonasPage } from "../modules/personas/PersonasPage.js";
import { PersonaDetailPage } from "../modules/personas/PersonaDetailPage.js";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Cargando...</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
          <Route index element={<DashboardPage />} />
          <Route path="personas" element={<PersonasPage />} />
          <Route path="personas/:id" element={<PersonaDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
