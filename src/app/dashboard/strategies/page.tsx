"use client"

import { useState } from "react"
import { ProFeature } from "@/components/pro-feature"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2 } from "lucide-react"

export default function StrategiesPage() {
  const [tab, setTab] = useState("list")

  return (
    <ProFeature feature="Custom Strategies">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Custom Strategies</h1>
            <p className="text-gray-400">
              Create and manage your own trading strategies
            </p>
          </div>
          <Button onClick={() => setTab("create")}>
            <Plus className="w-4 h-4 mr-2" />
            New Strategy
          </Button>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="list">My Strategies</TabsTrigger>
            <TabsTrigger value="create">Create New</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Strategies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Example strategy items */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="font-semibold">Custom SMA Strategy</h3>
                      <p className="text-sm text-gray-400">Created 2 days ago</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-center text-gray-400 py-8">
                    No custom strategies yet. Create your first one!
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="create" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Create New Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Strategy Name</Label>
                  <Input placeholder="My Custom Strategy" />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="Brief description of your strategy" />
                </div>

                <div className="space-y-2">
                  <Label>Strategy Code (Python)</Label>
                  <textarea
                    className="w-full h-64 p-3 bg-black/50 border border-white/20 rounded-md text-sm font-mono"
                    placeholder={`def strategy(data, params):
    # Your strategy logic here
    fast_sma = data['close'].rolling(params['fast']).mean()
    slow_sma = data['close'].rolling(params['slow']).mean()

    signal = (fast_sma > slow_sma).astype(int)
    return signal`}
                  />
                </div>

                <Button className="w-full">
                  Save Strategy
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProFeature>
  )
}
