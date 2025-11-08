"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronUp, Crown, Zap, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"

type TierLevel = 'free' | 'professional' | 'enterprise'

export function DevTierSwitcher() {
  // Solo mostrar en development
  const isDev = process.env.NODE_ENV === 'development'
  const [isOpen, setIsOpen] = useState(false)
  const [currentTier, setCurrentTier] = useState<TierLevel>('free')

  useEffect(() => {
    // Leer tier actual del localStorage
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentTier(user?.subscription?.planId || 'free')
      } catch (e) {
        console.error('Error reading user:', e)
      }
    }
  }, [])

  const changeTier = (tier: TierLevel) => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)

        // Actualizar el tier
        user.subscription = {
          planId: tier,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }

        localStorage.setItem('user', JSON.stringify(user))
        setCurrentTier(tier)

        // Recargar la página para aplicar cambios
        window.location.reload()
      } catch (e) {
        console.error('Error updating tier:', e)
      }
    } else {
      alert('Inicia sesión primero para cambiar de tier')
    }
  }

  if (!isDev) return null

  const tiers = [
    {
      id: 'free' as TierLevel,
      name: 'FREE',
      icon: Zap,
      color: 'from-gray-600 to-gray-700',
      borderColor: 'border-gray-500'
    },
    {
      id: 'professional' as TierLevel,
      name: 'PROFESSIONAL',
      icon: Crown,
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-500'
    },
    {
      id: 'enterprise' as TierLevel,
      name: 'ENTERPRISE',
      icon: Rocket,
      color: 'from-purple-600 to-pink-600',
      borderColor: 'border-purple-500'
    }
  ]

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mb-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-4 min-w-[280px]"
          >
            <div className="mb-3">
              <h3 className="text-sm font-bold text-white mb-1">🔧 DEV: Tier Switcher</h3>
              <p className="text-xs text-gray-400">Cambia de tier para probar features</p>
            </div>

            <div className="space-y-2">
              {tiers.map((tier) => {
                const Icon = tier.icon
                const isCurrent = currentTier === tier.id

                return (
                  <button
                    key={tier.id}
                    onClick={() => changeTier(tier.id)}
                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                      isCurrent
                        ? `${tier.borderColor} bg-gradient-to-r ${tier.color}`
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                        <span className={`text-sm font-semibold ${isCurrent ? 'text-white' : 'text-gray-300'}`}>
                          {tier.name}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">
                          Actual
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-500 text-center">
                Los cambios se aplican al recargar
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`bg-gradient-to-r ${
          currentTier === 'enterprise'
            ? 'from-purple-600 to-pink-600'
            : currentTier === 'professional'
            ? 'from-blue-600 to-cyan-600'
            : 'from-gray-600 to-gray-700'
        } hover:opacity-90 shadow-xl`}
        size="sm"
      >
        <Crown className="w-4 h-4 mr-2" />
        {currentTier.toUpperCase()}
        {isOpen ? (
          <ChevronDown className="w-4 h-4 ml-2" />
        ) : (
          <ChevronUp className="w-4 h-4 ml-2" />
        )}
      </Button>
    </div>
  )
}
