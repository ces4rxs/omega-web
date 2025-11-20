'use client';

import React from 'react';
import { useOmegaLive } from '@/contexts/OmegaLiveProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, WifiOff, Zap, Newspaper, Brain, ShieldAlert } from 'lucide-react';

export const LiveDebugger = () => {
    const { connected, meta, fusion, news, risk } = useOmegaLive();

    return (
        <Card className="w-full max-w-4xl mx-auto mt-8 bg-omega-card border-omega-border text-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-blue" />
                    OMEGA Live Diagnostic
                </CardTitle>
                <Badge variant={connected ? "default" : "destructive"} className={connected ? "bg-neon-green text-black" : "bg-neon-red text-white"}>
                    {connected ? <Wifi className="w-4 h-4 mr-1" /> : <WifiOff className="w-4 h-4 mr-1" />}
                    {connected ? "CONNECTED" : "DISCONNECTED"}
                </Badge>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* META STATUS */}
                <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" /> SYSTEM META
                    </h3>
                    <pre className="text-xs font-mono text-green-400 overflow-auto max-h-32">
                        {meta ? JSON.stringify(meta, null, 2) : "Waiting for meta:update..."}
                    </pre>
                </div>

                {/* FUSION DECISION */}
                <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-neon-blue" /> FUSION CORE
                    </h3>
                    <pre className="text-xs font-mono text-blue-400 overflow-auto max-h-32">
                        {fusion ? JSON.stringify(fusion, null, 2) : "Waiting for fusion:decision..."}
                    </pre>
                </div>

                {/* NEWS FEED */}
                <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                        <Newspaper className="w-4 h-4 text-purple-400" /> NEWS INTELLIGENCE
                    </h3>
                    <pre className="text-xs font-mono text-purple-400 overflow-auto max-h-32">
                        {news ? JSON.stringify(news, null, 2) : "Waiting for news:update..."}
                    </pre>
                </div>

                {/* RISK METRICS */}
                <div className="p-4 rounded-lg bg-black/20 border border-white/5">
                    <h3 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-neon-red" /> RISK SENTINEL
                    </h3>
                    <pre className="text-xs font-mono text-red-400 overflow-auto max-h-32">
                        {risk ? JSON.stringify(risk, null, 2) : "Waiting for risk:update..."}
                    </pre>
                </div>

            </CardContent>
        </Card>
    );
};
