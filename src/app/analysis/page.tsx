// src/app/analysis/page.tsx
"use client";

import { useAIEvents } from "@/hooks/useAIEvents";
import OptimizerOverlay from "@/components/OptimizerOverlay";
// importa tu chart y resto de UI…

export default function AnalysisPage() {
  const { optimizerEvt, clear } = useAIEvents();

  const handleRunOptimizer = async (evt: any) => {
    // 👇 por ahora SOLO frontend; luego conectamos a /ai/optimizer/run
    console.log("Ejecutar optimizador con:", evt);
    // aquí luego: await api.post("/ai/optimizer/run", {...});
    // y refrescar series del chart
    clear();
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)]">
      {/* <-- TU CHART AQUÍ (lightweight-charts, etc.) --> */}

      {/* botón flotante: aparece solo si hay evento */}
      <OptimizerOverlay event={optimizerEvt} onRun={handleRunOptimizer} onClose={clear} />
    </div>
  );
}
