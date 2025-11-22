import React from "react"
import { cn } from "@/lib/utils"
import { motion, HTMLMotionProps } from "framer-motion"

interface OmegaCardProps extends Omit<HTMLMotionProps<"div">, "title"> {
    children: React.ReactNode
    title?: React.ReactNode
    action?: React.ReactNode
    className?: string
    noPadding?: boolean
    glow?: "none" | "blue" | "purple" | "emerald" | "amber"
}

export const OmegaCard = React.forwardRef<HTMLDivElement, OmegaCardProps>(
    ({ children, title, action, className, noPadding = false, glow = "none", ...props }, ref) => {

        const glowStyles = {
            none: "",
            blue: "shadow-[0_0_30px_rgba(6,182,212,0.05)] hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] border-cyan-500/20",
            purple: "shadow-[0_0_30px_rgba(168,85,247,0.05)] hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] border-purple-500/20",
            emerald: "shadow-[0_0_30px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] border-emerald-500/20",
            amber: "shadow-[0_0_30px_rgba(245,158,11,0.05)] hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] border-amber-500/20",
        }

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn(
                    "relative flex flex-col rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden transition-all duration-300",
                    glowStyles[glow],
                    className
                )}
                {...props}
            >
                {/* Optional Header */}
                {(title || action) && (
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/2">
                        {title && <div className="text-sm font-bold text-gray-100 tracking-tight flex items-center gap-2">{title}</div>}
                        {action && <div className="flex items-center gap-2">{action}</div>}
                    </div>
                )}

                {/* Content */}
                <div className={cn("flex-1", !noPadding && "p-4")}>
                    {children}
                </div>
            </motion.div>
        )
    }
)

OmegaCard.displayName = "OmegaCard"
