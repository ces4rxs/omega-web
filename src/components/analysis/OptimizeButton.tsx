"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

interface OptimizeButtonProps {
  onClick: () => void;
  loading?: boolean;
}

export function OptimizeButton({ onClick, loading = false }: OptimizeButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={loading}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-2 rounded-lg border-2 border-[#fbbf24]/20 bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] px-8 py-4 shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-shadow hover:shadow-[0_0_50px_rgba(251,191,36,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-[#0a0e1a]" fill="currentColor" />
        <span className="text-base font-bold uppercase tracking-wider text-[#0a0e1a]">
          OPTIMIZAR RANGO
        </span>
      </div>
      <span className="text-xs font-medium text-[#0a0e1a]/80">
        {loading ? "Ejecutando optimizer_v5..." : "Ejecutar optimizer_v5"}
      </span>
    </motion.button>
  );
}
