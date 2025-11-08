"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  formatAsPercent?: boolean
  formatAsCurrency?: boolean
  icon?: React.ReactNode
}

export function MetricCard({
  title,
  value,
  subtitle,
  trend,
  formatAsPercent = false,
  formatAsCurrency = false,
  icon
}: MetricCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val

    // Manejar valores undefined, null o NaN
    if (val === undefined || val === null || isNaN(Number(val))) {
      return 'N/A'
    }

    const numVal = Number(val)

    if (formatAsCurrency) {
      return `$${numVal.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
    }

    if (formatAsPercent) {
      return `${(numVal * 100).toFixed(2)}%`
    }

    return numVal.toLocaleString('en-US', { maximumFractionDigits: 2 })
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend === 'up') return 'text-green-400'
    if (trend === 'down') return 'text-red-400'
    return 'text-gray-400'
  }

  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return null
    if (trend === 'up') return <ArrowUpRight className="w-5 h-5 text-green-400" />
    if (trend === 'down') return <ArrowDownRight className="w-5 h-5 text-red-400" />
  }

  return (
    <Card className="hover:border-blue-400/40 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">
          {title}
        </CardTitle>
        {icon && <div className="text-gray-400">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className={`text-2xl font-bold ${getTrendColor()}`}>
              {formatValue(value)}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          {getTrendIcon()}
        </div>
      </CardContent>
    </Card>
  )
}
