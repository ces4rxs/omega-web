// src/hooks/useAIEvents.ts
import { useEffect, useRef, useState } from "react";

export type OptimizerTrigger = {
  symbol: string;
  module: string;           // ej: "optimizer_v5"
  range: [number, number];  // ej: [78000, 81000]
  confidence: number;       // 0..1
  ts: number;
};

export function useAIEvents() {
  const [optimizerEvt, setOptimizerEvt] = useState<OptimizerTrigger | null>(null);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL ?? ""; // ej: https://backtester-pro-1.onrender.com
    const url  = `${base}/ai/events`;

    try {
      const es = new EventSource(url);
      esRef.current = es;

      es.addEventListener("optimizer_trigger", (e) => {
        try {
          const payload = JSON.parse((e as MessageEvent).data);
          setOptimizerEvt(payload);
        } catch {/* ignore */}
      });

      es.addEventListener("ping", () => {/* keep-alive */});

      es.onerror = () => {
        // cierra y deja el hook “silencioso” hasta que conectemos backend
        es.close();
      };

      return () => es.close();
    } catch {
      // si EventSource falla (sin backend), no hacemos nada
      return;
    }
  }, []);

  return { optimizerEvt, clear: () => setOptimizerEvt(null) };
}
