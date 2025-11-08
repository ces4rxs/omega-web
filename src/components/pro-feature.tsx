"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

interface ProFeatureProps {
  children: React.ReactNode
  feature?: string
}

export function ProFeature({ children, feature = "This feature" }: ProFeatureProps) {
  const [isPro, setIsPro] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser)
          setIsPro(user?.subscription?.planId === 'professional')
        } catch (e) {
          console.error('Error parsing user:', e)
        }
      }
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  if (isPro) {
    return <>{children}</>
  }

  const handleUpgrade = async () => {
    // Redirect to Stripe checkout
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          priceId: 'price_professional', // Your Stripe price ID
          successUrl: `${window.location.origin}/dashboard?upgrade=success`,
          cancelUrl: `${window.location.origin}/dashboard?upgrade=canceled`,
        })
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('Error creating checkout session. Please try again.')
    }
  }

  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <Card className="max-w-md mx-4 border-yellow-500/30">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full">
                <Crown className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Upgrade to Pro</CardTitle>
            <CardDescription>
              {feature} is only available for Professional users
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Monte Carlo Simulations (300 max)</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Walk-Forward Analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Advanced Risk Metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Strategy Optimizer</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Custom Strategies</span>
              </div>
            </div>

            <div className="pt-4 text-center">
              <p className="text-2xl font-bold mb-1">$29<span className="text-sm text-gray-400">/month</span></p>
              <p className="text-xs text-gray-400 mb-4">Cancel anytime</p>
            </div>

            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
