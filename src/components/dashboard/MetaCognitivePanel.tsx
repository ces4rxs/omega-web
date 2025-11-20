"use client"

import React from 'react'
import { useOmegaLive } from '@/contexts/OmegaLiveProvider'
import { Badge } from '@/components/ui/badge'
import { Brain, Activity, TrendingUp, Zap, Clock } from 'lucide-react'

export const MetaCognitivePanel: React.FC = () => {
    const { meta, connected } = useOmegaLive()

    // Helper to format uptime (seconds to readable format)
    const formatUptime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        if (hours > 0) return `${hours}h ${minutes}m`
        return `${minutes}m`
    }

    // Helper to get status color and variant
    const getStatusInfo = (status?: string) => {
        if (!status) return { variant: 'outline' as const, color: 'text-gray-500', label: 'UNKNOWN' }
        const s = status.toUpperCase()
        if (s.includes('STABLE') || s.includes('ACTIVE')) {
            return { variant: 'success' as const, color: 'text-emerald-400', label: s }
        }
        if (s.includes('LEARNING') || s.includes('TRAINING')) {
            return { variant: 'warning' as const, color: 'text-amber-400', label: s }
        }
        if (s.includes('DEGRADED') || s.includes('ERROR')) {
            return { variant: 'destructive' as const, color: 'text-red-400', label: s }
        }
        return { variant: 'outline' as const, color: 'text-cyan-400', label: s }
    }

    // Placeholder state when waiting for data
    if (!connected) {
        return (
            <div className="relative rounded-xl border border-gray-800/60 bg-black/40 backdrop-blur-sm p-4 h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto border-2 border-gray-700 border-t-cyan-500 rounded-full animate-spin opacity-50" />
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                            CONNECTING TO OMEGA CORE...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    if (!meta) {
        return (
            <div className="relative rounded-xl border border-gray-800/60 bg-black/40 backdrop-blur-sm p-4 h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <Brain className="w-8 h-8 mx-auto text-gray-700 animate-pulse" />
                        <p className="text-xs text-gray-600 font-mono uppercase tracking-wider">
                            WAITING FOR META_UPDATE_V18...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    const statusInfo = getStatusInfo(meta.status)
    const activeStrategies = meta.active_strategies ?? 0
    const uptime = meta.uptime ?? 0
    const timestamp = meta.timestamp ? new Date(meta.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '--:--:--'

    // Extract additional metrics if they exist
    const globalScore = meta.global_score ?? meta.score ?? null
    const sharpeProxy = meta.sharpe ?? meta.sharpe_ratio ?? null
    const winRate = meta.win_rate ?? meta.winrate ?? null
    const activeModels = meta.active_models ?? meta.models ?? null

    return (
        <div className="relative rounded-xl border border-gray-800/60 bg-black/40 backdrop-blur-sm p-4 space-y-4 shadow-[0_0_30px_rgba(8,145,178,0.05)] h-full flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between pb-3 border-b border-gray-800/50">
                <div>
                    <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <Brain className="w-4 h-4 text-cyan-400" />
                        META INTELLIGENCE
                        <span className="text-[10px] font-mono text-gray-500">v18</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">Adaptive Strategy Brain</p>
                </div>
                <Badge variant={statusInfo.variant} className="font-mono text-[9px] px-2 py-0.5">
                    {statusInfo.label}
                </Badge>
            </header>

            {/* KPIs Grid */}
            <section className="grid grid-cols-2 gap-3 flex-shrink-0">
                {/* Active Strategies */}
                <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-3 h-3 text-cyan-400" />
                        <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Active Strategies</p>
                    </div>
                    <p className="text-2xl font-bold text-cyan-400 font-mono">{activeStrategies}</p>
                </div>

                {/* Global Score (if available) */}
                {globalScore !== null && (
                    <div className="bg-gradient-to-br from-emerald-500/5 to-green-500/5 border border-emerald-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Global Score</p>
                        </div>
                        <p className="text-2xl font-bold text-emerald-400 font-mono">
                            {typeof globalScore === 'number' ? `${(globalScore * 100).toFixed(1)}%` : globalScore}
                        </p>
                    </div>
                )}

                {/* Sharpe Proxy (if available) */}
                {sharpeProxy !== null && (
                    <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-3 h-3 text-purple-400" />
                            <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Sharpe Proxy</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-400 font-mono">
                            {typeof sharpeProxy === 'number' ? sharpeProxy.toFixed(2) : sharpeProxy}
                        </p>
                    </div>
                )}

                {/* Win Rate (if available) */}
                {winRate !== null && (
                    <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Win Rate</p>
                        </div>
                        <p className="text-2xl font-bold text-amber-400 font-mono">
                            {typeof winRate === 'number' ? `${(winRate * 100).toFixed(1)}%` : winRate}
                        </p>
                    </div>
                )}

                {/* Uptime */}
                {!globalScore && !sharpeProxy && !winRate && (
                    <div className="bg-gradient-to-br from-gray-500/5 to-gray-600/5 border border-gray-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Uptime</p>
                        </div>
                        <p className="text-2xl font-bold text-gray-300 font-mono">{formatUptime(uptime)}</p>
                    </div>
                )}
            </section>

            {/* Active Models List (scrollable) */}
            <section className="flex-1 overflow-hidden flex flex-col">
                <h3 className="text-[10px] uppercase text-gray-500 font-mono tracking-wider mb-2">Active Models</h3>
                {activeModels && Array.isArray(activeModels) && activeModels.length > 0 ? (
                    <div className="space-y-2 overflow-y-auto flex-1 pr-1">
                        {activeModels.map((model: any, idx: number) => {
                            const modelName = model.name ?? model.id ?? `Model ${idx + 1}`
                            const modelType = model.type ?? model.role ?? 'Strategy'
                            const modelWeight = model.weight ?? model.allocation ?? 0
                            const weightColor = modelWeight > 0.3 ? 'text-emerald-400' : modelWeight > 0.1 ? 'text-amber-400' : 'text-gray-500'

                            return (
                                <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white/5 hover:bg-white/10 rounded-lg border border-gray-800/40 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-white truncate font-mono">{modelName}</p>
                                        <p className="text-[10px] text-gray-500 truncate">{modelType}</p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-3">
                                        <span className={`text-xs font-bold font-mono ${weightColor}`}>
                                            {typeof modelWeight === 'number' ? `${(modelWeight * 100).toFixed(0)}%` : modelWeight}
                                        </span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-[10px] text-gray-600 font-mono text-center">
                            No active models reported by META v18 yet.
                        </p>
                    </div>
                )}
            </section>

            {/* System State Footer */}
            <footer className="text-[9px] text-gray-500 font-mono pt-3 border-t border-gray-800/50 space-y-1 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <span>Last Update:</span>
                    <span className="text-gray-400">{timestamp}</span>
                </div>
                {uptime > 0 && (
                    <div className="flex items-center justify-between">
                        <span>System Uptime:</span>
                        <span className="text-gray-400">{formatUptime(uptime)}</span>
                    </div>
                )}
                <div className="pt-1">
                    <span className={statusInfo.color}>● </span>
                    <span>
                        {meta.status === 'STABLE' || meta.status === 'ACTIVE'
                            ? 'System in STABLE mode.'
                            : meta.status === 'LEARNING'
                                ? 'Rebalancing strategies...'
                                : 'Collecting more data...'}
                    </span>
                </div>
            </footer>
        </div>
    )
}
