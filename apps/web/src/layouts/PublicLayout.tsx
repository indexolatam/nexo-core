import { Outlet } from "react-router-dom";
import { PublicHeader } from "../landing/components/PublicHeader";
import { PublicFooter } from "../landing/components/PublicFooter";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)]">
      <PublicHeader />
      <main><Outlet /></main>
      <PublicFooter />
    </div>
  );
}
