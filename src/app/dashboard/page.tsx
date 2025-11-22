"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  BarChart3,
  Target,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Crown,
  Brain,
  Shield,
  MessageSquare,
  Repeat,
  Lock
} from "lucide-react"
import { useTier } from "@/hooks/use-tier"
import { DashboardShell } from "@/components/layout/DashboardShell"
import { LiveDebugger } from "@/components/diagnostic/LiveDebugger"
import dynamic from 'next/dynamic'
import { OmegaSkeleton } from "@/components/omega-ui/OmegaSkeleton"

const MetaCognitivePanel = dynamic(
  () => import("@/components/dashboard/MetaCognitivePanel").then(mod => mod.MetaCognitivePanel),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white/5 rounded-xl border border-white/10 p-4"><OmegaSkeleton className="h-full w-full" /></div>
  }
)

const NewsFeedPanel = dynamic(
  () => import("@/components/dashboard/NewsFeedPanel").then(mod => mod.NewsFeedPanel),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white/5 rounded-xl border border-white/10 p-4"><OmegaSkeleton className="h-full w-full" /></div>
  }
)

const PortfolioPanel = dynamic(
  () => import("@/components/dashboard/PortfolioPanel").then(mod => mod.PortfolioPanel),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-white/5 rounded-xl border border-white/10 p-4"><OmegaSkeleton className="h-full w-full" /></div>
  }
)

export default function DashboardPage() {
  const router = useRouter()
  const { currentTier, isEnterprise, isProfessional, isFree, features } = useTier()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setUserName(user.name || user.email?.split('@')[0])
        } catch (e) {
          console.error('Error parsing user:', e)
        }
      }
    }
  }, [])

  return (
    <DashboardShell>
      {/* Bloomberg Terminal Professional Layout */}
      <div className="h-full p-4 space-y-4">

        {/* TOP ROW: 3-Column Grid (META / Content / NEWS) */}
        <div className="grid gap-4 lg:grid-cols-12 h-[60vh]">

          {/* LEFT: META Cognitive Panel (4 cols) */}
          <div className="lg:col-span-4 h-full">
            <MetaCognitivePanel />
          </div>

          {/* CENTER: Main Content (5 cols) */}
          <div className="lg:col-span-5 h-full overflow-y-auto space-y-4">
            {/* LiveDebugger for testing WebSocket */}
            {/* <LiveDebugger /> */}

            {/* Welcome Header */}
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">
                Bienvenido{userName ? `, ${userName}` : ""} 👋
              </h2>
              {isProfessional && (
                <span className="px-2 py-1 text-[10px] font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full">
                  PRO
                </span>
              )}
              {isEnterprise && (
                <span className="px-2 py-1 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  ENT
                </span>
              )}
            </div>
          </div>

          {/* RIGHT: News Feed Panel (3 cols) */}
          <div className="lg:col-span-3 h-full">
            <NewsFeedPanel />
          </div>

        </div>

        {/* BOTTOM ROW: Portfolio Intelligence Panel (Full Width) */}
        <div className="h-[35vh]">
          <PortfolioPanel />
        </div>

      </div>
    </DashboardShell>
  )
}
