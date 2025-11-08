// src/lib/strategies.ts
import { api } from "./api";

export async function createStrategy(strategy: {
  name: string;
  symbol: string;
  timeframe: string;
  parameters?: Record<string, any>;
  riskProfile?: string;
}) {
  const data = await api.post("/api/strategies/create", strategy);
  return data;
}
