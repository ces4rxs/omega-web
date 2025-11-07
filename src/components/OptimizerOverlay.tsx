// src/components/OptimizerOverlay.tsx
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { OptimizerTrigger } from "@/hooks/useAIEvents";

type Props = {
  event: OptimizerTrigger | null;
  onRun: (evt: OptimizerTrigger) => void;
  onClose: () => void;
};

export default function OptimizerOverlay({ event, onRun, onClose }: Props) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="absolute left-1/2 -translate-x-1/2 top-6 z-40"
        >
          <div className="flex items-center gap-2 rounded-2xl px-4 py-2 shadow-[0_12px_40px_rgba(245,158,11,0.35)] bg-gradient-to-r from-amber-400 to-yellow-500 text-black border border-amber-300/50">
            <span className="text-lg">⚡</span>
            <div className="text-sm leading-tight">
              <div className="font-semibold">
                Optimizar rango {event.range[0].toLocaleString()}–{event.range[1].toLocaleString()} ({event.symbol})
              </div>
              <div className="opacity-80">
                {event.module} · Confianza {(event.confidence * 100).toFixed(0)}%
              </div>
            </div>

            <button
              onClick={() => onRun(event)}
              className="ml-3 px-3 py-1 rounded-lg bg-black/10 hover:bg-black/20 font-semibold"
            >
              Ejecutar
            </button>

            <button
              onClick={onClose}
              className="px-2 py-1 rounded-lg hover:bg-black/10"
              aria-label="Cerrar sugerencia"
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
