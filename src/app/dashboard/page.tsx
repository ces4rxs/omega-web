import { Metadata } from "next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { OmegaTradingPanel } from "@/components/OmegaTradingPanel"

export const metadata: Metadata = {
  title: "Dashboard | Omega Quantum Web",
}

const performanceMetrics = [
  { label: "PNL Diario", value: "+$8,420", trend: "+3.1%" },
  { label: "Exposición Neta", value: "42%", trend: "Neutral" },
  { label: "Riesgo Máx", value: "1.8 VAR", trend: "Controlado" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Omega Command Dashboard</h1>
          <p className="text-sm text-dark-text-secondary">
            Controla despliegues en Render y lanza análisis maestros conectados al backend Omega v6.2.
          </p>
        </div>
        <Button size="lg" className="bg-amber-400 text-black hover:bg-amber-300">
          Run Backtest
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {performanceMetrics.map((metric) => (
          <Card key={metric.label} className="border-dark-border bg-dark-bg-secondary/70">
            <CardHeader>
              <CardTitle className="text-sm text-dark-text-secondary">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-white">{metric.value}</p>
              <p className="text-xs text-amber-300">{metric.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <OmegaTradingPanel />
    </div>
  )
}
