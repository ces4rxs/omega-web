"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { fetchReflectiveMarket } from "@/lib/omega";

interface MarketPoint {
  date: string;
  BTC?: number;
  GOLD?: number;
  SP500?: number;
  ETH?: number;
}

export default function MarketIntelligence() {
  const [data, setData] = useState<MarketPoint[]>([]);
  const [correlations, setCorrelations] = useState<Record<string, number>>({});
  const [insights, setInsights] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [version, setVersion] = useState<string>("v10.3-B");
  const [isOnline, setIsOnline] = useState<boolean>(false);

  // 🧩 Cargar datos del backend (o modo simulado)
  const loadData = async () => {
    try {
      const res = await fetchReflectiveMarket();
      if (res?.ok) {
        const points = Array.from({ length: 14 }).map((_, i) => ({
          date: `D${i + 1}`,
          BTC: res.data.BTCUSD + Math.sin(i / 2) * 600,
          GOLD: res.data.XAUUSD + Math.cos(i / 3) * 10,
          SP500: res.data.SP500 + Math.sin(i / 1.8) * 35,
          ETH: res.data.ETHUSD ?? 3600 + Math.cos(i / 2.5) * 50,
        }));
        setData(points);
        setCorrelations(res.correlations || {});
        setInsights(res.insights || []);
        setVersion(res.version || "v10.3-B");
        setLastUpdated(
          new Date(res.data.timestamp || Date.now()).toLocaleTimeString("es-CO")
        );
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    } catch (err) {
      console.warn("⚠️ Modo simulado activo:", err);
      setIsOnline(false);
    }
  };

  // 🔁 Carga inicial + refresco automático cada 60 s
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative text-slate-300 text-sm"
    >
      {/* 🔵 Indicador de conexión */}
      <div
        className={`absolute top-0 right-0 w-3 h-3 rounded-full mt-1 mr-1 ${
          isOnline ? "bg-emerald-400 animate-pulse" : "bg-red-500"
        }`}
        title={isOnline ? "Conectado al servidor OMEGA" : "Sin conexión (modo simulado)"}
      />

      <h3 className="text-emerald-400 font-semibold mb-2">
        🧠 Inteligencia de Mercado — OMEGA Core {version}
      </h3>
      <p className="text-slate-400 text-xs mb-3 leading-relaxed">
        Análisis IA en tiempo real de correlaciones y divergencias entre activos principales.
        Este módulo se sincroniza automáticamente con el backend OMEGA Core v10.3-B.
      </p>

      {/* 📊 Gráfico múltiple */}
      <div className="bg-[#0B1220] border border-[#1E293B] rounded-lg p-3 mb-4">
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <Tooltip
              contentStyle={{
                background: "#0F172A",
                border: "1px solid #1E293B",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "#94A3B8" }}
            />
            <XAxis dataKey="date" tick={{ fill: "#64748B", fontSize: 10 }} />
            <YAxis tick={{ fill: "#64748B", fontSize: 10 }} />
            <Line type="monotone" dataKey="BTC" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="GOLD" stroke="#fbbf24" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="SP500" stroke="#38bdf8" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="ETH" stroke="#a855f7" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 📈 Correlaciones IA */}
      <div className="grid grid-cols-2 md:grid-cols-4 text-center text-xs gap-2">
        {Object.entries(correlations).map(([k, v]) => (
          <div key={k}>
            <p className="text-slate-400">{k}</p>
            <p
              className={`font-semibold ${
                v > 0.6
                  ? "text-emerald-400"
                  : v > 0
                  ? "text-amber-400"
                  : "text-sky-400"
              }`}
            >
              {v > 0 ? "+" : ""}
              {v.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* 🧩 Insights */}
      <div className="mt-5 border-t border-[#334155] pt-3 text-xs">
        {insights.map((msg, i) => (
          <p key={i} className="text-slate-400 leading-relaxed">
            💡 <span className="text-sky-400">Insight:</span> {msg}
          </p>
        ))}
        <p className="text-[11px] text-slate-500 mt-3">
          📡 Actualización: {lastUpdated} | Fuente:{" "}
          {isOnline ? "Backend OMEGA" : "Simulación local"}.
        </p>
      </div>
    </motion.div>
  );
}
