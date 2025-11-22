/**
 * Utilidades para rendering de canvas
 * Funciones reutilizables para dibujar gráficos de backtesting
 */

import type {
  CanvasRenderConfig,
  ChartScale,
  EquityPoint,
  PriceCandle,
  DrawdownZone,
  TradeMarker,
  Trade
} from '@/types/backtest'

// ============================================================================
// CONFIGURACIÓN Y SETUP
// ============================================================================

/**
 * Inicializa canvas con configuración de alta resolución (retina)
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  backgroundColor: string = '#0a0f1e'
): {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
} | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null

  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1

  // Set canvas resolution
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const width = rect.width
  const height = rect.height

  // Clear with background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  return { ctx, width, height }
}

/**
 * Calcula escalas para mapear datos a pixeles
 */
export function calculateScale(
  dataLength: number,
  minValue: number,
  maxValue: number,
  width: number,
  height: number,
  padding: number = 50
): ChartScale {
  const range = maxValue - minValue || 1

  return {
    xScale: (width - 2 * padding) / Math.max(1, dataLength - 1),
    yScale: (height - 2 * padding) / range,
    minValue,
    maxValue,
    range
  }
}

// ============================================================================
// GRID Y EJES
// ============================================================================

/**
 * Dibuja grid horizontal y vertical
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  padding: number = 50,
  gridColor: string = '#1e293b',
  horizontalLines: number = 5,
  verticalLines: number = 10
): void {
  ctx.strokeStyle = gridColor
  ctx.lineWidth = 1

  // Líneas horizontales
  for (let i = 0; i <= horizontalLines; i++) {
    const y = padding + (i * (height - 2 * padding)) / horizontalLines
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Líneas verticales
  for (let i = 0; i <= verticalLines; i++) {
    const x = padding + (i * (width - 2 * padding)) / verticalLines
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, height - padding)
    ctx.stroke()
  }
}

/**
 * Dibuja labels en el eje Y
 */
export function drawYAxisLabels(
  ctx: CanvasRenderingContext2D,
  minValue: number,
  maxValue: number,
  height: number,
  padding: number = 50,
  steps: number = 5,
  formatter?: (value: number) => string
): void {
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'right'

  const range = maxValue - minValue

  for (let i = 0; i <= steps; i++) {
    const value = minValue + (range * i) / steps
    const y = height - padding - (i * (height - 2 * padding)) / steps

    const label = formatter
      ? formatter(value)
      : `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`

    ctx.fillText(label, padding - 10, y + 4)
  }
}

/**
 * Dibuja labels en el eje X (fechas)
 */
export function drawXAxisLabels(
  ctx: CanvasRenderingContext2D,
  dates: string[],
  width: number,
  height: number,
  padding: number = 50,
  steps: number = 5
): void {
  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px sans-serif'
  ctx.textAlign = 'center'

  for (let i = 0; i <= steps; i++) {
    const index = Math.floor((dates.length - 1) * (i / steps))
    if (index < dates.length) {
      const date = new Date(dates[index])
      const x = padding + (index * (width - 2 * padding)) / (dates.length - 1)

      const label = date.toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric'
      })

      ctx.fillText(label, x, height - padding + 20)
    }
  }
}

// ============================================================================
// LÍNEAS Y CURVAS
// ============================================================================

/**
 * Dibuja una línea con datos de equity
 */
export function drawEquityLine(
  ctx: CanvasRenderingContext2D,
  data: EquityPoint[],
  scale: ChartScale,
  width: number,
  height: number,
  padding: number = 50,
  color: string = '#10b981',
  lineWidth: number = 3,
  shadowBlur: number = 10
): void {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = color
  ctx.shadowBlur = shadowBlur

  data.forEach((point, i) => {
    const x = padding + i * scale.xScale
    const y = height - padding - (point.equity - scale.minValue) * scale.yScale

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.stroke()
  ctx.shadowBlur = 0
}

/**
 * Dibuja gradient fill debajo de la línea de equity
 */
export function drawEquityGradientFill(
  ctx: CanvasRenderingContext2D,
  data: EquityPoint[],
  scale: ChartScale,
  width: number,
  height: number,
  padding: number = 50,
  isPositive: boolean = true
): void {
  // Create gradient
  const gradient = ctx.createLinearGradient(0, padding, 0, height - padding)

  if (isPositive) {
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)')
    gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.2)')
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0)')
  } else {
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)')
    gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)')
    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)')
  }

  ctx.fillStyle = gradient

  // Draw path and fill
  ctx.beginPath()
  data.forEach((point, i) => {
    const x = padding + i * scale.xScale
    const y = height - padding - (point.equity - scale.minValue) * scale.yScale

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })

  ctx.lineTo(width - padding, height - padding)
  ctx.lineTo(padding, height - padding)
  ctx.closePath()
  ctx.fill()
}

/**
 * Dibuja una línea horizontal (ej: capital inicial)
 */
export function drawHorizontalLine(
  ctx: CanvasRenderingContext2D,
  value: number,
  scale: ChartScale,
  width: number,
  height: number,
  padding: number = 50,
  color: string = '#475569',
  dashed: boolean = true
): void {
  ctx.strokeStyle = color
  ctx.lineWidth = 1

  if (dashed) {
    ctx.setLineDash([5, 5])
  }

  const y = height - padding - (value - scale.minValue) * scale.yScale

  ctx.beginPath()
  ctx.moveTo(padding, y)
  ctx.lineTo(width - padding, y)
  ctx.stroke()

  ctx.setLineDash([])
}

// ============================================================================
// CANDLESTICKS
// ============================================================================

/**
 * Dibuja un candlestick individual
 */
