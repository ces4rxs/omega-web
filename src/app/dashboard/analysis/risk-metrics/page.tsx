"use client"

import { ProFeature } from "@/components/pro-feature"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RiskMetricsPage() {
  return (
    <ProFeature feature="Risk Metrics">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Advanced Risk Metrics</h1>
          <p className="text-gray-400">
            Analyze VaR, CVaR, Sortino, and other advanced risk metrics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Risk Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Comprehensive risk analysis including Value at Risk (VaR), Conditional VaR,
              Sortino Ratio, Calmar Ratio, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProFeature>
  )
}
