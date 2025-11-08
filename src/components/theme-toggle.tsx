"use client"

import { useTheme } from "@/contexts/theme-context"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor } from "lucide-react"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const themes = [
    { value: 'light' as const, icon: Sun, label: 'Claro' },
    { value: 'dark' as const, icon: Moon, label: 'Oscuro' },
    { value: 'auto' as const, icon: Monitor, label: 'Auto' },
  ]

  return (
    <div className="flex items-center gap-1 bg-gray-800/50 dark:bg-gray-800/50 light:bg-gray-200 rounded-lg p-1">
      {themes.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value

        return (
          <Button
            key={value}
            variant={isActive ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme(value)}
            className={`relative h-8 px-3 text-xs transition-all ${
              isActive
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'text-gray-400 hover:text-white'
            }`}
            title={label}
          >
            <Icon className="w-4 h-4" />
            {isActive && (
              <motion.div
                layoutId="activeTheme"
                className="absolute inset-0 bg-blue-600 rounded-md -z-10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
          </Button>
        )
      })}
    </div>
  )
}

// Versión compacta con solo un botón que cicla entre temas
export function ThemeToggleCompact() {
  const { theme, toggleTheme, effectiveTheme } = useTheme()

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-lg"
      title={`Tema: ${theme === 'auto' ? 'Automático' : theme === 'dark' ? 'Oscuro' : 'Claro'}`}
    >
      <Icon className="w-5 h-5" />
    </Button>
  )
}
