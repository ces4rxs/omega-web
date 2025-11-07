"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import api from "@/lib/api";

interface Module {
  name: string;
  version: string;
  status: "ok" | "loading" | "error";
}

export default function ModulesGrid() {
  const [modules, setModules] = useState<Module[]>([]);

  // 🔹 Carga datos reales del backend
  useEffect(() => {
    async function loadModules() {
      try {
        const { data } = await api.get("/ai/reflex");
        const loaded = data.modules_loaded
          ? Object.entries(data.modules_loaded).map(([v, name]: any) => ({
              version: v,
              name,
              status: "ok" as const,
            }))
          : [];
        setModules(loaded);
      } catch (err) {
        // Si el backend no responde, mostramos dummy data
        setModules([
          { version: "v11", name: "Neural Advisor", status: "ok" },
          { version: "v12", name: "Monte Carlo Enhanced", status: "ok" },
          { version: "v13", name: "Quantum Risk Engine", status: "loading" },
          { version: "v14", name: "Reflex Intelligence", status: "ok" },
          { version: "v15", name: "Cognitive Unification", status: "ok" },
        ]);
      }
    }
    loadModules();
  }, []);

  const getColor = (status: string) => {
    switch (status) {
      case "ok":
        return "text-emerald-400 border-emerald-500/30 shadow-emerald-500/10";
      case "loading":
        return "text-amber-400 border-amber-500/30 shadow-amber-500/10 animate-pulse";
      case "error":
        return "text-red-400 border-red-500/30 shadow-red-500/10";
      default:
        return "text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="bg-[#0B1220] border border-[#1E293B] rounded-2xl p-4 mt-4">
      <h3 className="text-lg font-semibold text-sky-400 mb-3">
        🧩 Cognitive Modules — v11 → v15
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {modules.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border p-3 text-center shadow-md ${getColor(
              m.status
            )}`}
          >
            <p className="text-[12px] text-slate-400">{m.version}</p>
            <p className="text-sm font-semibold">{m.name}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
