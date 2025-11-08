"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Crown, CreditCard } from "lucide-react"
import { useState, useEffect } from "react"

export default function SettingsPage() {
  const [tab, setTab] = useState("profile")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser))
        } catch (e) {
          console.error('Error parsing user:', e)
        }
      }
    }
  }, [])

  const isPro = user?.subscription?.planId === 'professional'

  const handleManageBilling = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stripe/billing-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          returnUrl: `${window.location.origin}/dashboard/settings`
        })
      })

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Error opening billing portal:', error)
      alert('Error opening billing portal. Please try again.')
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-400">
          Manage your account and subscription
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email || ''} disabled />
              </div>

              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={user?.name || ''} placeholder="Your name" />
              </div>

              <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Subscription
              </CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {isPro ? 'Professional Plan' : 'Free Plan'}
                    </h3>
                    {isPro && <Crown className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <p className="text-sm text-gray-400">
                    {isPro
                      ? 'Access to all premium features'
                      : 'Basic backtesting features'
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">
                    {isPro ? '$29' : '$0'}
                    <span className="text-sm text-gray-400">/month</span>
                  </p>
                </div>
              </div>

              {isPro ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-sm text-green-400">
                      ✓ Your subscription is active
                    </p>
                  </div>
                  <Button onClick={handleManageBilling} className="w-full">
                    Manage Billing
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <h4 className="font-semibold mb-2">Upgrade to Pro</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>✓ Monte Carlo Simulations</li>
                      <li>✓ Walk-Forward Analysis</li>
                      <li>✓ Strategy Optimizer</li>
                      <li>✓ Custom Strategies</li>
                      <li>✓ Advanced Risk Metrics</li>
                    </ul>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Pro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
