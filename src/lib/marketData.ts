// src/lib/marketData.ts
import { api } from "@/lib/api";

export type LiveSnapshot = {
  BTCUSD?: { price: number|null; source: string|null };
  ETHUSD?: { price: number|null; source: string|null };
  XAUUSD?: { price: number|null; source: string|null };
  ts: string;
};

export async function fetchLiveMarket(): Promise<LiveSnapshot> {
  const data = await api.get<{ ok: boolean; data: LiveSnapshot }>("/ai/market/external-live");
  if (!data?.ok) throw new Error("Fuente externa no disponible");
  return data.data as LiveSnapshot;
}
