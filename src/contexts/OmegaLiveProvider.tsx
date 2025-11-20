'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useOmegaSocket, OmegaMeta, OmegaFusion, OmegaNews, OmegaRisk, OmegaPortfolio } from '@/hooks/useOmegaSocket';

interface OmegaLiveContextType {
    connected: boolean;
    meta: OmegaMeta | null;
    fusion: OmegaFusion | null;
    news: OmegaNews | null;
    risk: OmegaRisk | null;
    portfolio: OmegaPortfolio | null;
}

const OmegaLiveContext = createContext<OmegaLiveContextType | undefined>(undefined);

export const OmegaLiveProvider = ({ children }: { children: ReactNode }) => {
    const socketState = useOmegaSocket();

    return (
        <OmegaLiveContext.Provider value={socketState}>
            {children}
        </OmegaLiveContext.Provider>
    );
};

export const useOmegaLive = () => {
    const context = useContext(OmegaLiveContext);
    if (context === undefined) {
        throw new Error('useOmegaLive must be used within an OmegaLiveProvider');
    }
    return context;
};
