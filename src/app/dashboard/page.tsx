"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setUserName(user.name)
        } catch (e) {
          console.error('Error parsing user:', e)
        }
      }
    }
  }, [])

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Welcome{userName ? `, ${userName}` : ""} 👋
          </h2>
          <p className="text-gray-400">
            Your backtesting dashboard is ready. Explore strategies, analyze performance, and optimize your trading.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-400/40 transition">
            <h3 className="text-lg font-semibold mb-2">
              Total Performance
            </h3>
            <p className="text-3xl font-bold text-blue-400">+12.5%</p>
            <p className="text-xs text-gray-400 mt-1">Last 30 days</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-400/40 transition">
            <h3 className="text-lg font-semibold mb-2">
              Active Strategies
            </h3>
            <p className="text-3xl font-bold text-purple-400">3</p>
            <p className="text-xs text-gray-400 mt-1">SMA, RSI, Trend</p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-blue-400/40 transition">
            <h3 className="text-lg font-semibold mb-2">Backtests Run</h3>
            <p className="text-3xl font-bold text-cyan-400">47</p>
            <p className="text-xs text-gray-400 mt-1">
              This month
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => router.push("/dashboard/backtest")}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 px-8 py-4 rounded-xl font-bold shadow-[0_0_25px_rgba(59,130,246,0.4)] transition"
          >
            Run New Backtest
          </button>
        </div>
      </motion.div>
    </div>
  )
}
