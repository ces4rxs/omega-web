"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { HeaderButtons } from "./HeaderButtons";
import { Toolbar } from "./Toolbar";

interface AnalysisLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AnalysisLayout({ children, title = "₿ Análisis" }: AnalysisLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0e1a]" style={{ minWidth: "1280px" }}>
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#9ca3af]/20 bg-[#141824] px-6 py-4">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-[#f9fafb]"
        >
          {title}
        </motion.h1>
        <HeaderButtons />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>

      {/* Toolbar Footer */}
      <Toolbar />
    </div>
  );
}
