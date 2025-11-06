"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";

export default function Topbar({ user }: { user: any }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between bg-slate-900/60 border-b border-sky-500/30 px-6 py-4 backdrop-blur-md"
    >
      <h2 className="text-xl font-semibold text-sky-400 tracking-wide">
        Panel de Control
      </h2>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-300 text-sm">
          <User size={16} className="text-sky-400" />
          <span>{user?.email ?? "Usuario"}</span>
        </div>
      </div>
    </motion.header>
  );
}
