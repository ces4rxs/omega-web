"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { colors } from "@/styles/theme";

export default function Topbar({ user }: { user: any }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between border-b px-6 py-4 backdrop-blur-md"
      style={{
        backgroundColor: `${colors.bgCard}99`, // 60% opacity
        borderColor: colors.borderPrimary
      }}
    >
      <h2 className="text-xl font-semibold tracking-wide" style={{ color: colors.cyanPrimary }}>
        Panel de Control
      </h2>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm" style={{ color: colors.textSecondary }}>
          <User size={16} style={{ color: colors.cyanPrimary }} />
          <span>{user?.email ?? "Usuario"}</span>
        </div>
      </div>
    </motion.header>
  );
}
