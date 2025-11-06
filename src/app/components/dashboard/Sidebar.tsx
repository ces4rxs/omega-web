"use client";

import { Home, Brain, BarChart3, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const menu = [
    { icon: Home, label: "Inicio", href: "/dashboard" },
    { icon: Brain, label: "IA", href: "#" },
    { icon: BarChart3, label: "Análisis", href: "#" },
    { icon: Settings, label: "Configuración", href: "#" },
  ];

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 70, damping: 12 }}
      className="hidden md:flex flex-col w-60 bg-slate-900/70 backdrop-blur-lg border-r border-sky-500/30 p-4"
    >
      <div className="mb-8">
        <h1 className="text-lg font-semibold text-sky-400 tracking-wide">
          Panel Principal
        </h1>
        <p className="text-xs text-slate-400 mt-1">Módulos y control</p>
      </div>

      {/* Menú */}
      <nav className="flex-1 space-y-2">
        {menu.map((item, i) => (
          <a
            key={i}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-300 hover:bg-sky-500/20 hover:text-sky-400 transition-all"
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="mt-6 flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-all"
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </motion.aside>
  );
}
