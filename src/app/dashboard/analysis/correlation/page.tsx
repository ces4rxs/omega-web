"use client"

import { ProFeature } from "@/components/pro-feature"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CorrelationPage() {
  return (
    <ProFeature feature="Correlation Analysis">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Correlation Analysis</h1>
          <p className="text-gray-400">
            Analyze correlations between multiple assets and strategies
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Correlation Matrix</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Understand relationships between different assets and optimize portfolio diversification.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProFeature>
  )
}
