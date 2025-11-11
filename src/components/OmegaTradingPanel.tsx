"use client"

import { useMemo } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const mockData = [
  { timestamp: "09:30", equity: 100000 },
  { timestamp: "10:00", equity: 100850 },
  { timestamp: "10:30", equity: 101200 },
  { timestamp: "11:00", equity: 100900 },
  { timestamp: "11:30", equity: 102450 },
  { timestamp: "12:00", equity: 103120 },
  { timestamp: "12:30", equity: 104000 },
  { timestamp: "13:00", equity: 103400 },
  { timestamp: "13:30", equity: 105500 },
  { timestamp: "14:00", equity: 106200 },
  { timestamp: "14:30", equity: 107800 },
  { timestamp: "15:00", equity: 108450 },
]

export const OmegaTradingPanel = () => {
  const summary = useMemo(
    () =>
      ({
        cagr: "18.4%",
        sharpe: "2.11",
        volatility: "7.5%",
        drawdown: "-3.2%",
      } as const),
    [],
  )

  const summaryLabels = useMemo(
    () =>
      ({
        cagr: "CAGR",
        sharpe: "Sharpe Ratio",
        volatility: "Volatility",
        drawdown: "Max Drawdown",
      } as const),
    [],
  )

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
      <Card className="border-dark-border bg-dark-bg-secondary/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-xl text-amber-300">Omega Quant Master Equity Curve</CardTitle>
              <p className="text-sm text-dark-text-secondary">
                Streaming equity performance powered by /api/ai/master-analysis
              </p>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-sm text-dark-text-secondary">
                  View config
                </TooltipTrigger>
                <TooltipContent className="bg-dark-bg-secondary text-dark-text">
                  Strategy: Quantum Neural Spread · Risk: Adaptive VAR 0.95
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="6" />
              <XAxis dataKey="timestamp" stroke="#94a3b8" tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <RechartsTooltip
                contentStyle={{
                  background: "#020617",
                  border: "1px solid rgba(250, 204, 21, 0.3)",
                  borderRadius: "12px",
                  color: "#f8fafc",
                }}
                formatter={(value: number) => `$${value.toLocaleString()}`}
              />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="#22d3ee"
                fill="url(#equityGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {(
          Object.entries(summary) as Array<[
            keyof typeof summary,
            (typeof summary)[keyof typeof summary],
          ]>
        ).map(([key, value]) => (
          <Card
            key={key}
            className="border-dark-border bg-gradient-to-br from-dark-bg-secondary via-dark-bg to-dark-bg"
          >
            <CardHeader>
              <CardTitle className="text-sm font-medium text-dark-text-secondary">
                {summaryLabels[key]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn("text-3xl font-semibold", key === "drawdown" ? "text-red-400" : "text-cyan-300")}> 
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
