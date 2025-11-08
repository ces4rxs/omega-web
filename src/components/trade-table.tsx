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

interface TradeTableProps {
  trades: Trade[]
  maxRows?: number
}

export function TradeTable({ trades, maxRows = 10 }: TradeTableProps) {
  const displayTrades = maxRows ? trades.slice(0, maxRows) : trades

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatPercent = (value: number) => {
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
                displayTrades.map((trade) => (
                  <TableRow key={trade.id}>
                    <TableCell className="font-medium">{trade.symbol}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                        trade.side === 'long'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.side === 'long' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {trade.side.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {formatDate(trade.entryDate)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {formatDate(trade.exitDate)}
                    </TableCell>
                    <TableCell>{trade.quantity}</TableCell>
                    <TableCell>{formatCurrency(trade.entryPrice)}</TableCell>
                    <TableCell>{formatCurrency(trade.exitPrice)}</TableCell>
                    <TableCell className={`text-right font-semibold ${
                      trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatCurrency(trade.pnl)}
                    </TableCell>
                    <TableCell className={`text-right font-semibold ${
                      trade.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPercent(trade.pnlPercent)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {trades.length > maxRows && (
          <div className="mt-4 text-center text-sm text-gray-400">
            Showing {maxRows} of {trades.length} trades
          </div>
        )}
      </CardContent>
    </Card>
  )
}
