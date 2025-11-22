/**
 * Sound effects para el replay de backtesting
 * Genera efectos de audio usando Web Audio API
 */

import type { SoundType, AudioConfig } from '@/types/backtest'

// ============================================================================
// CONFIGURACIONES DE AUDIO
// ============================================================================

const AUDIO_CONFIGS: Record<SoundType, AudioConfig> = {
  win: {
    frequency: 800,
    type: 'sine',
    duration: 0.3,
    gain: 0.1
  },
  loss: {
    frequency: 200,
    type: 'square',
    duration: 0.3,
    gain: 0.1
  }
}

// ============================================================================
// REPRODUCCIÓN DE SONIDOS
// ============================================================================

/**
 * Reproduce un sonido de trade (ganador o perdedor)
 */
export function playTradeSound(type: SoundType, enabled: boolean = true): void {
  if (!enabled) return

  try {
    const config = AUDIO_CONFIGS[type]
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = config.frequency
    oscillator.type = config.type

    gainNode.gain.setValueAtTime(config.gain, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + config.duration
    )

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + config.duration)
  } catch (error) {
    console.warn('Error playing sound:', error)
  }
}

/**
 * Reproduce sonido de victoria (para racha ganadora)
 */
export function playWinStreakSound(streakCount: number, enabled: boolean = true): void {
  if (!enabled || streakCount < 3) return

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Secuencia ascendente de tonos
    const frequencies = [523, 659, 784] // C5, E5, G5
    const duration = 0.15

    frequencies.forEach((freq, i) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      const startTime = audioContext.currentTime + (i * duration)

      gainNode.gain.setValueAtTime(0.08, startTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration)

      oscillator.start(startTime)
      oscillator.stop(startTime + duration)
    })
  } catch (error) {
    console.warn('Error playing win streak sound:', error)
  }
}

/**
 * Reproduce sonido de alerta (para drawdown significativo)
 */
export function playDrawdownAlert(enabled: boolean = true): void {
  if (!enabled) return

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Tono descendente de alerta
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(
      300,
      audioContext.currentTime + 0.4
    )
    oscillator.type = 'triangle'

    gainNode.gain.setValueAtTime(0.12, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.4)
  } catch (error) {
    console.warn('Error playing drawdown alert:', error)
  }
}

/**
 * Reproduce sonido de completado (cuando el replay termina)
 */
export function playCompletionSound(enabled: boolean = true): void {
  if (!enabled) return

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Acorde de finalización
    const frequencies = [523, 659, 784, 1047] // C5, E5, G5, C6
    const duration = 0.5

    frequencies.forEach((freq) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.value = freq
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    })
  } catch (error) {
    console.warn('Error playing completion sound:', error)
  }
}

// ============================================================================
// UTILIDADES
// ============================================================================

/**
 * Verifica si el navegador soporta Web Audio API
 */
export function isAudioSupported(): boolean {
  return !!(window.AudioContext || (window as any).webkitAudioContext)
}

/**
 * Crea un audio context reutilizable
 */
export function createAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)()
  } catch (error) {
    console.warn('AudioContext not supported:', error)
    return null
  }
}
