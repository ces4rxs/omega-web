/**
 * Hook para manejar keyboard shortcuts en el replay
 * Shortcuts: Space (play/pause), Arrows (step), R (reset)
 */

import { useEffect } from 'react'
import type { ReplayControls } from '@/types/backtest'

export interface KeyboardShortcuts {
  space?: () => void
  arrowLeft?: () => void
  arrowRight?: () => void
  arrowUp?: () => void
  arrowDown?: () => void
  r?: () => void
  escape?: () => void
}

/**
 * Hook con shortcuts predefinidos para replay
 */
export function useKeyboardControls(controls: ReplayControls): void {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          controls.handlePlayPause()
          break

        case 'ArrowLeft':
          e.preventDefault()
          controls.handleStepBack()
          break

        case 'ArrowRight':
          e.preventDefault()
          controls.handleStepForward()
          break

        case 'KeyR':
          e.preventDefault()
          controls.handleReset()
          break

        case 'Home':
          e.preventDefault()
          controls.handleSkipToStart()
          break

        case 'End':
          e.preventDefault()
          controls.handleSkipToEnd()
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [controls])
}

/**
 * Hook genérico para shortcuts personalizados
 */
export function useCustomKeyboardShortcuts(shortcuts: KeyboardShortcuts): void {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      switch (e.code) {
        case 'Space':
          if (shortcuts.space) {
            e.preventDefault()
            shortcuts.space()
          }
          break

        case 'ArrowLeft':
          if (shortcuts.arrowLeft) {
            e.preventDefault()
            shortcuts.arrowLeft()
          }
          break

        case 'ArrowRight':
          if (shortcuts.arrowRight) {
            e.preventDefault()
            shortcuts.arrowRight()
          }
          break

        case 'ArrowUp':
          if (shortcuts.arrowUp) {
            e.preventDefault()
            shortcuts.arrowUp()
          }
          break

        case 'ArrowDown':
          if (shortcuts.arrowDown) {
            e.preventDefault()
            shortcuts.arrowDown()
          }
          break

        case 'KeyR':
          if (shortcuts.r) {
            e.preventDefault()
            shortcuts.r()
          }
          break

        case 'Escape':
          if (shortcuts.escape) {
            e.preventDefault()
            shortcuts.escape()
          }
          break

        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [shortcuts])
}
