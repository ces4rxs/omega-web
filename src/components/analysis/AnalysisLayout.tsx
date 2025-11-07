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
    <div
      className="relative flex min-h-screen flex-col overflow-hidden bg-[#0a0e1a]"
      style={{ minWidth: "1280px" }}
    >
      <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full bg-[#00d4ff]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-[#f59e0b]/10 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,212,255,0.08),transparent_55%)]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-[#1f2937] bg-[#111827]/90 px-6 py-4 backdrop-blur">
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
      <main className="relative z-10 flex-1 p-6">{children}</main>

      {/* Toolbar Footer */}
      <div className="relative z-10">
        <Toolbar />
      </div>
    </div>
  );
}
