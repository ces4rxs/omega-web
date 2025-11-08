"use client"

import { useAuth } from "@/contexts/AuthContext"

export type TierLevel = 'free' | 'professional' | 'enterprise'

interface TierFeatures {
  // Backtests
  backtestsPerMonth: number | 'unlimited'
  concurrentBacktests: number

  // Data & Charts
  realMarketData: boolean
  advancedIndicators: boolean

  // AI Features
  aiInsights: boolean
  quantumRisk: boolean
  aiOptimizer: boolean
  strategicAdvisor: boolean
  userBrainprint: boolean

  // ENTERPRISE AI
  predictiveScore: boolean
  aiCopilot: boolean
  monteCarlo: boolean
  autoTradingLoop: boolean
  neuralAdvisor: boolean

  // Professional Features
  backtestReplay: boolean
  performanceHeatmaps: boolean
  strategyComparison: boolean
  pdfExport: boolean
  watchlistSymbols: number

  // Team & Support
  teamMembers: number
  prioritySupport: boolean
  apiAccess: boolean
}

const TIER_HIERARCHY: Record<TierLevel, number> = {
  free: 0,
  professional: 1,
  enterprise: 2,
}

const TIER_FEATURES: Record<TierLevel, TierFeatures> = {
  free: {
    backtestsPerMonth: 5,
    concurrentBacktests: 1,
    realMarketData: false,
    advancedIndicators: false,
    aiInsights: false,
    quantumRisk: false,
    aiOptimizer: false,
    strategicAdvisor: false,
    userBrainprint: false,
    predictiveScore: false,
    aiCopilot: false,
    monteCarlo: false,
    autoTradingLoop: false,
    neuralAdvisor: false,
    backtestReplay: false,
    performanceHeatmaps: false,
    strategyComparison: false,
    pdfExport: false,
    watchlistSymbols: 5,
    teamMembers: 1,
    prioritySupport: false,
    apiAccess: false,
  },
  professional: {
    backtestsPerMonth: 'unlimited',
    concurrentBacktests: 3,
    realMarketData: true,
    advancedIndicators: true,
    aiInsights: true,
    quantumRisk: true,
    aiOptimizer: true,
    strategicAdvisor: true,
    userBrainprint: true,
    predictiveScore: false,
    aiCopilot: false,
    monteCarlo: false,
    autoTradingLoop: false,
    neuralAdvisor: false,
    backtestReplay: true,
    performanceHeatmaps: true,
    strategyComparison: true,
    pdfExport: true,
    watchlistSymbols: 20,
    teamMembers: 1,
    prioritySupport: false,
    apiAccess: false,
  },
  enterprise: {
    backtestsPerMonth: 'unlimited',
    concurrentBacktests: 10,
    realMarketData: true,
    advancedIndicators: true,
    aiInsights: true,
    quantumRisk: true,
    aiOptimizer: true,
    strategicAdvisor: true,
    userBrainprint: true,
    predictiveScore: true,
    aiCopilot: true,
    monteCarlo: true,
    autoTradingLoop: true,
    neuralAdvisor: true,
    backtestReplay: true,
    performanceHeatmaps: true,
    strategyComparison: true,
    pdfExport: true,
    watchlistSymbols: 50,
    teamMembers: 3,
    prioritySupport: true,
    apiAccess: true,
  },
}

export function useTier() {
  const { user, isAuthenticated } = useAuth()

  // Si no está autenticado, es tier free
  const currentTier: TierLevel = user?.subscription?.planId || 'free'

  // Verificar si tiene acceso a un tier específico
  const hasTier = (requiredTier: TierLevel): boolean => {
    if (!isAuthenticated) return requiredTier === 'free'

    const userTierLevel = TIER_HIERARCHY[currentTier]
    const requiredTierLevel = TIER_HIERARCHY[requiredTier]

    return userTierLevel >= requiredTierLevel
  }

  // Verificar si tiene acceso a una feature específica
  const hasFeature = (feature: keyof TierFeatures): boolean => {
    const features = TIER_FEATURES[currentTier]
    return Boolean(features[feature])
  }

  // Obtener el valor de una feature
  const getFeatureValue = <K extends keyof TierFeatures>(
    feature: K
  ): TierFeatures[K] => {
    return TIER_FEATURES[currentTier][feature]
  }

  // Verificar si la suscripción está activa
  const isSubscriptionActive = (): boolean => {
    if (!user?.subscription) return false
    return user.subscription.status === 'active'
  }

  // Obtener features del tier actual
  const features = TIER_FEATURES[currentTier]

  return {
    currentTier,
    features,
    isAuthenticated,
    hasTier,
    hasFeature,
    getFeatureValue,
    isSubscriptionActive,

    // Atajos convenientes
    isFree: currentTier === 'free',
    isProfessional: currentTier === 'professional',
    isEnterprise: currentTier === 'enterprise',

    // Verificaciones rápidas de acceso
    canUseAI: hasTier('professional'),
    canUsePredictiveAI: hasTier('enterprise'),
    canUseCopilot: hasTier('enterprise'),
    canUseAutoLoop: hasTier('enterprise'),
    canExportPDF: hasTier('professional'),
    canUseRealData: hasTier('professional'),
  }
}

// Componente de tier gate para envolver features
export function TierGate({
  requiredTier,
  feature,
  children,
  fallback,
}: {
  requiredTier?: TierLevel
  feature?: keyof TierFeatures
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { hasTier, hasFeature } = useTier()

  const hasAccess = requiredTier
    ? hasTier(requiredTier)
    : feature
    ? hasFeature(feature)
    : false

  if (!hasAccess) {
    return fallback || null
  }

  return <>{children}</>
}
