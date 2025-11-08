"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Theme = 'dark' | 'light' | 'auto'

interface ThemeContextType {
  theme: Theme
  effectiveTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark')

  // Cargar tema del localStorage al montar
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
    } else {
      // Detectar preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setThemeState('auto')
      setEffectiveTheme(prefersDark ? 'dark' : 'light')
    }
  }, [])

  // Aplicar tema al documento
  useEffect(() => {
    const root = document.documentElement

    let newEffectiveTheme: 'dark' | 'light'

    if (theme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      newEffectiveTheme = prefersDark ? 'dark' : 'light'
    } else {
      newEffectiveTheme = theme
    }

    setEffectiveTheme(newEffectiveTheme)

    // Aplicar clase al HTML
    root.classList.remove('dark', 'light')
    root.classList.add(newEffectiveTheme)

    // Guardar en localStorage
    localStorage.setItem('theme', theme)

    // Cambiar color de fondo
    if (newEffectiveTheme === 'dark') {
      root.style.backgroundColor = '#000000'
      root.style.colorScheme = 'dark'
    } else {
      root.style.backgroundColor = '#ffffff'
      root.style.colorScheme = 'light'
    }
  }, [theme])

  // Listener para cambios en la preferencia del sistema
  useEffect(() => {
    if (theme !== 'auto') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e: MediaQueryListEvent) => {
      setEffectiveTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const toggleTheme = () => {
    setThemeState((current) => {
      if (current === 'dark') return 'light'
      if (current === 'light') return 'auto'
      return 'dark'
    })
  }

  return (
    <ThemeContext.Provider value={{ theme, effectiveTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