export function drawCandlestick(
  ctx: CanvasRenderingContext2D,
  candle: PriceCandle,
  x: number,
  scale: ChartScale,
  height: number,
  padding: number = 50,
  candleWidth: number = 4
): void {
  const openY = height - padding - (candle.open - scale.minValue) * scale.yScale
  const closeY = height - padding - (candle.close - scale.minValue) * scale.yScale
  const highY = height - padding - (candle.high - scale.minValue) * scale.yScale
  const lowY = height - padding - (candle.low - scale.minValue) * scale.yScale

  const isGreen = candle.close >= candle.open

  // Draw wick (high-low line)
  ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, highY)
  ctx.lineTo(x, lowY)
  ctx.stroke()

  // Draw body (open-close)
  ctx.fillStyle = isGreen ? '#10b981' : '#ef4444'
  const bodyHeight = Math.abs(openY - closeY) || 1
  const bodyY = Math.min(openY, closeY)
  ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight)

  // Draw border
  ctx.strokeStyle = isGreen ? '#059669' : '#dc2626'
  ctx.lineWidth = 1
  ctx.strokeRect(x - candleWidth / 2, bodyY, candleWidth, bodyHeight)
}

/**
 * Dibuja múltiples candlesticks
 */
export function drawCandlesticks(
  ctx: CanvasRenderingContext2D,
  candles: PriceCandle[],
  scale: ChartScale,
  height: number,
  padding: number = 50
): void {
  const candleWidth = Math.max(2, scale.xScale * 0.6)

  candles.forEach((candle, i) => {
    const x = padding + i * scale.xScale
    drawCandlestick(ctx, candle, x, scale, height, padding, candleWidth)
  })
}

// ============================================================================
// ZONES Y ÁREAS
// ============================================================================

/**
 * Dibuja zona de drawdown
 */
export function drawDrawdownZone(
  ctx: CanvasRenderingContext2D,
  zone: DrawdownZone,
  scale: ChartScale,
  width: number,
  height: number,
  padding: number = 50
): void {
  if (zone.depth <= 5) return // Solo mostrar drawdowns > 5%

  const startX = padding + zone.start * scale.xScale
  const endX = padding + zone.end * scale.xScale

  // Gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, 'rgba(239, 68, 68, 0.15)')
  gradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)')

  ctx.fillStyle = gradient
  ctx.fillRect(startX, padding, endX - startX, height - 2 * padding)

  // Label
  ctx.fillStyle = '#ef4444'
  ctx.font = 'bold 11px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`-${zone.depth.toFixed(1)}%`, (startX + endX) / 2, padding + 15)
}

// ============================================================================
// TRADE MARKERS
// ============================================================================

/**
 * Dibuja marker de entrada (BUY)
 */
export function drawEntryMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number = 7
): void {
  // Triangle pointing up
  ctx.fillStyle = '#3b82f6'
  ctx.strokeStyle = '#1e40af'
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.moveTo(x, y - 5)
  ctx.lineTo(x - size, y + 5)
  ctx.lineTo(x + size, y + 5)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Label "BUY"
  ctx.fillStyle = '#3b82f6'
  ctx.font = 'bold 10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('BUY', x, y + 18)
}

/**
 * Dibuja marker de salida (SELL)
 */
export function drawExitMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isWin: boolean,
  size: number = 7
): void {
  // Triangle pointing down
  ctx.fillStyle = isWin ? '#10b981' : '#ef4444'
  ctx.strokeStyle = isWin ? '#059669' : '#dc2626'
  ctx.lineWidth = 2

  ctx.beginPath()
  ctx.moveTo(x, y + 5)
  ctx.lineTo(x - size, y - 5)
  ctx.lineTo(x + size, y - 5)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Label "SELL"
  ctx.fillStyle = isWin ? '#10b981' : '#ef4444'
  ctx.font = 'bold 10px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('SELL', x, y - 10)
}

/**
 * Dibuja círculo indicador actual con glow
 */
export function drawCurrentPositionIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  isPositive: boolean
): void {
  // Outer glow
  ctx.fillStyle = isPositive
    ? 'rgba(16, 185, 129, 0.3)'
    : 'rgba(239, 68, 68, 0.3)'
  ctx.beginPath()
  ctx.arc(x, y, 16, 0, Math.PI * 2)
  ctx.fill()

  // Inner circle
  ctx.fillStyle = isPositive ? '#10b981' : '#ef4444'
  ctx.beginPath()
  ctx.arc(x, y, 8, 0, Math.PI * 2)
  ctx.fill()

  // Border
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2
  ctx.stroke()
}

// ============================================================================
// SMA LINES
// ============================================================================

/**
 * Dibuja línea SMA
 */
export function drawSMALine(
  ctx: CanvasRenderingContext2D,
  smaData: number[],
  scale: ChartScale,
  height: number,
  padding: number = 50,
  color: string = '#f97316',
  lineWidth: number = 2
): void {
  ctx.beginPath()
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.setLineDash([])

  smaData.forEach((value, i) => {
    if (!isNaN(value)) {
      const x = padding + i * scale.xScale
      const y = height - padding - (value - scale.minValue) * scale.yScale

      if (i === 0 || isNaN(smaData[i - 1])) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
  })

  ctx.stroke()
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Limpia completamente el canvas
 */
export function clearCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  backgroundColor: string = '#0a0f1e'
): void {
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)
}

/**
 * Dibuja texto con sombra
 */
export function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string = '#ffffff',
  shadowColor: string = 'rgba(0, 0, 0, 0.5)'
): void {
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 2

  ctx.fillStyle = color
  ctx.fillText(text, x, y)

  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
}
