"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion, MotionProps } from "framer-motion";

interface AuthButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof MotionProps> {
  children: ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export function AuthButton({
  children,
  variant = "primary",
  loading = false,
  className,
  disabled,
  ...props
}: AuthButtonProps) {
  const baseClasses = "w-full rounded-lg px-6 py-3 font-semibold transition-all duration-300";

  const variantClasses = {
    primary: "bg-gradient-to-r from-[#00d4ff] to-[#0099cc] text-white shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)]",
    secondary: "border border-[#00d4ff]/50 bg-[#00d4ff]/10 text-[#00d4ff] hover:bg-[#00d4ff]/20",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          <span>Cargando...</span>
        </div>
      ) : (
        children
      )}
    </motion.button>
  );
}
