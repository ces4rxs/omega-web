"use client";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

export default function NeuralPulse({ children, active }: PropsWithChildren<{ active?: boolean }>) {
  if (!active) return <>{children}</>;
  return (
    <motion.div
      initial={{ boxShadow: "0 0 0 0 rgba(0,255,200,0)" }}
      animate={{
        boxShadow: [
          "0 0 0 0 rgba(0,255,200,0)",
          "0 0 30px 4px rgba(0,255,200,0.25)",
          "0 0 0 0 rgba(0,255,200,0)"
        ]
      }}
      transition={{ duration: 2.5, repeat: Infinity }}
      className="rounded-xl"
    >
      {children}
    </motion.div>
  );
}
