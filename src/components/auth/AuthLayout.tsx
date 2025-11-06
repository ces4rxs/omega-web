"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { colors } from "@/styles/theme";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ backgroundColor: colors.bgPrimary }}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00d4ff]/10 via-transparent to-[#fbbf24]/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.1)_0%,transparent_70%)] animate-pulse" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(${colors.cyanPrimary}20 1px, transparent 1px), linear-gradient(90deg, ${colors.cyanPrimary}20 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-[#00d4ff]/20 bg-[#1a1f2e]/90 p-8 shadow-2xl backdrop-blur-xl"
      >
        {/* Logo */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#00d4ff] to-[#0099cc] shadow-[0_0_30px_rgba(0,212,255,0.4)]">
            <span className="text-3xl font-bold text-white">₿</span>
          </div>
        </div>

        {/* Title */}
        <h1 className="mb-2 text-center text-3xl font-bold text-[#f9fafb]">{title}</h1>

        {subtitle && (
          <p className="mb-8 text-center text-sm text-[#9ca3af]">
            {subtitle}
          </p>
        )}

        {/* Content */}
        {children}
      </motion.div>

      {/* Footer */}
      <div className="absolute bottom-6 text-center text-xs text-[#9ca3af]">
        <p>© 2024 OMEGA Web. Powered by AI</p>
      </div>
    </main>
  );
}
