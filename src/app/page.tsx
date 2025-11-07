"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import axios from "axios";
import { motion } from "framer-motion";
import { colors } from "@/styles/theme";

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
    return <p style={{ color: colors.textSecondary }} className="mt-6">Cargando mercado...</p>;
  }

  const assets = [
    { key: "BTCUSD", label: "Bitcoin (BTC/USD)", unit: "USD", color: colors.yellowAccent },
    { key: "XAUUSD", label: "Oro (XAU/USD)", unit: "USD/oz", color: colors.yellowAccent },
    { key: "XAGUSD", label: "Plata (XAG/USD)", unit: "USD/oz", color: colors.textPrimary },
    { key: "WTIUSD", label: "Petróleo (WTI/USD)", unit: "USD/barril", color: colors.goldDark },
    { key: "SP500", label: "S&P 500", unit: "Pts", color: colors.cyanPrimary },
  ];

  const getChangeIndicator = (symbol: string) => {
    const current = data?.[symbol]?.price;
    const prev = previousData?.[symbol]?.price;
    if (!prev || !current) return null;
    if (current > prev) return <span style={{ color: colors.greenBullish }}>▲</span>;
    if (current < prev) return <span style={{ color: colors.redBearish }}>▼</span>;
    return <span style={{ color: colors.textSecondary }}>—</span>;
  };

  return (
    <section className="mt-10 p-6 rounded-2xl border shadow-lg" style={{
      backgroundColor: `${colors.bgSecondary}80`,
      borderColor: colors.borderPrimary
    }}>
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2" style={{ color: colors.cyanPrimary }}>
        🌐 Mercado Global — <span>Módulo Educativo</span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((a) => {
          const asset = data?.[a.key];
          return (
            <motion.div
              key={a.key}
              className="rounded-xl p-4 border transition-all duration-300"
              style={{
                backgroundColor: `${colors.bgCard}cc`,
                borderColor: `${colors.borderPrimary}40`
              }}
              whileHover={{
                scale: 1.03,
                borderColor: colors.borderPrimary
              }}
            >
              <h3 className="text-lg font-semibold" style={{ color: a.color }}>{a.label}</h3>
              <p className="text-3xl font-bold mt-1 flex items-center gap-2" style={{ color: colors.cyanPrimary }}>
                {asset?.price ? asset.price.toLocaleString() : "—"}{" "}
                <span className="text-sm" style={{ color: colors.textSecondary }}>{a.unit}</span>
                {getChangeIndicator(a.key)}
              </p>
              <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Fuente: {asset?.source || "—"}</p>
              {asset?.error && (
                <p className="text-xs mt-1" style={{ color: colors.redBearish }}>⚠ {asset.error}</p>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs" style={{ color: colors.textMuted }}>
          Última actualización:{" "}
          {new Date().toLocaleTimeString("es-CO", { hour12: false })}
        </p>
        <p className="text-xs mt-1" style={{ color: colors.yellowAccent }}>
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
    <main className="min-h-screen text-white p-8" style={{ backgroundColor: colors.bgPrimary }}>
      <h1 className="text-3xl font-bold" style={{ color: colors.cyanPrimary }}>OMEGA Web Dashboard</h1>
      <p className="mt-2" style={{ color: colors.textSecondary }}>
        Conectado al servidor IA (Render Cloud)
      </p>

      {error && <p className="mt-6" style={{ color: colors.redBearish }}>Error: {error}</p>}

      {data ? (
        <pre className="mt-6 p-4 rounded-lg overflow-auto" style={{ backgroundColor: colors.bgSecondary }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : !error ? (
        <p className="mt-6" style={{ color: colors.textMuted }}>Cargando manifest...</p>
      ) : null}

      {/* 🌐 Panel educativo de mercado */}
      <MarketPanel />
    </main>
  );
}
