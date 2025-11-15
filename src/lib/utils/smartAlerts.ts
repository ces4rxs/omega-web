// Smart Alerts System - OMEGA NEWS ÉLITE
// Generates intelligent trading alerts based on impact analysis

import { type ImpactAnalysis } from '@/lib/api/news';

export interface SmartAlert {
  type: 'momentum' | 'volatility' | 'breakout' | 'reversion' | 'volume';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  action: string;
  icon: string;
  color: string;
}

/**
 * Generate Smart Alerts based on impact analysis
 */
export function generateSmartAlerts(impact: ImpactAnalysis): SmartAlert[] {
  const alerts: SmartAlert[] = [];

  // Momentum Alert - Strong directional movement
  if (Math.abs(impact.move1h) > 2.0 && impact.volatility1h < 3.0) {
    const direction = impact.move1h > 0 ? 'alcista' : 'bajista';
    alerts.push({
      type: 'momentum',
      severity: impact.impactScore > 70 ? 'critical' : 'high',
      message: `Momentum ${direction} fuerte detectado`,
      action: `Movimiento ${direction} de ${Math.abs(impact.move1h).toFixed(2)}% con baja volatilidad → posible continuación`,
      icon: '📈',
      color: impact.move1h > 0 ? 'green' : 'red',
    });
  }

  // Volatility Warning - High volatility detected
  if (impact.volatility1h > 4.0 || impact.volatility4h > 5.0) {
    alerts.push({
      type: 'volatility',
      severity: impact.volatility1h > 6.0 ? 'critical' : 'high',
      message: 'Advertencia de alta volatilidad',
      action: `Volatilidad ${impact.volatility1h.toFixed(2)}% → esperarse movimientos bruscos en ${impact.eventDuration}`,
      icon: '⚠️',
      color: 'yellow',
    });
  }

  // Trend Breakout - Potential breakout pattern
  if (impact.pattern.includes('BREAKOUT') || impact.pattern.includes('UPTREND') || impact.pattern.includes('DOWNTREND')) {
    const direction = impact.pattern.includes('UP') ? 'alcista' : impact.pattern.includes('DOWN') ? 'bajista' : 'lateral';
    alerts.push({
      type: 'breakout',
      severity: impact.impactScore > 60 ? 'high' : 'medium',
      message: `Patrón de ruptura ${direction}`,
      action: `Patrón ${impact.pattern} detectado → probabilidad ${direction} ${impact.probabilityUp}%`,
      icon: direction === 'alcista' ? '🚀' : direction === 'bajista' ? '📉' : '➡️',
      color: direction === 'alcista' ? 'green' : direction === 'bajista' ? 'red' : 'gray',
    });
  }

  // Mean Reversion Risk - Overextended movement
  if (Math.abs(impact.move1h) > 5.0 && impact.volatility1h > 3.0) {
    alerts.push({
      type: 'reversion',
      severity: 'medium',
      message: 'Riesgo de reversión a la media',
      action: `Movimiento extremo ${impact.move1h.toFixed(2)}% → posible corrección en próximas horas`,
      icon: '🔄',
      color: 'orange',
    });
  }

  // Volume Spike - Unusual activity (inferred from high impact + high vol)
  if (impact.impactScore > 75 && impact.volatility1h > 4.0) {
    alerts.push({
      type: 'volume',
      severity: 'critical',
      message: 'Pico de actividad institucional',
      action: `Impacto ${impact.impactScore}/100 + volatilidad ${impact.volatility1h.toFixed(2)}% → entrada/salida de capital significativo`,
      icon: '💰',
      color: 'purple',
    });
  }

  // If no specific alerts, add a general market update
  if (alerts.length === 0 && impact.impactScore > 30) {
    alerts.push({
      type: 'momentum',
      severity: 'low',
      message: 'Actualización de mercado',
      action: `Movimiento ${impact.move1h >= 0 ? 'positivo' : 'negativo'} de ${Math.abs(impact.move1h).toFixed(2)}% en desarrollo`,
      icon: '📊',
      color: 'blue',
    });
  }

  return alerts;
}

/**
 * Get color classes for alert severity
 */
export function getAlertSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 border-red-500/40 text-red-300';
    case 'high':
      return 'bg-orange-500/20 border-orange-500/40 text-orange-300';
    case 'medium':
      return 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300';
    default:
      return 'bg-blue-500/20 border-blue-500/40 text-blue-300';
  }
}

/**
 * Get color classes for alert type
 */
export function getAlertTypeColor(color: string): string {
  switch (color) {
    case 'green':
      return 'text-green-400 border-green-500/30';
    case 'red':
      return 'text-red-400 border-red-500/30';
    case 'yellow':
      return 'text-yellow-400 border-yellow-500/30';
    case 'orange':
      return 'text-orange-400 border-orange-500/30';
    case 'purple':
      return 'text-purple-400 border-purple-500/30';
    default:
      return 'text-blue-400 border-blue-500/30';
  }
}
