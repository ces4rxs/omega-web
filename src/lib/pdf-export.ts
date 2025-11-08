import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import type { BacktestResult } from './types'

export async function exportBacktestToPDF(
  result: BacktestResult,
  symbol: string,
  strategy: string
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Configuración de fuentes
  pdf.setFont('helvetica')

  // Header
  pdf.setFontSize(24)
  pdf.setTextColor(59, 130, 246) // blue-500
  pdf.text('Backtester Pro', 20, yPosition)

  pdf.setFontSize(10)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Generado: ${new Date().toLocaleString()}`, pageWidth - 70, yPosition)

  yPosition += 10

  // Título del reporte
  pdf.setFontSize(18)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`Reporte de Backtest - ${symbol}`, 20, yPosition)

  yPosition += 6
  pdf.setFontSize(12)
  pdf.setTextColor(100, 100, 100)
  pdf.text(`Estrategia: ${strategy}`, 20, yPosition)

  yPosition += 15

  // Sección de Métricas de Performance
  pdf.setFontSize(14)
  pdf.setTextColor(0, 0, 0)
  pdf.text('Métricas de Performance', 20, yPosition)
  yPosition += 8

  const { performance } = result.backtest

  // Tabla de métricas
  const metrics = [
    { label: 'Retorno Total', value: `${(performance.totalReturn * 100).toFixed(2)}%`, color: performance.totalReturn >= 0 ? [34, 197, 94] : [239, 68, 68] },
    { label: 'CAGR', value: `${(performance.cagr * 100).toFixed(2)}%`, color: performance.cagr >= 0 ? [34, 197, 94] : [239, 68, 68] },
    { label: 'Sharpe Ratio', value: performance.sharpeRatio.toFixed(2), color: [59, 130, 246] },
    { label: 'Max Drawdown', value: `${(Math.abs(performance.maxDrawdown) * 100).toFixed(2)}%`, color: [239, 68, 68] },
    { label: 'Win Rate', value: `${(performance.winRate * 100).toFixed(2)}%`, color: [34, 197, 94] },
    { label: 'Profit Factor', value: performance.profitFactor.toFixed(2), color: [59, 130, 246] },
    { label: 'Total Trades', value: performance.totalTrades.toString(), color: [100, 100, 100] },
    { label: 'Expectancy', value: `$${performance.expectancy.toFixed(2)}`, color: performance.expectancy >= 0 ? [34, 197, 94] : [239, 68, 68] },
  ]

  // Dibujar tabla de métricas
  const colWidth = (pageWidth - 40) / 2
  metrics.forEach((metric, idx) => {
    const col = idx % 2
    const row = Math.floor(idx / 2)
    const x = 20 + col * colWidth
    const y = yPosition + row * 12

    pdf.setFontSize(10)
    pdf.setTextColor(80, 80, 80)
    pdf.text(metric.label, x, y)

    pdf.setFontSize(11)
    pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2])
    pdf.setFont('helvetica', 'bold')
    pdf.text(metric.value, x + 50, y)
    pdf.setFont('helvetica', 'normal')
  })

  yPosition += Math.ceil(metrics.length / 2) * 12 + 15

  // Resumen de Trades
  pdf.setFontSize(14)
  pdf.setTextColor(0, 0, 0)
  pdf.text('Resumen de Trades', 20, yPosition)
  yPosition += 8

  const winningTrades = result.backtest.trades.filter(t => t.pnl > 0).length
  const losingTrades = result.backtest.trades.filter(t => t.pnl < 0).length
  const avgWin = result.backtest.trades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / (winningTrades || 1)
  const avgLoss = Math.abs(result.backtest.trades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0)) / (losingTrades || 1)

  pdf.setFontSize(10)
  pdf.setTextColor(80, 80, 80)
  pdf.text(`Trades Ganadores: ${winningTrades} (Promedio: $${avgWin.toFixed(2)})`, 20, yPosition)
  yPosition += 6
  pdf.text(`Trades Perdedores: ${losingTrades} (Promedio: -$${avgLoss.toFixed(2)})`, 20, yPosition)
  yPosition += 6
  pdf.text(`Ratio Win/Loss: ${(avgWin / avgLoss).toFixed(2)}`, 20, yPosition)
  yPosition += 15

  // Lista de Trades (primeros 10)
  pdf.setFontSize(14)
  pdf.setTextColor(0, 0, 0)
  pdf.text('Top 10 Trades', 20, yPosition)
  yPosition += 8

  const topTrades = [...result.backtest.trades]
    .sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl))
    .slice(0, 10)

  pdf.setFontSize(8)
  pdf.setTextColor(80, 80, 80)

  // Headers
  pdf.text('Entrada', 20, yPosition)
  pdf.text('Salida', 55, yPosition)
  pdf.text('P&L', 90, yPosition)
  pdf.text('P&L %', 115, yPosition)
  pdf.text('Duración', 145, yPosition)
  yPosition += 5

  // Línea separadora
  pdf.setDrawColor(200, 200, 200)
  pdf.line(20, yPosition, pageWidth - 20, yPosition)
  yPosition += 3

  topTrades.forEach((trade) => {
    if (yPosition > pageHeight - 20) {
      pdf.addPage()
      yPosition = 20
    }

    pdf.setTextColor(80, 80, 80)
    pdf.text(new Date(trade.entryDate).toLocaleDateString(), 20, yPosition)
    pdf.text(new Date(trade.exitDate).toLocaleDateString(), 55, yPosition)

    pdf.setTextColor(trade.pnl >= 0 ? 34 : 239, trade.pnl >= 0 ? 197 : 68, trade.pnl >= 0 ? 94 : 68)
    pdf.text(`$${trade.pnl.toFixed(2)}`, 90, yPosition)
    pdf.text(`${trade.pnlPercent.toFixed(2)}%`, 115, yPosition)

    pdf.setTextColor(80, 80, 80)
    pdf.text(`${trade.duration} días`, 145, yPosition)

    yPosition += 5
  })

  yPosition += 10

  // Footer
  pdf.setFontSize(8)
  pdf.setTextColor(150, 150, 150)
  const disclaimer = 'Este reporte es generado automáticamente. Los resultados pasados no garantizan rendimientos futuros.'
  pdf.text(disclaimer, pageWidth / 2, pageHeight - 10, { align: 'center' })

  // Descargar PDF
  const fileName = `backtest-${symbol}-${strategy}-${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}

/**
 * Exporta gráficos visuales a PDF (versión con capturas de pantalla)
 */
export async function exportBacktestWithChartsToPDF(
  result: BacktestResult,
  symbol: string,
  strategy: string,
  chartElementIds: string[]
): Promise<void> {
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  let yPosition = 20

  // Header similar al anterior
  pdf.setFontSize(24)
  pdf.setTextColor(59, 130, 246)
  pdf.text('Backtester Pro', 20, yPosition)
  yPosition += 15

  pdf.setFontSize(18)
  pdf.setTextColor(0, 0, 0)
  pdf.text(`Reporte Completo - ${symbol}`, 20, yPosition)
  yPosition += 10

  // Capturar y agregar gráficos
  for (const elementId of chartElementIds) {
    const element = document.getElementById(elementId)
    if (!element) continue

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0a0a',
        scale: 2,
      })

      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pageWidth - 40
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      if (yPosition + imgHeight > pageHeight - 20) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight)
      yPosition += imgHeight + 10
    } catch (error) {
      console.error(`Error capturando elemento ${elementId}:`, error)
    }
  }

  // Descargar PDF con gráficos
  const fileName = `backtest-completo-${symbol}-${strategy}-${new Date().toISOString().split('T')[0]}.pdf`
  pdf.save(fileName)
}
