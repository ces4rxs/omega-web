"use client";

import { motion } from "framer-motion";
import { Info } from "lucide-react";

export interface AITooltipData {
  id: string;
  text: string;
  confidence?: string;
  position: {
    top: string;
    left: string;
  };
  type?: "bearish" | "bullish";
}

interface AITooltipProps {
  data: AITooltipData;
}

export function AITooltip({ data }: AITooltipProps) {
  const isBearish = data.type === "bearish";
  const accentColor = isBearish ? "#ef4444" : "#10b981";
  const accentGlow = isBearish ? "rgba(239, 68, 68, 0.35)" : "rgba(16, 185, 129, 0.35)";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="absolute z-30 max-w-[280px]"
      style={{ top: data.position.top, left: data.position.left }}
    >
      <div className="relative">
        <div
          className="flex items-start gap-3 rounded-xl border bg-[#111622]/95 p-3 backdrop-blur-md shadow-lg"
          style={{
            borderColor: accentColor,
            boxShadow: `0 10px 30px ${accentGlow}`,
            backdropFilter: "blur(10px)",
          }}
        >
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border"
            style={{ borderColor: accentColor, background: `${accentColor}1A` }}
          >
            <Info className="h-3.5 w-3.5" style={{ color: accentColor }} />
          </div>
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold leading-snug text-[#f9fafb]">
              {data.text}
            </p>
            {data.confidence && (
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#00d4ff]">
                {data.confidence}
              </p>
            )}
          </div>
        </div>

        <span
          className="absolute left-6 top-full mt-1 block h-2 w-2 rotate-45"
          style={{ background: accentColor }}
        />
      </div>
    </motion.div>
  );
}
