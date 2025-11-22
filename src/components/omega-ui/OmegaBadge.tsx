import React from "react"
import { cn } from "@/lib/utils"

type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral" | "outline"

interface OmegaBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant
    children: React.ReactNode
    dot?: boolean
    className?: string
}

export const OmegaBadge = React.forwardRef<HTMLSpanElement, OmegaBadgeProps>(
    ({ variant = "neutral", children, dot = false, className, ...props }, ref) => {

        const variants = {
            success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
            warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
            danger: "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
            info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
            neutral: "bg-white/5 text-gray-400 border-white/10",
            outline: "bg-transparent text-gray-400 border-gray-700",
        }

        const dotColors = {
            success: "bg-emerald-400",
            warning: "bg-amber-400",
            danger: "bg-red-400",
            info: "bg-cyan-400",
            neutral: "bg-gray-400",
            outline: "bg-gray-400",
        }

        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium border transition-colors",
                    variants[variant],
                    className
                )}
                {...props}
            >
                {dot && (
                    <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 animate-pulse", dotColors[variant])} />
                )}
                {children}
            </span>
        )
    }
)

OmegaBadge.displayName = "OmegaBadge"
