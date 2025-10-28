"use client";
import { useEffect, useState } from "react";
import axios from "axios";

interface MarketData {
  [key: string]: {
    asset: string;
    lastPrice: number | null;
    source?: string;
    error?: string;
  };
}

export default function MarketPanel() {
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await axios.get("http://192.168.1.90:4000/market/latest");
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

  return (
    <section className="mt-10 bg-slate-800/50 p-6 rounded-2xl border border-sky-500/20">
      <h2 className="text-2xl font-semibold text-sky-300 mb-4">
        📊 Mercado Global — Módulo Educativo
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Object.values(data || {}).map((asset) => (
          <div
            key={asset.asset}
            className="bg-slate-900 border border-sky-500/20 rounded-xl p-4 hover:border-sky-400 transition"
          >
            <h3 className="text-lg font-medium text-sky-300">{asset.asset}</h3>
            <p className="text-3xl font-bold text-cyan-400 mt-1">
              {asset.lastPrice
                ? asset.lastPrice.toLocaleString()
                : "—"}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Fuente: {asset.source || "—"}
            </p>
            {asset.error && (
              <p className="text-xs text-red-400 mt-1">
                ⚠ {asset.error}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500 mt-3 text-center">
        Última actualización: {new Date().toLocaleTimeString("es-CO", { hour12: false })}  
      </p>
      <p className="text-xs text-amber-400 text-center mt-1">
        ⚠️ Datos de mercado con fines educativos y de simulación.
      </p>
    </section>
  );
}
