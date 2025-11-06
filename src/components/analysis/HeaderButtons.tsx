"use client";

import { Headphones, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface HeaderButtonsProps {
  onCoPilotClick?: () => void;
  onValidateClick?: () => void;
  onQuickActionClick?: () => void;
}

export function HeaderButtons({
  onCoPilotClick,
  onValidateClick,
  onQuickActionClick,
}: HeaderButtonsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* Co-Piloto Button */}
      <motion.button
        onClick={onCoPilotClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 rounded-lg border border-[#00d4ff]/50 bg-[#00d4ff]/10 px-4 py-2 text-sm font-medium text-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-shadow hover:shadow-[0_0_25px_rgba(0,212,255,0.4)]"
      >
        <Headphones className="h-4 w-4" />
        <span>Co-Piloto</span>
      </motion.button>

      {/* Validar Button */}
      <motion.button
        onClick={onValidateClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 rounded-lg border border-[#00d4ff]/50 bg-[#00d4ff]/10 px-4 py-2 text-sm font-medium text-[#00d4ff] shadow-[0_0_15px_rgba(0,212,255,0.2)] transition-shadow hover:shadow-[0_0_25px_rgba(0,212,255,0.4)]"
      >
        <Shield className="h-4 w-4" />
        <span>Validar</span>
      </motion.button>

      {/* Quick Action Button (Lightning) */}
      <motion.button
        onClick={onQuickActionClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center justify-center rounded-lg bg-[#fbbf24] p-2.5 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-shadow hover:shadow-[0_0_25px_rgba(251,191,36,0.5)]"
      >
        <Zap className="h-4 w-4 text-[#0a0e1a]" fill="currentColor" />
      </motion.button>
    </div>
  );
}
