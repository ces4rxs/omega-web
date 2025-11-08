// Servicio de Polygon.io para datos de mercado reales
// Documentación: https://polygon.io/docs

interface PolygonBar {
  t: number  // timestamp
  o: number  // open
  h: number  // high
  l: number  // low
  c: number  // close
  v: number  // volume
  vw?: number // volume weighted
  n?: number  // number of transactions
}

interface PolygonAggregatesResponse {
  ticker: string
  queryCount: number
  resultsCount: number
  adjusted: boolean
  results: PolygonBar[]
  status: string
  request_id: string
  count: number
}

export interface OHLCData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

class PolygonService {
  private apiKey: string
  private baseUrl = 'https://api.polygon.io'

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY || ''

    if (!this.apiKey) {
      console.warn('⚠️ NEXT_PUBLIC_POLYGON_API_KEY no está configurada. Usando datos simulados.')
    }
  }

  /**
   * Obtiene barras OHLC históricas para un símbolo
   * @param symbol - Símbolo del activo (ej: AAPL, BTC-USD)
   * @param timeframe - Timeframe (1min, 5min, 15min, 1h, 4h, 1d)
   * @param from - Fecha inicio (YYYY-MM-DD)
   * @param to - Fecha fin (YYYY-MM-DD)
   */
  async getOHLC(
    symbol: string,
    timeframe: string,
    from: string,
    to: string
  ): Promise<OHLCData[]> {
    if (!this.apiKey) {
      console.warn('📊 Generando datos OHLC simulados para', symbol)
      return this.generateMockOHLC(from, to, timeframe)
    }

    try {
      const { multiplier, timespan } = this.parseTimeframe(timeframe)

      // Convertir formato de símbolo si es crypto
      const polygonSymbol = this.formatSymbol(symbol)

      const url = `${this.baseUrl}/v2/aggs/ticker/${polygonSymbol}/range/${multiplier}/${timespan}/${from}/${to}`

      const response = await fetch(`${url}?adjusted=true&sort=asc&limit=50000&apiKey=${this.apiKey}`)

      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status} ${response.statusText}`)
      }

      const data: PolygonAggregatesResponse = await response.json()

      if (data.status === 'ERROR' || !data.results || data.results.length === 0) {
        console.warn(`⚠️ No hay datos de Polygon para ${symbol}, usando datos simulados`)
        return this.generateMockOHLC(from, to, timeframe)
      }

      return data.results.map(bar => ({
        time: bar.t,
        open: bar.o,
        high: bar.h,
        low: bar.l,
        close: bar.c,
        volume: bar.v,
      }))
    } catch (error) {
      console.error('❌ Error obteniendo datos de Polygon:', error)
      console.log('📊 Usando datos simulados como fallback')
      return this.generateMockOHLC(from, to, timeframe)
    }
  }

  /**
   * Convierte timeframe del frontend al formato de Polygon
   */
  private parseTimeframe(timeframe: string): { multiplier: number; timespan: string } {
    const map: Record<string, { multiplier: number; timespan: string }> = {
      '1min': { multiplier: 1, timespan: 'minute' },
      '5min': { multiplier: 5, timespan: 'minute' },
      '15min': { multiplier: 15, timespan: 'minute' },
      '30min': { multiplier: 30, timespan: 'minute' },
      '1h': { multiplier: 1, timespan: 'hour' },
      '4h': { multiplier: 4, timespan: 'hour' },
      '1d': { multiplier: 1, timespan: 'day' },
      '1w': { multiplier: 1, timespan: 'week' },
      '1M': { multiplier: 1, timespan: 'month' },
    }

    return map[timeframe] || { multiplier: 1, timespan: 'day' }
  }

  /**
   * Formatea el símbolo al formato de Polygon
   */
  private formatSymbol(symbol: string): string {
    // Crypto: BTC -> X:BTCUSD
    const cryptoMap: Record<string, string> = {
      'BTC': 'X:BTCUSD',
      'ETH': 'X:ETHUSD',
      'BTC-USD': 'X:BTCUSD',
      'ETH-USD': 'X:ETHUSD',
    }

    if (cryptoMap[symbol.toUpperCase()]) {
      return cryptoMap[symbol.toUpperCase()]
    }

    // Acciones: AAPL -> AAPL (sin cambios)
    return symbol.toUpperCase()
  }

  /**
   * Genera datos OHLC simulados para desarrollo/fallback
   */
  private generateMockOHLC(from: string, to: string, timeframe: string): OHLCData[] {
    const start = new Date(from).getTime()
    const end = new Date(to).getTime()

    // Determinar intervalo en milisegundos
    const intervals: Record<string, number> = {
      '1min': 60 * 1000,
      '5min': 5 * 60 * 1000,
      '15min': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
    }

    const interval = intervals[timeframe] || intervals['1d']
    const bars: OHLCData[] = []

    let currentTime = start
    let price = 100 + Math.random() * 50 // Precio inicial aleatorio

    while (currentTime <= end) {
      // Simular movimiento de precio realista
      const change = (Math.random() - 0.48) * 2 // Ligero sesgo alcista
      const open = price
      const close = price + change
      const high = Math.max(open, close) + Math.random() * 0.5
      const low = Math.min(open, close) - Math.random() * 0.5
      const volume = Math.floor(1000000 + Math.random() * 5000000)

      bars.push({
        time: currentTime,
        open,
        high,
        low,
        close,
        volume,
      })

      price = close
      currentTime += interval
    }

    return bars
  }

  /**
   * Obtiene precio actual de un símbolo
   */
  async getCurrentPrice(symbol: string): Promise<number | null> {
    if (!this.apiKey) return null

    try {
      const polygonSymbol = this.formatSymbol(symbol)
      const url = `${this.baseUrl}/v2/last/trade/${polygonSymbol}?apiKey=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      return data.results?.p || null
    } catch (error) {
      console.error('Error obteniendo precio actual:', error)
      return null
    }
  }

  /**
   * Verifica si la API key es válida
   */
  async validateApiKey(): Promise<boolean> {
    if (!this.apiKey) return false

    try {
      const response = await fetch(
        `${this.baseUrl}/v2/aggs/ticker/AAPL/range/1/day/2023-01-01/2023-01-02?apiKey=${this.apiKey}`
      )
      return response.ok
    } catch {
      return false
    }
  }
}

// Singleton instance
export const polygonService = new PolygonService()

// Hook para usar en componentes React
export function usePolygonData() {
  return {
    getOHLC: (symbol: string, timeframe: string, from: string, to: string) =>
      polygonService.getOHLC(symbol, timeframe, from, to),
    getCurrentPrice: (symbol: string) => polygonService.getCurrentPrice(symbol),
    validateApiKey: () => polygonService.validateApiKey(),
  }
}
