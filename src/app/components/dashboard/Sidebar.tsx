"use client";

import { Home, Brain, BarChart3, Settings, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { colors } from "@/styles/theme";

export default function Sidebar({ onLogout }: { onLogout: () => void }) {
  const menu = [
    { icon: Home, label: "Inicio", href: "/dashboard" },
    { icon: Brain, label: "IA", href: "#" },
    { icon: BarChart3, label: "Análisis", href: "/analysis" },
    { icon: Settings, label: "Configuración", href: "#" },
  ];

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 70, damping: 12 }}
      className="hidden md:flex flex-col w-60 border-r p-4"
      style={{
        backgroundColor: `${colors.bgCard}e6`, // 90% opacity
        borderColor: colors.borderPrimary
      }}
    >
      <div className="mb-8">
        <h1 className="text-lg font-semibold tracking-wide" style={{ color: colors.textPrimary }}>
          Panel Principal
        </h1>
        <p className="text-xs mt-1" style={{ color: colors.textMuted }}>Módulos y control</p>
      </div>

      {/* Menú */}
      <nav className="flex-1 space-y-2">
        {menu.map((item, i) => (
          <a
            key={i}
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all hover:bg-[#00d4ff]/20"
            style={{ color: colors.textSecondary }}
            onMouseEnter={(e) => e.currentTarget.style.color = colors.cyanPrimary}
            onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
          >
            <item.icon size={18} />
            <span className="text-sm">{item.label}</span>
          </a>
        ))}
      </nav>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="mt-6 flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
        style={{ color: colors.redBearish }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors.redBearish}33`}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <LogOut size={18} />
        Cerrar sesión
      </button>
    </motion.aside>
  );
}
