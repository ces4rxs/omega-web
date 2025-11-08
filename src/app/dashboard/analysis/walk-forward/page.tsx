"use client"

import { ProFeature } from "@/components/pro-feature"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function WalkForwardPage() {
  return (
    <ProFeature feature="Walk-Forward Analysis">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Walk-Forward Analysis</h1>
          <p className="text-gray-400">
            Test strategy robustness with rolling window optimization
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Walk-Forward Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400">
              Walk-forward analysis splits your data into in-sample and out-of-sample periods
              to test strategy stability over time.
            </p>
          </CardContent>
        </Card>
      </div>
    </ProFeature>
  )
}
