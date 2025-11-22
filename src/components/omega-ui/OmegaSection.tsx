import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface OmegaSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    subtitle?: string
    children: React.ReactNode
    className?: string
}

export const OmegaSection = React.forwardRef<HTMLDivElement, OmegaSectionProps>(
    ({ title, subtitle, children, className, ...props }, ref) => {
        return (
            <section ref={ref} className={cn("space-y-4", className)} {...props}>
                {(title || subtitle) && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="mb-4"
                    >
                        {title && <h3 className="text-lg font-bold text-white tracking-tight">{title}</h3>}
                        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
                    </motion.div>
                )}
                {children}
            </section>
        )
    }
)

OmegaSection.displayName = "OmegaSection"
