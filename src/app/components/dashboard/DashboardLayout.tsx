"use client";

import MarketIntelligence from "./MarketIntelligence";
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { motion } from "framer-motion";

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
    <div className="flex min-h-screen bg-[#0B1220] text-white">
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
          <section className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 shadow-lg">
            <h2 className="text-lg font-semibold text-sky-400 mb-3">
              📈 Panel de Control
            </h2>
            {children}
          </section>

          {/* 🔹 Panel derecho: IA o Mercados */}
          <section className="bg-[#0F172A] border border-[#1E293B] rounded-2xl p-4 shadow-lg hidden xl:block">
            <MarketIntelligence />
          </section>
        </motion.main>
      </div>
    </div>
  );
}
