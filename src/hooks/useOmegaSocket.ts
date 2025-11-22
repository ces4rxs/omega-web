import { useEffect, useState, useMemo } from 'react';
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

export interface OmegaPortfolioAllocation {
    asset: string;
    weight: number;
    price?: number;
    contribution?: number;
}

export interface OmegaPortfolioRisk {
    score: number; // 0-1
    opportunity_score: number; // 0-1
    volatility_estimate?: number;
}

export interface OmegaPortfolioCorrelation {
    asset1: string;
    asset2: string;
    value: number; // -1 to 1
}

export interface OmegaPortfolioSuggestion {
    action: string;
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    description: string;
    assets?: string[];
    expected_impact?: {
        risk_reduction?: number;
        return_increase?: number;
    };
}

export interface OmegaPortfolio {
    allocations: OmegaPortfolioAllocation[];
    risk: OmegaPortfolioRisk;
    correlations?: OmegaPortfolioCorrelation[];
    suggestions?: OmegaPortfolioSuggestion[];
    calculation_time_ms?: number;
    model_version?: string;
    reliability_from_v18?: number;
    fusion_action_from_v19?: string;
    news_impact_from_v20?: {
        sentiment?: string;
        impact?: number;
    };
    timestamp: number;
    [key: string]: any;
}

export const useOmegaSocket = () => {
    const [connected, setConnected] = useState(socket.connected);
    const [meta, setMeta] = useState<OmegaMeta | null>(null);
    const [fusion, setFusion] = useState<OmegaFusion | null>(null);
    const [news, setNews] = useState<OmegaNews | null>(null);
    const [risk, setRisk] = useState<OmegaRisk | null>(null);
    const [portfolio, setPortfolio] = useState<OmegaPortfolio | null>(null);

    useEffect(() => {
        // Connection handlers
        const onConnect = () => setConnected(true);
        const onDisconnect = () => setConnected(false);

        // Event handlers
        const onMetaUpdate = (data: OmegaMeta) => setMeta(data);
        const onFusionDecision = (data: OmegaFusion) => setFusion(data);
        const onNewsUpdate = (data: OmegaNews) => setNews(data);
        const onRiskUpdate = (data: OmegaRisk) => setRisk(data);
        const onPortfolioUpdate = (data: OmegaPortfolio) => setPortfolio(data);

        // Bind events
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('meta:update', onMetaUpdate);
        socket.on('fusion:decision', onFusionDecision);
        socket.on('news:update', onNewsUpdate);
        socket.on('risk:update', onRiskUpdate);
        socket.on('portfolio:update', onPortfolioUpdate);

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
            socket.off('portfolio:update', onPortfolioUpdate);
        };
    }, []);

    const value = useMemo(() => ({
        connected,
        meta,
        fusion,
        news,
        risk,
        portfolio,
    }), [connected, meta, fusion, news, risk, portfolio]);

    return value;
};
