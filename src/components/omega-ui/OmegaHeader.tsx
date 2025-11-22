import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface OmegaHeaderProps {
    title: string
    subtitle?: string
    action?: React.ReactNode
    className?: string
}

export const OmegaHeader: React.FC<OmegaHeaderProps> = ({ title, subtitle, action, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn("flex items-center justify-between mb-8", className)}
        >
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-gray-400 mt-1 text-sm font-mono">
                        {subtitle}
                    </p>
                )}
            </div>
            {action && (
                <div className="flex items-center gap-3">
                    {action}
                </div>
            )}
        </motion.div>
    )
}
