"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ReturnsDistributionProps {
  trades: Array<{ pnl: number }>
}

export function ReturnsDistribution({ trades }: ReturnsDistributionProps) {
  // Calculate distribution buckets
  const buckets = calculateDistribution(trades)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución de Retornos</CardTitle>
        <CardDescription>Frecuencia de ganancias y pérdidas por trade</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={buckets}>
            <XAxis
              dataKey="range"
              stroke="#666"
              fontSize={12}
              tickLine={false}
            />
            <YAxis
              stroke="#666"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255, 255, 255, 0.1)" }}
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.9)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                backdropFilter: "blur(10px)",
              }}
              labelStyle={{ color: "#fff" }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {buckets.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.value < 0 ? "#ef4444" : "#10b981"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function calculateDistribution(trades: Array<{ pnl: number }>) {
  if (!trades || trades.length === 0) return []

  const pnls = trades.map((t) => t.pnl)
  const min = Math.min(...pnls)
  const max = Math.max(...pnls)
  const bucketCount = 10
  const bucketSize = (max - min) / bucketCount

  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const start = min + i * bucketSize
    const end = start + bucketSize
    const count = pnls.filter((p) => p >= start && p < end).length
    return {
      range: `${start.toFixed(0)} - ${end.toFixed(0)}`,
      count,
      value: (start + end) / 2,
    }
  })

  return buckets
}
