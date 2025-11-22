"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
    Activity,
    BarChart2,
    GitBranch,
    Zap,
    ArrowRight,
    TrendingUp,
    Shield,
    PieChart
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const analysisModules = [
    {
        title: "Correlation Matrix",
        description: "Analyze cross-asset correlations to optimize diversification and reduce systemic risk.",
        href: "/dashboard/analysis/correlation",
        icon: Zap,
        color: "text-yellow-400",
        bgColor: "bg-yellow-400/10",
        borderColor: "border-yellow-400/20",
        status: "LIVE"
    },
    {
        title: "Monte Carlo Simulation",
        description: "Project future portfolio performance using stochastic modeling and probability distributions.",
        href: "/dashboard/analysis/monte-carlo",
        icon: GitBranch,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/20",
        status: "BETA"
    },
    {
        title: "Risk Metrics",
        description: "Deep dive into VaR, Sharpe, Sortino, and other critical risk-adjusted performance indicators.",
        href: "/dashboard/analysis/risk-metrics",
        icon: Shield,
        color: "text-red-400",
        bgColor: "bg-red-400/10",
        borderColor: "border-red-400/20",
        status: "LIVE"
    },
    {
        title: "Walk Forward Analysis",
        description: "Validate strategy robustness by simulating trading over rolling time windows.",
        href: "/dashboard/analysis/walk-forward",
        icon: Activity,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        borderColor: "border-emerald-400/20",
        status: "PRO"
    }
]

export default function AnalysisPage() {
    return (
        <div className="p-6 space-y-8 min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900">
            {/* Header */}
            <div className="space-y-2">
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white tracking-tight flex items-center gap-3"
                >
                    <BarChart2 className="w-8 h-8 text-purple-500" />
                    Quantitative Analysis
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-gray-400 max-w-2xl"
                >
                    Advanced analytical tools to dissect market behavior, validate strategies, and optimize portfolio construction using institutional-grade metrics.
                </motion.p>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analysisModules.map((module, index) => (
                    <Link href={module.href} key={module.title}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 + 0.2 }}
                            whileHover={{ scale: 1.02 }}
                            className="h-full"
                        >
                            <Card className={`h-full bg-white/5 border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden group relative`}>
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-transparent via-transparent to-${module.color.split('-')[1]}-500/5`} />

                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className={`p-3 rounded-xl ${module.bgColor} ${module.borderColor} border`}>
                                            <module.icon className={`w-6 h-6 ${module.color}`} />
                                        </div>
                                        <Badge variant="outline" className="font-mono text-xs border-white/10">
                                            {module.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="mt-4 text-xl text-white group-hover:text-purple-400 transition-colors">
                                        {module.title}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <CardDescription className="text-gray-400 mb-4">
                                        {module.description}
                                    </CardDescription>

                                    <div className="flex items-center text-sm font-medium text-gray-500 group-hover:text-white transition-colors">
                                        Open Module <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* Quick Stats / Summary Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
            >
                <div className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center gap-4">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                        <PieChart className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-mono">Total Analyses</p>
                        <p className="text-lg font-bold text-white">1,284</p>
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-mono">Avg. Sharpe Ratio</p>
                        <p className="text-lg font-bold text-white">1.85</p>
                    </div>
                </div>

                <div className="p-4 rounded-lg border border-white/10 bg-white/5 flex items-center gap-4">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Activity className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-mono">Active Models</p>
                        <p className="text-lg font-bold text-white">8</p>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
