"use client"

import React, { useState, useEffect } from 'react'
import { useOmegaLive } from '@/contexts/OmegaLiveProvider'
import { OmegaCard } from '@/components/omega-ui/OmegaCard'
import { OmegaBadge } from '@/components/omega-ui/OmegaBadge'
import { OmegaSkeleton } from '@/components/omega-ui/OmegaSkeleton'
import { Newspaper, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NewsItem {
    headline: string
    sentiment: 'positive' | 'neutral' | 'negative'
    impact?: 'low' | 'medium' | 'high'
    timestamp: number
    id?: string
}

export const NewsFeedPanel: React.FC = () => {
    const { news, connected } = useOmegaLive()
    const [newsHistory, setNewsHistory] = useState<NewsItem[]>([])

    // Add incoming news to history
    useEffect(() => {
        if (news) {
            const newsItem: NewsItem = {
                ...news,
                id: `${news.timestamp}-${Math.random()}`, // Unique ID for animations
            }
            setNewsHistory(prev => [newsItem, ...prev].slice(0, 50)) // Keep last 50 items
        }
    }, [news])

    return <NewsFeedContent newsHistory={newsHistory} connected={connected} />
}

interface NewsFeedContentProps {
    newsHistory: NewsItem[];
    connected: boolean;
}

const NewsFeedContent = React.memo(({ newsHistory, connected }: NewsFeedContentProps) => {
    // Format timestamp
    const formatTime = (timestamp: number): string => {
        const date = new Date(timestamp)
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    }

    // Get sentiment styling
    const getSentimentStyle = (sentiment: 'positive' | 'neutral' | 'negative') => {
        switch (sentiment) {
            case 'positive':
                return {
                    color: 'text-emerald-400',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/30',
                    glow: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
                    icon: <TrendingUp className="w-3 h-3" />
                }
            case 'negative':
                return {
                    color: 'text-red-400',
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    glow: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
                    icon: <TrendingDown className="w-3 h-3" />
                }
            default:
                return {
                    color: 'text-amber-400',
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    glow: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
                    icon: <Minus className="w-3 h-3" />
                }
        }
    }

    // Get impact styling
    const getImpactStyle = (impact?: 'low' | 'medium' | 'high') => {
        if (!impact) return null

        switch (impact) {
            case 'high':
                return {
                    color: 'text-red-500',
                    label: 'HIGH',
                    barColor: 'bg-red-500',
                    pulse: true
                }
            case 'medium':
                return {
                    color: 'text-orange-400',
                    label: 'MED',
                    barColor: 'bg-orange-400',
                    pulse: false
                }
            case 'low':
                return {
                    color: 'text-cyan-400',
                    label: 'LOW',
                    barColor: 'bg-cyan-400',
                    pulse: false
                }
        }
    }

    return (
        <OmegaCard
            className="h-full flex flex-col"
            glow={connected ? "purple" : "none"}
            title={
                <>
                    <Newspaper className={`w-4 h-4 ${connected ? 'text-purple-400' : 'text-gray-600'}`} />
                    MARKET NEWS
                    <span className="text-[10px] font-mono text-gray-500">v20</span>
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
                <p className="text-[10px] text-gray-500 font-mono mb-3 -mt-2">Real-Time Macro & Crypto Feed</p>

                {/* News List (Scrollable) */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {newsHistory.length > 0 ? (
                        <AnimatePresence initial={false}>
                            {newsHistory.map((item, index) => {
                                const sentimentStyle = getSentimentStyle(item.sentiment)
                                const impactStyle = getImpactStyle(item.impact)

                                return (
                                    <motion.div
                                        key={item.id || index}
                                        initial={{ opacity: 0, x: -20, height: 0 }}
                                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                                        exit={{ opacity: 0, x: 20, height: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeOut' }}
                                        className="relative"
                                    >
                                        {/* Impact Bar (left side glow) */}
                                        {impactStyle && (
                                            <motion.div
                                                className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${impactStyle.barColor}`}
                                                animate={impactStyle.pulse ? { opacity: [0.5, 1, 0.5] } : {}}
                                                transition={impactStyle.pulse ? { duration: 2, repeat: Infinity } : {}}
                                            />
                                        )}

                                        <div
                                            className={`
                            relative pl-3 pr-3 py-3 rounded-lg 
                            ${sentimentStyle.bg} 
                            border ${sentimentStyle.border}
                            ${sentimentStyle.glow}
                            hover:bg-white/5 transition-colors cursor-default
                          `}
                                        >
                                            {/* Header: Sentiment + Impact + Time */}
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    {/* Sentiment Badge */}
                                                    <div className={`flex items-center gap-1 ${sentimentStyle.color}`}>
                                                        {sentimentStyle.icon}
                                                        <span className="text-[9px] font-mono uppercase font-bold">
                                                            {item.sentiment}
                                                        </span>
                                                    </div>

                                                    {/* Impact Badge */}
                                                    {impactStyle && (
                                                        <OmegaBadge
                                                            className={`${impactStyle.color} bg-black/30 border-current text-[8px] px-1.5 py-0 font-mono font-bold`}
                                                        >
                                                            {impactStyle.label}
                                                        </OmegaBadge>
                                                    )}
                                                </div>

                                                {/* Timestamp */}
                                                <span className="text-[9px] text-gray-500 font-mono">
                                                    {formatTime(item.timestamp)}
                                                </span>
                                            </div>

                                            {/* Headline */}
                                            <p className="text-sm text-white font-semibold leading-tight">
                                                {item.headline}
                                            </p>

                                            {/* Breaking News indicator for high impact */}
                                            {item.impact === 'high' && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                                    transition={{ duration: 1.5, repeat: Infinity }}
                                                    className="mt-2 flex items-center gap-1 text-red-500"
                                                >
                                                    <AlertCircle className="w-3 h-3" />
                                                    <span className="text-[9px] font-mono font-bold uppercase">
                                                        Breaking News
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
                            {connected ? (
                                <>
                                    <div className="w-full p-3 rounded-lg border border-gray-800 bg-white/5">
                                        <OmegaSkeleton className="h-3 w-20 mb-2" />
                                        <OmegaSkeleton className="h-4 w-full" />
                                    </div>
                                    <div className="w-full p-3 rounded-lg border border-gray-800 bg-white/5">
                                        <OmegaSkeleton className="h-3 w-20 mb-2" />
                                        <OmegaSkeleton className="h-4 w-full" />
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-mono mt-4">Waiting for news stream...</p>
                                </>
                            ) : (
                                <div className="text-center">
                                    <Newspaper className="w-8 h-8 mx-auto text-gray-700 mb-2" />
                                    <p className="text-xs text-gray-600 font-mono">News feed offline.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Stats */}
                <footer className="text-[9px] text-gray-500 font-mono pt-3 border-t border-gray-800/50 flex items-center justify-between flex-shrink-0 mt-auto">
                    <span>Total: {newsHistory.length} updates</span>
                    <span className={connected ? "text-purple-400" : "text-gray-600"}>
                        ● {connected ? 'STREAMING' : 'DISCONNECTED'}
                    </span>
                </footer>
            </div>
        </OmegaCard>
    )
})
NewsFeedContent.displayName = 'NewsFeedContent'
