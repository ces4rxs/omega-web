"use client";

import MarketIntelligence from "./MarketIntelligence";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { motion } from "framer-motion";
import { colors } from "@/styles/theme";

export default function DashboardLayout({
  user,
  onLogout,
  children,
}: {
  user: any;
  onLogout: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen text-white" style={{ backgroundColor: colors.bgPrimary }}>
      {/* 🔹 Barra lateral izquierda */}
      <Sidebar onLogout={onLogout} />

      {/* 🔹 Contenedor principal */}
      <div className="flex-1 flex flex-col">
        {/* 🔸 Barra superior */}
        <Topbar user={user} />

        {/* 🔸 Contenido principal con soporte de paneles */}
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 grid grid-cols-1 xl:grid-cols-2 gap-6 p-6 overflow-y-auto"
        >
          {/* 🔹 Panel izquierdo: Trading o análisis */}
          <section className="rounded-2xl border p-4 shadow-lg" style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.borderPrimary
          }}>
            <h2 className="text-lg font-semibold mb-3" style={{ color: colors.cyanPrimary }}>
              📈 Panel de Control
            </h2>
            {children}
          </section>

          {/* 🔹 Panel derecho: IA o Mercados */}
          <section className="rounded-2xl border p-4 shadow-lg hidden xl:block" style={{
            backgroundColor: colors.bgCard,
            borderColor: colors.borderPrimary
          }}>
            <MarketIntelligence />
          </section>
        </motion.main>
      </div>
    </div>
  );
}
