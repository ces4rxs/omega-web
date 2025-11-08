"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Trade } from "@/lib/types"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { SymbolLogo } from "@/components/symbol-logo"

interface TradeTableProps {
  trades: Trade[]
  maxRows?: number
}

export function TradeTable({ trades, maxRows = 10 }: TradeTableProps) {
  // Filtrar trades inválidos y limitar
  const validTrades = trades.filter(trade => trade && trade.id)
  const displayTrades = maxRows ? validTrades.slice(0, maxRows) : validTrades

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return 'N/A'
    }
  }

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A'
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercent = (value?: number) => {
    if (value === undefined || value === null || isNaN(value)) return 'N/A'
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value.toFixed(2)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Trade History
          <span className="text-sm font-normal text-gray-400 ml-2">
            ({displayTrades.length} of {trades.length} trades)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Side</TableHead>
                <TableHead>Entry</TableHead>
                <TableHead>Exit</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Entry Price</TableHead>
                <TableHead>Exit Price</TableHead>
                <TableHead className="text-right">P&L</TableHead>
                <TableHead className="text-right">Return</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-400">
                    No trades to display
                  </TableCell>
                </TableRow>
              ) : (
                displayTrades.map((trade, index) => {
                  const side = trade.side?.toLowerCase() || 'long'
                  const isLong = side === 'long'

                  return (
                    <TableRow key={trade.id || index}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {trade.symbol && trade.symbol !== 'N/A' && (
                            <SymbolLogo symbol={trade.symbol} size="sm" />
                          )}
                          <span className="font-medium">{trade.symbol || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                          isLong
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {isLong ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {side.toUpperCase()}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {formatDate(trade.entryDate)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {formatDate(trade.exitDate)}
                      </TableCell>
                      <TableCell>{trade.quantity ?? 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(trade.entryPrice)}</TableCell>
                      <TableCell>{formatCurrency(trade.exitPrice)}</TableCell>
                      <TableCell className={`text-right font-semibold ${
                        (trade.pnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatCurrency(trade.pnl)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${
                        (trade.pnlPercent ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {formatPercent(trade.pnlPercent)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {validTrades.length > maxRows && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {maxRows} of {validTrades.length} trades
          </div>
        )}
      </CardContent>
    </Card>
  )
}
