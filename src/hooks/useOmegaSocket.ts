import { useEffect, useState } from 'react';
import { socket } from '@/lib/socket';

export interface OmegaMeta {
    status: string;
    timestamp: number;
    active_strategies: number;
    uptime: number;
    [key: string]: any;
}

export interface OmegaFusion {
    decision: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    reasoning: string[];
    timestamp: number;
    [key: string]: any;
}

export interface OmegaNews {
    headline: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    source: string;
    timestamp: number;
    [key: string]: any;
}

export interface OmegaRisk {
    score: number; // 0-100
    level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    exposure: number;
    timestamp: number;
    [key: string]: any;
}

export const useOmegaSocket = () => {
    const [connected, setConnected] = useState(socket.connected);
    const [meta, setMeta] = useState<OmegaMeta | null>(null);
    const [fusion, setFusion] = useState<OmegaFusion | null>(null);
    const [news, setNews] = useState<OmegaNews | null>(null);
    const [risk, setRisk] = useState<OmegaRisk | null>(null);

    useEffect(() => {
        // Connection handlers
        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        // Event handlers
        const onMetaUpdate = (data: OmegaMeta) => setMeta(data);
        const onFusionDecision = (data: OmegaFusion) => setFusion(data);
        const onNewsUpdate = (data: OmegaNews) => setNews(data);
        const onRiskUpdate = (data: OmegaRisk) => setRisk(data);

        // Bind events
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('meta:update', onMetaUpdate);
        socket.on('fusion:decision', onFusionDecision);
        socket.on('news:update', onNewsUpdate);
        socket.on('risk:update', onRiskUpdate);

        // Initial state
        setConnected(socket.connected);

        // Cleanup
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('meta:update', onMetaUpdate);
            socket.off('fusion:decision', onFusionDecision);
            socket.off('news:update', onNewsUpdate);
            socket.off('risk:update', onRiskUpdate);
        };
    }, []);

    return {
        connected,
        meta,
        fusion,
        news,
        risk,
    };
};
