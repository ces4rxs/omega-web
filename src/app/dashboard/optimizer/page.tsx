"use client"

import { ProFeature } from "@/components/pro-feature"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"

export default function OptimizerPage() {
  return (
    <ProFeature feature="Strategy Optimizer">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Strategy Optimizer</h1>
          <p className="text-gray-400">
            Find optimal parameters for your trading strategies
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Configuration</CardTitle>
            <CardDescription>
              Grid search or genetic algorithm optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Strategy</Label>
                <Select>
                  <option>SMA Crossover</option>
                  <option>RSI Mean Revert</option>
                  <option>Trend Following</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Optimization Metric</Label>
                <Select>
                  <option>Sharpe Ratio</option>
                  <option>Total Return</option>
                  <option>Profit Factor</option>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Symbol</Label>
                <Input placeholder="AAPL" />
              </div>

              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select>
                  <option value="1d">1 Day</option>
                  <option value="1h">1 Hour</option>
                  <option value="15min">15 Minutes</option>
                </Select>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Run Optimization
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Optimization Results</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-400 text-center py-8">
              Run an optimization to see results
            </p>
          </CardContent>
        </Card>
      </div>
    </ProFeature>
  )
}
