"use client"

import React from 'react'
import { useOmegaLive } from '@/contexts/OmegaLiveProvider'
import { OmegaOrb } from '@/components/dashboard/OmegaOrb'
import { Badge } from '@/components/ui/badge'
import {
    LayoutGrid,
    Activity,
    Globe,
    Shield,
    Cpu,
    Bell
} from 'lucide-react'

interface DashboardShellProps {
    children: React.ReactNode
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
    const { connected, meta } = useOmegaLive()

    return (
        <div className="flex h-screen w-full bg-[#050505] text-gray-200 font-mono overflow-hidden selection:bg-cyan-500/30">

            {/* === SIDEBAR (Terminal Style) === */}
            <aside className="w-20 flex flex-col items-center py-6 border-r border-gray-800/50 bg-[#0A0A0A] z-30">
                <div className="mb-10">
                    {/* Mini Orb en el Sidebar */}
                    <div className="scale-50 origin-center transform">
                        <OmegaOrb />
                    </div>
                </div>

                <nav className="flex flex-col gap-8 w-full items-center">
                    <NavItem icon={<LayoutGrid size={24} />} label="DASH" active />
                    <NavItem icon={<Activity size={24} />} label="MKT" />
                    <NavItem icon={<Globe size={24} />} label="NEWS" />
                    <NavItem icon={<Shield size={24} />} label="RISK" />
                    <NavItem icon={<Cpu size={24} />} label="AI" />
                </nav>
            </aside>

            {/* === MAIN CONTENT === */}
            <main className="flex-1 flex flex-col relative">

                {/* === TOP BAR (Status Deck) === */}
                <header className="h-16 border-b border-gray-800/50 bg-[#0A0A0A]/90 backdrop-blur-sm flex items-center justify-between px-6">

                    {/* Izquierda: Identidad */}
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-bold tracking-tighter text-white">
                            OMEGA <span className="text-cyan-500">OS</span>
                        </h1>
                        <div className="h-6 w-[1px] bg-gray-800 mx-2"></div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-gray-500 uppercase leading-none mb-1">System State</span>
                            <span className="text-xs text-cyan-400 font-bold tracking-widest">
                                {meta?.status || 'INITIALIZING...'}
                            </span>
                        </div>
                    </div>

                    {/* Centro: Ticker Rápido (Placeholder Visual) */}
                    <div className="hidden md:flex items-center gap-6 opacity-50 text-xs text-gray-400">
                        <span>BTC <span className="text-emerald-500">+1.2%</span></span>
                        <span>ETH <span className="text-red-500">-0.4%</span></span>
                        <span>SOL <span className="text-emerald-500">+2.1%</span></span>
                    </div>

                    {/* Derecha: Conexión y Perfil */}
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-800 rounded-full transition-colors relative">
                            <Bell size={18} className="text-gray-400" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <Badge variant={connected ? "outline" : "destructive"} className="font-mono text-[10px]">
                            {connected ? "NET: STABLE" : "NET: LOST"}
                        </Badge>
                    </div>
                </header>

                {/* === WORKSPACE (Grid Híbrido) === */}
                <div className="flex-1 overflow-hidden p-2 relative">
                    {/* Fondo de Grid Sutil para efecto 'Blueprint' */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
                    </div>

                    {children}
                </div>

            </main>
        </div>
    )
}

const NavItem = ({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) => (
    <button className={`group flex flex-col items-center gap-1 p-2 w-full transition-all relative
    ${active ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}`}>
        <div className={`p-2 rounded-xl transition-all ${active ? 'bg-cyan-950/30 shadow-[0_0_15px_rgba(8,145,178,0.2)]' : 'group-hover:bg-gray-800'}`}>
            {icon}
        </div>
        <span className="text-[9px] font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4">{label}</span>
        {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r-full shadow-[0_0_10px_#06b6d4]" />}
    </button>
)
