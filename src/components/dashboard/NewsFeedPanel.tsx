"use client"

import React, { useState, useEffect } from 'react'
import { useOmegaLive } from '@/contexts/OmegaLiveProvider'
import { Badge } from '@/components/ui/badge'
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

    // Placeholder when not connected
    if (!connected) {
        return (
            <div className="relative rounded-xl border border-gray-800/50 bg-black/40 backdrop-blur-sm p-4 h-full flex flex-col">
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-3">
                        <div className="w-12 h-12 mx-auto border-2 border-gray-700 border-t-purple-500 rounded-full animate-spin opacity-50" />
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">
                            &gt; CONNECTING TO NEWS STREAM...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Placeholder when no news yet
    if (newsHistory.length === 0) {
        return (
            <div className="relative rounded-xl border border-gray-800/50 bg-black/40 backdrop-blur-sm p-4 h-full flex flex-col">
                <header className="flex items-center justify-between pb-3 border-b border-gray-800/50 mb-4">
                    <div>
                        <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                            <Newspaper className="w-4 h-4 text-purple-400" />
                            MARKET NEWS
                            <span className="text-[10px] font-mono text-gray-500">v20</span>
                        </h2>
                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">Real-Time Macro & Crypto Feed</p>
                    </div>
                    <Badge variant="outline" className="font-mono text-[9px] px-2 py-0.5 border-purple-500/30 text-purple-400">
                        LIVE
                    </Badge>
                </header>

                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <Newspaper className="w-8 h-8 mx-auto text-gray-700 animate-pulse" />
                        <p className="text-xs text-gray-600 font-mono uppercase tracking-wider">
                            &gt; WAITING FOR NEWS_UPDATE_V20...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="relative rounded-xl border border-gray-800/50 bg-black/40 backdrop-blur-sm p-4 space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.05)] h-full flex flex-col">
            {/* Header */}
            <header className="flex items-center justify-between pb-3 border-b border-gray-800/50 flex-shrink-0">
                <div>
                    <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-purple-400" />
                        MARKET NEWS
                        <span className="text-[10px] font-mono text-gray-500">v20</span>
                    </h2>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">Real-Time Macro & Crypto Feed</p>
                </div>
                <Badge variant="success" className="font-mono text-[9px] px-2 py-0.5 bg-purple-500/20 border-purple-500/30 text-purple-400">
                    LIVE
                </Badge>
            </header>

            {/* News List (Scrollable) */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
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
                                                <Badge
                                                    className={`${impactStyle.color} bg-black/30 border-current text-[8px] px-1.5 py-0 font-mono font-bold`}
                                                >
                                                    {impactStyle.label}
                                                </Badge>
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
            </div>

            {/* Footer Stats */}
            <footer className="text-[9px] text-gray-500 font-mono pt-3 border-t border-gray-800/50 flex items-center justify-between flex-shrink-0">
                <span>Total: {newsHistory.length} updates</span>
                <span className="text-purple-400">● STREAMING</span>
            </footer>
        </div>
    )
}
