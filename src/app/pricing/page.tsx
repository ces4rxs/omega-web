"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X, Zap, Crown, Rocket, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

type BillingCycle = 'monthly' | 'annual'

interface PricingTier {
  id: 'free' | 'professional' | 'enterprise'
  name: string
  description: string
  icon: any
  monthlyPrice: number
  annualPrice: number
  badge?: string
  badgeColor?: string
  features: {
    category: string
    items: Array<{
      text: string
      included: boolean
      highlight?: boolean
    }>
  }[]
  cta: string
  popular?: boolean
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Empieza a hacer backtesting sin costo',
    icon: Zap,
    monthlyPrice: 0,
    annualPrice: 0,
    features: [
      {
        category: 'Backtesting',
        items: [
          { text: '5 backtests por mes', included: true },
          { text: '1 backtest concurrente', included: true },
          { text: 'Datos de mercado simulados', included: true },
          { text: 'Estrategias básicas', included: true },
        ],
      },
      {
        category: 'Características',
        items: [
          { text: 'Indicadores básicos (SMA, EMA, RSI)', included: true },
          { text: '5 símbolos en watchlist', included: true },
          { text: 'Soporte por comunidad', included: true },
        ],
      },
      {
        category: 'IA & Análisis Avanzado',
        items: [
          { text: 'AI Insights', included: false },
          { text: 'Quantum Risk Analysis', included: false },
          { text: 'AI Optimizer', included: false },
          { text: 'Datos reales de Polygon.io', included: false },
        ],
      },
    ],
    cta: 'Comenzar Gratis',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Para traders serios que quieren potenciar sus estrategias',
    icon: Crown,
    monthlyPrice: 89.99,
    annualPrice: 899.99, // 2 meses gratis
    badge: 'Más Popular',
    badgeColor: 'bg-blue-500',
    popular: true,
    features: [
      {
        category: 'Backtesting',
        items: [
          { text: 'Backtests ilimitados', included: true, highlight: true },
          { text: '3 backtests concurrentes', included: true },
          { text: 'Datos reales de Polygon.io', included: true, highlight: true },
          { text: 'Todas las estrategias', included: true },
        ],
      },
      {
        category: 'Características',
        items: [
          { text: '6 indicadores avanzados (Bollinger, ATR, Stochastic, MACD, ADX, OBV)', included: true },
          { text: '20 símbolos en watchlist', included: true },
          { text: 'Backtest Replay animado', included: true },
          { text: 'Performance Heatmaps', included: true },
          { text: 'Strategy Comparison', included: true },
          { text: 'Exportar a PDF profesional', included: true },
        ],
      },
      {
        category: 'IA Core (6 Módulos)',
        items: [
          { text: 'AI Insights (Hybrid + Neural Advisors)', included: true, highlight: true },
          { text: 'Quantum Risk Analysis v13', included: true, highlight: true },
          { text: 'AI Optimizer + Auto-Tuner', included: true, highlight: true },
          { text: 'Strategic Advisor v12', included: true },
          { text: 'User Brainprint (perfil personalizado)', included: true },
          { text: 'Cognitive Risk v14', included: true },
        ],
      },
      {
        category: 'IA Exclusiva Enterprise',
        items: [
          { text: 'Predictive Score (ML)', included: false },
          { text: 'AI Copilot Chat', included: false },
          { text: 'Monte Carlo Simulations', included: false },
          { text: 'Auto-Trading Loop', included: false },
        ],
      },
    ],
    cta: 'Comenzar Trial de 14 días',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para equipos y traders institucionales',
    icon: Rocket,
    monthlyPrice: 159.99,
    annualPrice: 1599.99, // 2 meses gratis
    badge: 'Máximo Poder',
    badgeColor: 'bg-purple-500',
    features: [
      {
        category: 'Todo en Professional +',
        items: [
          { text: 'Backtests ilimitados', included: true },
          { text: '10 backtests concurrentes', included: true, highlight: true },
          { text: '50 símbolos en watchlist', included: true },
          { text: '3 miembros en equipo', included: true },
        ],
      },
      {
        category: 'IA Exclusiva (4 Módulos Premium)',
        items: [
          { text: 'Predictive Score ML v4', included: true, highlight: true },
          { text: 'AI Copilot Chat (Reflex v15+)', included: true, highlight: true },
          { text: 'Monte Carlo Simulations v12', included: true, highlight: true },
          { text: 'Auto-Trading Loop', included: true, highlight: true },
        ],
      },
      {
        category: 'Características Enterprise',
        items: [
          { text: 'Procesamiento prioritario', included: true },
          { text: 'Acceso a API REST', included: true },
          { text: 'Reportes white-label', included: true },
          { text: 'Soporte prioritario < 24h', included: true },
          { text: 'Dashboard personalizable', included: true },
        ],
      },
    ],
    cta: 'Comenzar Trial de 14 días',
  },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly')
  const router = useRouter()

  // Safe auth check - handle SSR case
  let user = null
  let isAuthenticated = false
  try {
    const auth = useAuth()
    user = auth.user
    isAuthenticated = auth.isAuthenticated
  } catch (e) {
    // Not inside AuthProvider (SSR case)
  }

  const handleSelectPlan = (tierId: string) => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/pricing')
      return
    }

    if (tierId === 'free') {
      router.push('/dashboard')
      return
    }

    // TODO: Integrar con Stripe checkout
    console.log(`Seleccionado plan: ${tierId}, ciclo: ${billingCycle}`)
    alert(`Próximamente: Checkout para ${tierId} (${billingCycle})`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Precios Simples y Transparentes
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Elige el plan perfecto para tus necesidades. Cancela cuando quieras.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div
            className="inline-flex items-center gap-3 bg-gray-800/50 rounded-lg p-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Mensual
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === 'annual'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Anual
              <span className="ml-2 text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                Ahorra 20%
              </span>
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {PRICING_TIERS.map((tier, index) => {
            const Icon = tier.icon
            const price = billingCycle === 'monthly' ? tier.monthlyPrice : tier.annualPrice
            const isCurrentPlan = user?.subscription?.planId === tier.id

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={tier.popular ? 'md:scale-105' : ''}
              >
                <Card
                  className={`relative overflow-hidden h-full flex flex-col ${
                    tier.popular
                      ? 'border-blue-500 border-2 shadow-2xl shadow-blue-500/20'
                      : 'border-gray-800'
                  }`}
                >
                  {/* Badge */}
                  {tier.badge && (
                    <div className={`absolute top-4 right-4 ${tier.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                      {tier.badge}
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl ${tier.popular ? 'bg-blue-600' : 'bg-gray-800'} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">{tier.name}</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-gray-400">
                      {tier.description}
                    </CardDescription>

                    {/* Price */}
                    <div className="mt-6">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">
                          ${price === 0 ? '0' : price.toFixed(2).split('.')[0]}
                        </span>
                        {price > 0 && (
                          <>
                            <span className="text-2xl text-gray-400">
                              .{price.toFixed(2).split('.')[1]}
                            </span>
                            <span className="text-gray-500">
                              /{billingCycle === 'monthly' ? 'mes' : 'año'}
                            </span>
                          </>
                        )}
                      </div>
                      {billingCycle === 'annual' && price > 0 && (
                        <p className="text-sm text-green-400 mt-2">
                          ${(price / 12).toFixed(2)}/mes (2 meses gratis)
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 flex flex-col">
                    {/* CTA Button */}
                    <Button
                      onClick={() => handleSelectPlan(tier.id)}
                      disabled={isCurrentPlan}
                      className={`w-full mb-6 ${
                        tier.popular
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                      size="lg"
                    >
                      {isCurrentPlan ? (
                        'Plan Actual'
                      ) : (
                        <>
                          {tier.cta}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>

                    {/* Features */}
                    <div className="space-y-6 flex-1">
                      {tier.features.map((category) => (
                        <div key={category.category}>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                            {category.category}
                          </h4>
                          <ul className="space-y-2">
                            {category.items.map((item, idx) => (
                              <li
                                key={idx}
                                className={`flex items-start gap-2 text-sm ${
                                  item.included ? 'text-gray-300' : 'text-gray-600'
                                } ${item.highlight ? 'font-semibold' : ''}`}
                              >
                                {item.included ? (
                                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                ) : (
                                  <X className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                                )}
                                <span>{item.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ / Benefits Section */}
        <motion.div
          className="mt-20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Por qué Backtester Pro?
          </h2>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-gray-800/30 rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                15 Módulos de IA
              </h3>
              <p className="text-gray-400">
                La suite de IA más completa del mercado: Advisors, Predictors, Quantum Risk, Copilot y más.
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Datos Reales
              </h3>
              <p className="text-gray-400">
                Integración directa con Polygon.io para datos precisos de mercado en tiempo real.
              </p>
            </div>

            <div className="bg-gray-800/30 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Valor Insuperable
              </h3>
              <p className="text-gray-400">
                Herramientas que costarían $500+/mes en otras plataformas, aquí desde $89.99/mes.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Money Back Guarantee */}
        <motion.div
          className="mt-16 text-center bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl p-8 border border-blue-500/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-2xl font-bold text-white mb-3">
            Garantía de 14 días
          </h3>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Prueba Professional o Enterprise sin riesgo. Si no estás satisfecho en los primeros 14 días,
            te devolvemos el 100% de tu dinero. Sin preguntas.
          </p>
        </motion.div>
      </div>
    </div>
  )
}
