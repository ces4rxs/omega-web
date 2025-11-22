"use client"

import React from 'react'
import { useOmegaLive } from '@/contexts/OmegaLiveProvider'
import { OmegaCard } from '@/components/omega-ui/OmegaCard'
import { OmegaBadge } from '@/components/omega-ui/OmegaBadge'
import { OmegaSkeleton } from '@/components/omega-ui/OmegaSkeleton'
import {
    Briefcase, TrendingUp, Shield, AlertTriangle,
    Activity, Zap, Clock, Target, AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'

export const PortfolioPanel: React.FC = () => {
    const { portfolio, connected, fusion, meta, news } = useOmegaLive()

    // Helper: Format percentage
    const formatPercent = (value: number): string => {
        return `${(value * 100).toFixed(1)}%`
    }

    // Helper: Get weight color
    const getWeightColor = (weight: number): string => {
        if (weight >= 0.40) return 'text-cyan-400 bg-cyan-500/20'
        if (weight >= 0.20) return 'text-amber-400 bg-amber-500/20'
        return 'text-purple-400 bg-purple-500/20'
    }

    // Helper: Get risk color
    const getRiskColor = (score: number): string => {
        if (score < 0.3) return 'text-emerald-400'
        if (score < 0.6) return 'text-amber-400'
        return 'text-red-400'
    }

    // Helper: Get correlation color
    const getCorrelationColor = (value: number): string => {
        const absValue = Math.abs(value)
        if (absValue >= 0.8) return 'bg-red-500/20 text-red-400'
        if (absValue >= 0.5) return 'bg-amber-500/20 text-amber-400'
        if (absValue >= 0.2) return 'bg-cyan-500/20 text-cyan-400'
        return 'bg-emerald-500/20 text-emerald-400'
    }

    // Helper: Get priority styling
    const getPriorityStyle = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
        switch (priority) {
            case 'HIGH':
                return {
                    color: 'text-red-500',
                    bg: 'bg-red-500/20',
                    border: 'border-red-500/30',
                    barColor: 'bg-red-500'
                }
            case 'MEDIUM':
                return {
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/20',
                    border: 'border-amber-500/30',
                    barColor: 'bg-amber-400'
                }
            case 'LOW':
                return {
                    color: 'text-cyan-400',
                    bg: 'bg-cyan-500/20',
                    border: 'border-cyan-500/30',
                    barColor: 'bg-cyan-400'
                }
        }
    }

    return (
        <OmegaCard
            className="h-full flex flex-col"
            glow={connected ? "blue" : "none"}
            title={
                <>
                    <Briefcase className={`w-4 h-4 ${connected ? 'text-indigo-400' : 'text-gray-600'}`} />
                    PORTFOLIO INTELLIGENCE
                    <span className="text-[10px] font-mono text-gray-500">v21</span>
                </>
            }
            action={
                <OmegaBadge variant={connected ? "success" : "outline"} dot>
                    {connected ? 'LIVE' : 'OFFLINE'}
                </OmegaBadge>
            }
        >
            <div className="flex flex-col h-full">
                {/* Subtitle */}
                <p className="text-[10px] text-gray-500 font-mono mb-3 -mt-2">AI-Driven Optimal Exposure & Correlation</p>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">

                    {portfolio ? (
                        <>
                            {/* 1️⃣ SUGGESTED PORTFOLIO ALLOCATION */}
                            <section className="space-y-2">
                                <h3 className="text-[10px] uppercase text-gray-500 font-mono tracking-wider flex items-center gap-2">
                                    <Target className="w-3 h-3" />
                                    Suggested Allocation
                                </h3>
                                <div className="space-y-2">
                                    {portfolio.allocations.map((allocation, idx) => {
                                        const weightColor = getWeightColor(allocation.weight)

                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="bg-white/5 border border-gray-800/40 rounded-lg p-2 hover:bg-white/10 transition-colors"
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-white font-mono">{allocation.asset}</span>
                                                        {allocation.price && (
                                                            <span className="text-[9px] text-gray-500">${allocation.price.toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-xs font-bold font-mono ${weightColor.split(' ')[0]}`}>
                                                        {formatPercent(allocation.weight)}
                                                    </span>
                                                </div>

                                                {/* Weight Bar */}
                                                <div className="h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        className={`h-full ${weightColor.split(' ')[1]}`}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${allocation.weight * 100}%` }}
                                                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                                                    />
                                                </div>

                                                {allocation.contribution !== undefined && (
                                                    <div className="mt-1 text-[9px] text-gray-500 font-mono">
                                                        Contribution: {formatPercent(allocation.contribution)}
                                                    </div>
                                                )}
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </section>

                            {/* 2️⃣ RISK & OPPORTUNITY SCORES */}
                            <section className="grid grid-cols-2 gap-3">
                                {/* Risk Score */}
                                <div className="bg-gradient-to-br from-red-500/5 to-orange-500/5 border border-red-500/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="w-3 h-3 text-red-400" />
                                        <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Risk Score</p>
                                    </div>
                                    <p className={`text-2xl font-bold font-mono ${getRiskColor(portfolio.risk.score)}`}>
                                        {formatPercent(portfolio.risk.score)}
                                    </p>
                                    <div className="mt-2 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                                        <motion.div
                                            className={`h-full ${getRiskColor(portfolio.risk.score).replace('text-', 'bg-')}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${portfolio.risk.score * 100}%` }}
                                            transition={{ duration: 1 }}
                                        />
                                    </div>
                                </div>

                                {/* Opportunity Score */}
                                <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-3 h-3 text-cyan-400" />
                                        <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Opportunity</p>
                                    </div>
                                    <p className="text-2xl font-bold text-cyan-400 font-mono">
                                        {formatPercent(portfolio.risk.opportunity_score)}
                                    </p>
                                    <div className="mt-2 h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-cyan-400"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${portfolio.risk.opportunity_score * 100}%` }}
                                            transition={{ duration: 1 }}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* 3️⃣ VOLATILITY & RISK METRICS */}
                            <section className="bg-white/5 border border-gray-800/40 rounded-lg p-3 space-y-2">
                                <h3 className="text-[10px] uppercase text-gray-500 font-mono tracking-wider flex items-center gap-2">
                                    <Activity className="w-3 h-3" />
                                    System Metrics
                                </h3>

                                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                                    {portfolio.risk.volatility_estimate !== undefined && (
                                        <div>
                                            <span className="text-gray-500">Volatility:</span>
                                            <span className="text-white ml-2">{(portfolio.risk.volatility_estimate * 100).toFixed(2)}%</span>
                                        </div>
                                    )}

                                    {portfolio.calculation_time_ms && (
                                        <div>
                                            <span className="text-gray-500">Calc Time:</span>
                                            <span className="text-white ml-2">{portfolio.calculation_time_ms}ms</span>
                                        </div>
                                    )}

                                    {portfolio.model_version && (
                                        <div>
                                            <span className="text-gray-500">Model:</span>
                                            <span className="text-white ml-2">{portfolio.model_version}</span>
                                        </div>
                                    )}

                                    {portfolio.reliability_from_v18 !== undefined && (
                                        <div>
                                            <span className="text-gray-500">Reliability:</span>
                                            <span className="text-emerald-400 ml-2">{formatPercent(portfolio.reliability_from_v18)}</span>
                                        </div>
                                    )}

                                    {portfolio.fusion_action_from_v19 && (
                                        <div>
                                            <span className="text-gray-500">Fusion:</span>
                                            <span className="text-cyan-400 ml-2">{portfolio.fusion_action_from_v19}</span>
                                        </div>
                                    )}

                                    {portfolio.news_impact_from_v20?.sentiment && (
                                        <div>
                                            <span className="text-gray-500">News:</span>
                                            <span className="text-purple-400 ml-2">{portfolio.news_impact_from_v20.sentiment}</span>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* 4️⃣ CORRELATION MATRIX VIEWER */}
                            {portfolio.correlations && portfolio.correlations.length > 0 && (
                                <section className="space-y-2">
                                    <h3 className="text-[10px] uppercase text-gray-500 font-mono tracking-wider flex items-center gap-2">
                                        <Zap className="w-3 h-3" />
                                        Correlation Matrix
                                    </h3>
                                    <div className="bg-white/5 border border-gray-800/40 rounded-lg p-2 space-y-1">
                                        {portfolio.correlations.slice(0, 8).map((corr, idx) => (
                                            <div key={idx} className="flex items-center justify-between text-[10px] font-mono">
                                                <span className="text-gray-400">
                                                    {corr.asset1} × {corr.asset2}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded ${getCorrelationColor(corr.value)}`}>
                                                    {corr.value.toFixed(3)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 5️⃣ AI SUGGESTIONS (Bloomberg Style) */}
                            {portfolio.suggestions && portfolio.suggestions.length > 0 && (
                                <section className="space-y-2">
                                    <h3 className="text-[10px] uppercase text-gray-500 font-mono tracking-wider flex items-center gap-2">
                                        <AlertTriangle className="w-3 h-3" />
                                        AI Suggestions
                                    </h3>
                                    <div className="space-y-2">
                                        {portfolio.suggestions.map((suggestion, idx) => {
                                            const priorityStyle = getPriorityStyle(suggestion.priority)

                                            return (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="relative"
                                                >
                                                    {/* Priority Bar */}
                                                    {suggestion.priority === 'HIGH' && (
                                                        <motion.div
                                                            className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${priorityStyle.barColor}`}
                                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                                            transition={{ duration: 2, repeat: Infinity }}
                                                        />
                                                    )}

                                                    <div className={`pl-3 pr-3 py-2 rounded-lg ${priorityStyle.bg} border ${priorityStyle.border} hover:bg-white/5 transition-colors`}>
                                                        <div className="flex items-start justify-between gap-2 mb-1">
                                                            <OmegaBadge className={`${priorityStyle.color} bg-black/30 border-current text-[8px] px-1.5 py-0 font-mono font-bold`}>
                                                                {suggestion.priority}
                                                            </OmegaBadge>
                                                            <span className="text-[9px] text-gray-500 font-mono">{suggestion.action}</span>
                                                        </div>

                                                        <p className="text-xs text-white mb-2">{suggestion.description}</p>

                                                        {suggestion.assets && suggestion.assets.length > 0 && (
                                                            <div className="flex flex-wrap gap-1 mb-2">
                                                                {suggestion.assets.map((asset, i) => (
                                                                    <span key={i} className="text-[9px] px-1.5 py-0.5 bg-white/10 text-gray-300 rounded font-mono">
                                                                        {asset}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {suggestion.expected_impact && (
                                                            <div className="text-[9px] font-mono text-gray-500 space-y-0.5">
                                                                {suggestion.expected_impact.risk_reduction !== undefined && (
                                                                    <div>Risk Reduction: <span className="text-emerald-400">{formatPercent(suggestion.expected_impact.risk_reduction)}</span></div>
                                                                )}
                                                                {suggestion.expected_impact.return_increase !== undefined && (
                                                                    <div>Return Increase: <span className="text-cyan-400">{formatPercent(suggestion.expected_impact.return_increase)}</span></div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )
                                        })}
                                    </div>
                                </section>
                            )}
                        </>
                    ) : (
                        <div className="space-y-4">
                            {/* Skeleton Allocation */}
                            <div className="space-y-2">
                                <OmegaSkeleton className="h-3 w-24" />
                                <OmegaSkeleton className="h-12 w-full" />
                                <OmegaSkeleton className="h-12 w-full delay-75" />
                            </div>

                            {/* Skeleton Scores */}
                            <div className="grid grid-cols-2 gap-3">
                                <OmegaSkeleton className="h-24" />
                                <OmegaSkeleton className="h-24" />
                            </div>

                            <div className="flex items-center justify-center pt-8 opacity-50">
                                <p className="text-[10px] text-gray-500 font-mono">
                                    {connected ? 'Waiting for portfolio calculation...' : 'Portfolio engine offline.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="text-[9px] text-gray-500 font-mono pt-3 border-t border-gray-800/50 flex items-center justify-between flex-shrink-0 mt-auto">
                    <span>
                        Last Update: {portfolio ? new Date(portfolio.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'}
                    </span>
                    <span className={connected ? "text-indigo-400" : "text-gray-600"}>
                        ● {connected ? 'COMPUTING' : 'DISCONNECTED'}
                    </span>
                </footer>
            </div>
        </OmegaCard>
    )
}
