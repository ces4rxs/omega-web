"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Download } from "lucide-react"

export default function HistoryPage() {
  // Mock data - replace with actual API call
  const backtests = [
    {
      id: "bt_123",
      strategy: "SMA Crossover",
      symbol: "AAPL",
      date: "2024-01-15",
      return: 12.5,
      sharpe: 1.8,
      trades: 45
    },
    {
      id: "bt_124",
      strategy: "RSI Mean Revert",
      symbol: "TSLA",
      date: "2024-01-14",
      return: -3.2,
      sharpe: 0.9,
      trades: 32
    },
    {
      id: "bt_125",
      strategy: "Trend Following",
      symbol: "BTC",
      date: "2024-01-13",
      return: 18.7,
      sharpe: 2.1,
      trades: 28
    }
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Backtest History</h1>
        <p className="text-gray-400">
          View and manage your past backtests
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Backtests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Strategy</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Return</TableHead>
                <TableHead className="text-right">Sharpe</TableHead>
                <TableHead className="text-right">Trades</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backtests.map((bt) => (
                <TableRow key={bt.id}>
                  <TableCell className="font-mono text-xs">{bt.id}</TableCell>
                  <TableCell>{bt.strategy}</TableCell>
                  <TableCell>{bt.symbol}</TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(bt.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className={`text-right font-semibold ${
                    bt.return >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {bt.return >= 0 ? '+' : ''}{bt.return}%
                  </TableCell>
                  <TableCell className="text-right">{bt.sharpe.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{bt.trades}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
