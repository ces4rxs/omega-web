"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { polygonService } from "@/lib/polygon"
import { SymbolLogo } from "@/components/symbol-logo"

interface WatchlistItem {
  symbol: string
  currentPrice: number | null
  change: number
  changePercent: number
  volume?: number
  lastUpdate: Date
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [newSymbol, setNewSymbol] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Cargar watchlist del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('watchlist')
    if (saved) {
      const symbols = JSON.parse(saved) as string[]
      loadWatchlistData(symbols)
    }
  }, [])

  // Guardar watchlist al localStorage
  const saveWatchlist = (symbols: string[]) => {
    localStorage.setItem('watchlist', JSON.stringify(symbols))
  }

  // Cargar datos de precios para símbolos
  const loadWatchlistData = async (symbols: string[]) => {
    setLoading(true)
    const items: WatchlistItem[] = []

    for (const symbol of symbols) {
      try {
        const price = await polygonService.getCurrentPrice(symbol)
        items.push({
          symbol,
          currentPrice: price,
          change: 0, // TODO: Calcular cambio real
          changePercent: 0,
          lastUpdate: new Date(),
        })
      } catch (error) {
        console.error(`Error loading ${symbol}:`, error)
        items.push({
          symbol,
          currentPrice: null,
          change: 0,
          changePercent: 0,
          lastUpdate: new Date(),
        })
      }
    }

    setWatchlist(items)
    setLoading(false)
  }

  const handleAddSymbol = () => {
    if (!newSymbol.trim()) return

    const symbol = newSymbol.trim().toUpperCase()

    if (watchlist.some((item) => item.symbol === symbol)) {
      alert('Este símbolo ya está en la watchlist')
      return
    }

    const newSymbols = [...watchlist.map((item) => item.symbol), symbol]
    saveWatchlist(newSymbols)
    loadWatchlistData(newSymbols)
    setNewSymbol('')
  }

  const handleRemoveSymbol = (symbol: string) => {
    const newSymbols = watchlist.filter((item) => item.symbol !== symbol).map((item) => item.symbol)
    saveWatchlist(newSymbols)
    setWatchlist((prev) => prev.filter((item) => item.symbol !== symbol))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadWatchlistData(watchlist.map((item) => item.symbol))
    setRefreshing(false)
  }

  // Auto-refresh cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (watchlist.length > 0) {
        loadWatchlistData(watchlist.map((item) => item.symbol))
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [watchlist])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Watchlist</h1>
          <p className="text-gray-400 mt-1">Monitorea múltiples símbolos en tiempo real</p>
        </div>
        <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>

      {/* Agregar símbolo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agregar Símbolo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Ej: AAPL, TSLA, BTCUSD..."
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSymbol()}
              className="flex-1"
            />
            <Button onClick={handleAddSymbol} disabled={!newSymbol.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de watchlist */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : watchlist.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Plus className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Tu watchlist está vacía</h3>
                <p className="text-gray-400">Agrega símbolos para comenzar a monitorear</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watchlist.map((item) => (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="relative overflow-hidden group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <SymbolLogo symbol={item.symbol} size="md" />
                      <CardTitle className="text-lg font-bold">{item.symbol}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSymbol(item.symbol)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Precio actual */}
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Precio Actual</p>
                      <p className="text-2xl font-bold text-white">
                        {item.currentPrice !== null
                          ? `$${item.currentPrice.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : 'N/A'}
                      </p>
                    </div>

                    {/* Cambio */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Cambio 24h</span>
                      <div
                        className={`flex items-center gap-1 ${
                          item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {item.changePercent >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="font-mono font-semibold">
                          {item.changePercent >= 0 ? '+' : ''}
                          {item.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Última actualización */}
                    <div className="text-xs text-gray-500 pt-2 border-t border-gray-800">
                      Actualizado: {item.lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>

                {/* Barra de color de fondo basada en cambio */}
                <div
                  className={`absolute bottom-0 left-0 right-0 h-1 ${
                    item.changePercent >= 0 ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{
                    opacity: Math.min(Math.abs(item.changePercent) / 10, 0.8),
                  }}
                />
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
