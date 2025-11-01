"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Cargar estrategias del usuario
  useEffect(() => {
    api
      .get("/api/strategies/mine")
      .then((res) => {
        setStrategies(res.data.strategies || []);
      })
      .catch((err) => {
        console.error("Error cargando estrategias", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Crear estrategia demo
  const handleCreateStrategy = async () => {
    setCreating(true);
    try {
      // 👇 AQUÍ el cambio importante (ya no usamos /create)
      const res = await api.post("/api/strategies", {
        name: "Estrategia Demo",
        symbol: "BTCUSD",
        timeframe: "1h",
        parameters: { ma: 20, stopLoss: 0.05 },
        riskProfile: "medium",
      });

      if (res.data?.ok) {
        // Agregar la nueva estrategia al estado
        setStrategies((prev) => [res.data.strategy, ...prev]);
      }
    } catch (error) {
      console.error("Error creando estrategia:", error);
      alert("❌ No se pudo crear la estrategia");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📊 Mis Estrategias</h1>
        <button
          onClick={handleCreateStrategy}
          disabled={creating}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
        >
          {creating ? "Creando..." : "➕ Crear Estrategia Demo"}
        </button>
      </div>

      {loading && <p>Cargando...</p>}

      {!loading && strategies.length === 0 && (
        <p className="text-gray-400">No tienes estrategias aún.</p>
      )}

      <ul className="space-y-3">
        {strategies.map((s) => (
          <li
            key={s.id}
            className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-gray-400">
                {s.symbol} · {s.timeframe}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
