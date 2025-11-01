"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import axios from "axios";
import { motion } from "framer-motion";

/**
 * 🌍 Panel Educativo de Mercado OMEGA v3.1
 * (Totalmente compatible con Render, sin IPs locales)
 */
function MarketPanel() {
  const [data, setData] = useState<any>(null);
  const [previousData, setPreviousData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        // ⚡ Siempre usa el backend Render (sin local)
        const base = "https://backtester-pro-1.onrender.com";
        const res = await axios.get(`${base}/ai/markets/live`);
        if (data) setPreviousData(data);
        setData(res.data.data);
      } catch (err: any) {
        console.error("❌ Error cargando mercado:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarket();
    const interval = setInterval(fetchMarket, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <p className="text-slate-400 mt-6">Cargando mercado...</p>;
  }

  const assets = [
    { key: "BTCUSD", label: "Bitcoin (BTC/USD)", unit: "USD", color: "text-yellow-400" },
    { key: "XAUUSD", label: "Oro (XAU/USD)", unit: "USD/oz", color: "text-amber-400" },
    { key: "XAGUSD", label: "Plata (XAG/USD)", unit: "USD/oz", color: "text-gray-300" },
    { key: "WTIUSD", label: "Petróleo (WTI/USD)", unit: "USD/barril", color: "text-orange-400" },
    { key: "SP500", label: "S&P 500", unit: "Pts", color: "text-cyan-400" },
  ];

  const getChangeIndicator = (symbol: string) => {
    const current = data?.[symbol]?.price;
    const prev = previousData?.[symbol]?.price;
    if (!prev || !current) return null;
    if (current > prev) return <span className="text-green-400">▲</span>;
    if (current < prev) return <span className="text-red-400">▼</span>;
    return <span className="text-slate-400">—</span>;
  };

  return (
    <section className="mt-10 bg-slate-800/50 p-6 rounded-2xl border border-sky-500/20 shadow-lg">
      <h2 className="text-2xl font-semibold text-sky-300 mb-6 flex items-center gap-2">
        🌐 Mercado Global — <span className="text-sky-400">Módulo Educativo</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((a) => {
          const asset = data?.[a.key];
          return (
            <motion.div
              key={a.key}
              className="bg-slate-900/80 border border-sky-500/10 rounded-xl p-4 hover:border-sky-400/40 transition-all duration-300"
              whileHover={{ scale: 1.03 }}
            >
              <h3 className={`text-lg font-semibold ${a.color}`}>{a.label}</h3>
              <p className="text-3xl font-bold text-cyan-400 mt-1 flex items-center gap-2">
                {asset?.price ? asset.price.toLocaleString() : "—"}{" "}
                <span className="text-sm text-slate-400">{a.unit}</span>
                {getChangeIndicator(a.key)}
              </p>
              <p className="text-sm text-slate-400 mt-1">Fuente: {asset?.source || "—"}</p>
              {asset?.error && (
                <p className="text-xs text-red-400 mt-1">⚠ {asset.error}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-slate-500">
          Última actualización:{" "}
          {new Date().toLocaleTimeString("es-CO", { hour12: false })}
        </p>
        <p className="text-xs text-amber-400 mt-1">
          ⚠️ Datos de mercado con fines educativos y de simulación.
        </p>
      </div>
    </section>
  );
}

/**
 * 🧠 Página principal del Dashboard OMEGA Web
 */
export default function Home() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get("/ai/manifest")
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <main className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-3xl font-bold text-sky-400">OMEGA Web Dashboard</h1>
      <p className="text-slate-400 mt-2">
        Conectado al servidor IA (Render Cloud)
      </p>

      {error && <p className="mt-6 text-red-400">Error: {error}</p>}

      {data ? (
        <pre className="mt-6 bg-slate-800 p-4 rounded-lg overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : !error ? (
        <p className="mt-6 text-slate-500">Cargando manifest...</p>
      ) : null}

      {/* 🌐 Panel educativo de mercado */}
      <MarketPanel />
    </main>
  );
}
