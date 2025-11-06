"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function StrategiesPage() {
  const router = useRouter();
  const [strategies, setStrategies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // ⚙️ Cargar estrategias del usuario
  useEffect(() => {
    let active = true;
    api
      .get("/api/strategies/mine")
      .then((res) => {
        if (!active) return;
        setStrategies(res.data?.strategies || []);
      })
      .catch((err) => {
        console.error("Error cargando estrategias:", err);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  // 🧠 Crear estrategia demo (modo seguro)
  const handleCreateStrategy = async () => {
    setCreating(true);
    try {
      const res = await api.post("/api/strategies", {
        name: "Estrategia Demo",
        symbol: "BTCUSD",
        timeframe: "1h",
        parameters: { ma: 20, stopLoss: 0.05 },
        riskProfile: "medium",
      });

      if (res.data?.ok && res.data?.strategy) {
        setStrategies((prev) => [res.data.strategy, ...prev]);
      } else {
        console.warn("Respuesta inesperada del servidor:", res.data);
      }
    } catch (error) {
      console.error("Error creando estrategia:", error);
      alert("❌ No se pudo crear la estrategia");
    } finally {
      setCreating(false);
    }
  };

  // 🚀 Redirigir automáticamente al panel unificado (puedes desactivar esto si quieres mantener la vista)
  useEffect(() => {
    // Comentá esta línea si querés mantener esta página accesible
    router.push("/dashboard");
  }, [router]);

  return (
    <main className="p-6 space-y-6 text-white">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">📊 Mis Estrategias</h1>
        <button
          onClick={handleCreateStrategy}
          disabled={creating}
          className={`px-4 py-2 rounded-lg transition ${
            creating
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {creating ? "Creando..." : "➕ Crear Estrategia Demo"}
        </button>
      </div>

      {loading && <p className="text-gray-400">Cargando estrategias...</p>}

      {!loading && strategies.length === 0 && (
        <p className="text-gray-500">No tienes estrategias aún.</p>
      )}

      <ul className="space-y-3">
        {strategies.map((s) => (
          <li
            key={s.id}
            className="bg-neutral-800/70 p-4 rounded-lg flex justify-between items-center border border-neutral-700 hover:bg-neutral-800 transition"
          >
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-gray-400">
                {s.symbol} · {s.timeframe}
              </p>
            </div>
            <span className="text-sm text-cyan-400 font-medium">
              {s.riskProfile?.toUpperCase?.() || "MEDIUM"}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
