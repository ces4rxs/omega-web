"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api"
import { OmegaCard } from "@/components/omega-ui/OmegaCard"
import { OmegaHeader } from "@/components/omega-ui/OmegaHeader"
import { OmegaSkeleton } from "@/components/omega-ui/OmegaSkeleton"
import { OmegaBadge } from "@/components/omega-ui/OmegaBadge"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { BarChart2, TrendingUp, TrendingDown, Clock, Activity } from "lucide-react"

interface BacktestResult {
  id: string
  strategyName: string
  symbol: string
  timeframe: string
  startedAt: string
  endedAt: string
  netReturn: number
  status: "COMPLETED" | "FAILED" | "RUNNING"
  totalTrades?: number
  sharpeRatio?: number
}

export default function HistoryPage() {
  const [backtests, setBacktests] = useState<BacktestResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBacktests = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Try multiple possible endpoints
        let data: BacktestResult[] = []
        try {
          data = await api.get<BacktestResult[]>("/api/backtests")
        } catch (err) {
          // Fallback to alternative endpoints
          try {
            data = await api.get<BacktestResult[]>("/backtests")
          } catch {
            data = await api.get<BacktestResult[]>("/api/history/backtests")
          }
        }

        setBacktests(data)
      } catch (err: any) {
        console.error("Failed to fetch backtests:", err)
        setError(err?.message || "Failed to load backtest history")
        setBacktests([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchBacktests()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <OmegaBadge variant="success">COMPLETE</OmegaBadge>
      case "RUNNING":
        return <OmegaBadge variant="warning">RUNNING</OmegaBadge>
      case "FAILED":
        return <OmegaBadge variant="danger">FAILED</OmegaBadge>
      default:
        return <OmegaBadge variant="outline">{status}</OmegaBadge>
    }
  }

  return (
    <DashboardShell>
      <div className="p-6 space-y-6">
        <OmegaHeader
          title="BACKTEST HISTORY"
          subtitle="Historical backtest executions and performance analysis"
        />

        <OmegaCard title="Execution History" glow="blue">
          {isLoading ? (
            <div className="space-y-3">
              <OmegaSkeleton className="h-16 w-full" />
              <OmegaSkeleton className="h-16 w-full delay-75" />
              <OmegaSkeleton className="h-16 w-full delay-150" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-red-400 mb-4" />
              <p className="text-sm text-red-400 font-mono">{error}</p>
              <p className="text-xs text-gray-500 mt-2">Check console for details</p>
            </div>
          ) : backtests.length === 0 ? (
            <div className="text-center py-12">
              <BarChart2 className="w-12 h-12 mx-auto text-gray-600 mb-4" />
              <p className="text-sm text-gray-500 font-mono">No backtests found</p>
              <p className="text-xs text-gray-600 mt-2">
                Run your first backtest to see results here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="text-left py-3 px-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Strategy
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Symbol
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Timeframe
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Return
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-mono text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {backtests.map((bt) => (
                    <tr
                      key={bt.id}
                      className="border-b border-gray-800/30 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-white font-mono">
                          {bt.strategyName}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-cyan-400 font-mono font-bold">
                          {bt.symbol}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-400 font-mono">
                          {bt.timeframe}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
                          <Clock className="w-3 h-3" />
                          {formatDate(bt.startedAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {bt.netReturn >= 0 ? (
                            <TrendingUp className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          )}
                          <span
                            className={`text-sm font-bold font-mono ${bt.netReturn >= 0 ? "text-emerald-400" : "text-red-400"
                              }`}
                          >
                            {bt.netReturn >= 0 ? "+" : ""}
                            {bt.netReturn.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(bt.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </OmegaCard>
      </div>
    </DashboardShell>
  )
}
