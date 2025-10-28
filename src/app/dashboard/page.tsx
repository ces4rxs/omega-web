"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import OmegaTradingPanel from "../components/OmegaTradingPanel"; // ✅ Ruta corregida
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout user={user} onLogout={logout}>
        <OmegaTradingPanel />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
