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

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="absolute z-30 max-w-[280px]"
      style={{ top: data.position.top, left: data.position.left }}
    >
      <div
        className="flex items-start gap-3 rounded-lg border border-[#00d4ff]/70 bg-[#1a1f2e]/95 p-3 backdrop-blur-md"
        style={{ backdropFilter: "blur(10px)" }}
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-[#00d4ff] bg-[#00d4ff]/20">
          <Info className="h-3.5 w-3.5 text-[#00d4ff]" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="text-xs font-medium leading-snug text-[#f9fafb]">
            {data.text}
          </p>
          {data.confidence && (
            <p className="text-[10px] font-medium text-[#00d4ff]">
              {data.confidence}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
