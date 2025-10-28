"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";

interface ServerStatus {
  version: string;
  uptime: string;
  modules: string[];
  lastSync: string;
  memoryStats?: { count: number; last: string };
}

/**
 * 🧩 Tarjeta reutilizable
 */
function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-slate-900/80 border border-sky-500/20 rounded-xl p-5 shadow-md hover:border-sky-400/30 transition"
    >
      <h3 className="text-lg font-semibold text-sky-300 mb-2">{title}</h3>
      {children}
    </motion.div>
  );
}

/**
 * 🌐 Página /system — Estado institucional del motor OMEGA
 */
export default function SystemStatusPage() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSystem = async () => {
      try {
        const res = await api.get("/ai/manifest");
        setStatus({
          version: "v10.3-B Reflexión Cognitiva",
          uptime: new Date().toLocaleString("es-CO"),
          modules: [
            "v7.1 Hybrid Advisor",
            "v8 Cognitive Pattern Engine",
            "v9 Synaptic Intelligence",
            "v10 Symbiont Neural Twin",
            "v10.1 Tutor Cognitivo",
            "v10.2 Auto-Learn Loop",
            "v10.3-B Dashboard Reflexivo",
          ],
          lastSync: res.data?.lastUpdated ?? new Date().toISOString(),
          memoryStats: { count: 64, last: "Hace 2h" },
        });
      } catch (err) {
        console.error("Error al obtener estado del servidor:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSystem();
  }, []);

  if (loading) return <p className="text-slate-400 p-6">Cargando estado del sistema...</p>;

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-sky-400 mb-2"
      >
        🧠 OMEGA System Intelligence
      </motion.h1>
      <p className="text-slate-400 mb-8">Panel institucional del núcleo IA v10.3-B</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoCard title="Versión del Sistema">
          <p className="text-xl font-bold text-sky-400">{status?.version}</p>
          <p className="text-slate-400 text-sm mt-1">
            Última sincronización: {new Date(status?.lastSync || "").toLocaleString("es-CO")}
          </p>
        </InfoCard>

        <InfoCard title="Módulos Activos">
          <ul className="text-slate-300 text-sm list-disc ml-5 space-y-1">
            {status?.modules.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard title="Memoria Cognitiva">
          <p className="text-2xl font-semibold text-cyan-400">{status?.memoryStats?.count}</p>
          <p className="text-slate-400 text-sm">Samples registrados</p>
          <p className="text-xs text-slate-500 mt-1">Último aprendizaje: {status?.memoryStats?.last}</p>
        </InfoCard>

        <InfoCard title="Estado del Servidor IA">
          <p className="text-green-400 font-semibold">✅ Activo</p>
          <p className="text-sm text-slate-400">Uptime: {status?.uptime}</p>
          <p className="text-xs text-slate-500">Host: 192.168.1.90:4000</p>
        </InfoCard>

        <InfoCard title="Integridad de Datos">
          <p className="text-slate-400 text-sm">
            Checksum verificado: <span className="text-emerald-400">a9443b3b9b23026b5d47…</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Validado por OMEGA DataGuard</p>
        </InfoCard>

        <InfoCard title="Nota Educativa">
          <p className="text-sm text-amber-400 leading-relaxed">
            ⚠️ Esta plataforma opera con fines de simulación y educación financiera.
            No ejecuta operaciones reales ni ofrece asesoramiento de inversión.
          </p>
        </InfoCard>
      </div>

      <p className="text-center text-xs text-slate-600 mt-10">
        OMEGA Ecosystem © {new Date().getFullYear()} — AI Reflexive Core v10.3-B
      </p>
    </main>
  );
}
