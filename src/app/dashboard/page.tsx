// src/app/dashboard/page.tsx
"use client";
import StrategyMomentumCard from "@/components/StrategyMomentumCard";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import OmegaTradingPanel from "../components/OmegaTradingPanel"; // ✅ Ruta corregida
import VisualAdvisor from "@/components/VisualAdvisor"; // 🧠 Nuevo bloque v11
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  return (
    <main className="space-y-10">
      {/* ... tu panel de control actual ... */}

      <hr className="border-neutral-800 opacity-40" />

      <section>
        <h2 className="text-xl font-semibold text-cyan-400 mb-4">
          🔮 Estrategias Inteligentes — OMEGA Core v10.3-B
        </h2>
        <StrategyMomentumCard />
      </section>
    </main>
  );
}