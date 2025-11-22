"use client"

import React from 'react'
import { useOmegaLive } from '@/contexts/OmegaLiveProvider'
import { OmegaCard } from '@/components/omega-ui/OmegaCard'
import { OmegaBadge } from '@/components/omega-ui/OmegaBadge'
import { OmegaSkeleton } from '@/components/omega-ui/OmegaSkeleton'
import { Brain, Activity, TrendingUp, Zap, Clock } from 'lucide-react'

export const MetaCognitivePanel: React.FC = () => {
    const { meta, connected } = useOmegaLive()

    return <MetaCognitiveContent meta={meta} connected={connected} />
}

interface MetaCognitiveContentProps {
    meta: any; // typed as OmegaMeta | null in context but keeping flexible here
    connected: boolean;
}

const MetaCognitiveContent = React.memo(({ meta, connected }: MetaCognitiveContentProps) => {
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
            return { variant: 'danger' as const, color: 'text-red-400', label: s }
        }
        return { variant: 'outline' as const, color: 'text-cyan-400', label: s }
    }

    // Status determination
    const currentStatus = !connected ? 'OFFLINE' : !meta ? 'CONNECTING' : meta.status;
    const statusInfo = getStatusInfo(currentStatus);

    // Safe access to metrics with fallbacks
    const activeStrategies = meta?.active_strategies ?? '--';
    const uptime = meta?.uptime ?? 0;
    const timestamp = meta?.timestamp
        ? new Date(meta.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        : '--:--:--';

    // Extract additional metrics if they exist
    const globalScore = meta?.global_score ?? meta?.score ?? null;
    const sharpeProxy = meta?.sharpe ?? meta?.sharpe_ratio ?? null;
    const winRate = meta?.win_rate ?? meta?.winrate ?? null;
    const activeModels = meta?.active_models ?? meta?.models ?? [];

    return (
        <OmegaCard
            className="h-full flex flex-col"
            glow={connected ? "blue" : "none"}
            title={
                <>
                    <Brain className={`w-4 h-4 ${connected ? 'text-cyan-400' : 'text-gray-600'}`} />
                    META INTELLIGENCE
                    <span className="text-[10px] font-mono text-gray-500">v18</span>
                </>
            }
            action={
                <OmegaBadge variant={statusInfo.variant} dot>
                    {statusInfo.label}
                </OmegaBadge>
            }
        >
            <div className="flex flex-col h-full gap-4">
                {/* KPIs Grid */}
                <section className="grid grid-cols-2 gap-3 flex-shrink-0">
                    {/* Active Strategies */}
                    <div className="bg-gradient-to-br from-cyan-500/5 to-blue-500/5 border border-cyan-500/20 rounded-lg p-3 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="w-3 h-3 text-cyan-400" />
                            <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Active Strategies</p>
                        </div>
                        <p className="text-2xl font-bold text-cyan-400 font-mono">
                            {activeStrategies}
                        </p>
                        {!meta && connected && <OmegaSkeleton className="absolute inset-0 bg-cyan-500/5" />}
                    </div>

                    {/* Global Score */}
                    <div className="bg-gradient-to-br from-emerald-500/5 to-green-500/5 border border-emerald-500/20 rounded-lg p-3 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Global Score</p>
                        </div>
                        <p className="text-2xl font-bold text-emerald-400 font-mono">
                            {globalScore !== null ? (typeof globalScore === 'number' ? `${(globalScore * 100).toFixed(1)}%` : globalScore) : '--'}
                        </p>
                        {!meta && connected && <OmegaSkeleton className="absolute inset-0 bg-emerald-500/5" />}
                    </div>

                    {/* Sharpe Proxy */}
                    <div className="bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/20 rounded-lg p-3 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-3 h-3 text-purple-400" />
                            <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Sharpe Proxy</p>
                        </div>
                        <p className="text-2xl font-bold text-purple-400 font-mono">
                            {sharpeProxy !== null ? (typeof sharpeProxy === 'number' ? sharpeProxy.toFixed(2) : sharpeProxy) : '--'}
                        </p>
                        {!meta && connected && <OmegaSkeleton className="absolute inset-0 bg-purple-500/5" />}
                    </div>

                    {/* Win Rate */}
                    <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 rounded-lg p-3 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <p className="text-[9px] uppercase text-gray-500 font-mono tracking-wider">Win Rate</p>
                        </div>
                        <p className="text-2xl font-bold text-amber-400 font-mono">
                            {winRate !== null ? (typeof winRate === 'number' ? `${(winRate * 100).toFixed(1)}%` : winRate) : '--'}
                        </p>
                        {!meta && connected && <OmegaSkeleton className="absolute inset-0 bg-amber-500/5" />}
                    </div>
                </section>

                {/* Active Models List */}
                <section className="flex-1 overflow-hidden flex flex-col">
                    <h3 className="text-[10px] uppercase text-gray-500 font-mono tracking-wider mb-2">Active Models</h3>
                    {activeModels && Array.isArray(activeModels) && activeModels.length > 0 ? (
                        <div className="space-y-2 overflow-y-auto flex-1 pr-1 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
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
                        <div className="flex-1 flex items-center justify-center flex-col gap-2">
                            {!meta && connected ? (
                                <>
                                    <OmegaSkeleton className="w-full h-8" />
                                    <OmegaSkeleton className="w-full h-8 delay-75" />
                                    <OmegaSkeleton className="w-full h-8 delay-150" />
                                </>
                            ) : (
                                <p className="text-[10px] text-gray-600 font-mono text-center">
                                    {connected ? 'No active models reported.' : 'System offline.'}
                                </p>
                            )}
                        </div>
                    )}
                </section>

                {/* System State Footer */}
                <footer className="text-[9px] text-gray-500 font-mono pt-3 border-t border-gray-800/50 space-y-1 flex-shrink-0 mt-auto">
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
                            {statusInfo.label === 'OFFLINE' ? 'Connection lost.' :
                                statusInfo.label === 'CONNECTING' ? 'Establishing neural link...' :
                                    meta?.status === 'STABLE' || meta?.status === 'ACTIVE'
                                        ? 'System in STABLE mode.'
                                        : meta?.status === 'LEARNING'
                                            ? 'Rebalancing strategies...'
                                            : 'Collecting more data...'}
                        </span>
                    </div>
                </footer>
            </div>
        </OmegaCard>
    )
})
MetaCognitiveContent.displayName = 'MetaCognitiveContent'
