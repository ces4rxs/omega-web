"use client";

import { motion } from "framer-motion";

interface AIModeBadgeProps {
  isActivated?: boolean;
}

export function AIModeBadge({ isActivated = true }: AIModeBadgeProps) {
  if (!isActivated) return null;

  return (
    <motion.div
      className="absolute left-4 top-4 z-40 rounded-md border border-[#10b981] bg-[#10b981]/10 px-4 py-2 backdrop-blur-sm"
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(16, 185, 129, 0)",
          "0 0 0 10px rgba(16, 185, 129, 0.3)",
          "0 0 0 0 rgba(16, 185, 129, 0)",
        ],
      }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="text-sm font-semibold text-[#10b981]">
        AI Mode: ACTIVATED
      </span>
    </motion.div>
  );
}
