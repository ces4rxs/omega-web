"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login"); // 🚪 redirige si no hay sesión
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sky-400 bg-[#0B1220]">
        Cargando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // evita que se muestre contenido antes de redirigir
  }

  return <>{children}</>;
}
