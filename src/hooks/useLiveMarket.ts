// src/hooks/useLiveMarket.ts
import useSWR from "swr";
import { fetchLiveMarket, type LiveSnapshot } from "@/lib/marketData";

export function useLiveMarket() {
  const { data, error, isValidating, mutate } = useSWR<LiveSnapshot>(
    "live-market-v1",
    fetchLiveMarket,
    { refreshInterval: 60_000, revalidateOnFocus: true }
  );

  return {
    market: data,
    loading: !data && !error,
    error,
    refreshing: isValidating,
    refresh: () => mutate(),
    lastUpdated: data?.ts ? new Date(data.ts) : null,
  };
}
