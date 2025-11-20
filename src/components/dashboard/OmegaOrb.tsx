"use client"

import React from 'react'
import { useOmegaLive } from '@/contexts/OmegaLiveProvider'
import { motion } from 'framer-motion'

export const OmegaOrb = () => {
    const { risk, fusion, connected } = useOmegaLive()

    // Determinar color base según Riesgo (v21)
    // Bajo riesgo = Cyan/Azul, Medio = Amarillo, Alto = Rojo
    const getBaseColor = () => {
        if (!connected) return '#374151' // Gris apagado
        const score = risk?.score || 0
        if (score > 0.7) return '#EF4444' // Rojo Pánico
        if (score > 0.4) return '#F59E0B' // Alerta Naranja
        return '#06B6D4' // Cyan Calma
    }

    // Determinar pulso según Decisión (v19)
    // Si hay decisión agresiva (BUY/SELL), pulso rápido. Si es HOLD, respiración lenta.
    const getPulseSpeed = () => {
        if (!connected) return 5
        const action = fusion?.decision || 'HOLD'
        return action === 'HOLD' ? 3 : 0.5 // Segundos por ciclo
    }

    const color = getBaseColor()
    const duration = getPulseSpeed()

    return (
        <div className="relative flex items-center justify-center w-16 h-16">
            {/* Núcleo Brillante */}
            <motion.div
                className="absolute w-3 h-3 rounded-full bg-white z-10 shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1, repeat: Infinity }}
            />

            {/* Anillo de Energía (Respiración) */}
            <motion.div
                className="absolute w-full h-full rounded-full border-2 opacity-50"
                style={{ borderColor: color, boxShadow: `0 0 15px ${color}` }}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: duration, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Anillo Externo (Rotación Rápida = Procesando) */}
            {connected && (
                <motion.div
                    className="absolute w-[120%] h-[120%] rounded-full border border-t-transparent border-b-transparent border-l-white/20 border-r-white/20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
            )}
        </div>
    )
}
