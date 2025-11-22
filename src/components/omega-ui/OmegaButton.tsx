import React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { motion, HTMLMotionProps } from "framer-motion"

interface OmegaButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "ghost" | "danger" | "outline"
    size?: "sm" | "md" | "lg" | "icon"
    isLoading?: boolean
    children: React.ReactNode
    className?: string
}

export const OmegaButton = React.forwardRef<HTMLButtonElement, OmegaButtonProps>(
    ({ variant = "primary", size = "md", isLoading = false, children, className, ...props }, ref) => {

        const variants = {
            primary: "bg-cyan-600 hover:bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/20",
            secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
            ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white",
            danger: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
            outline: "bg-transparent border border-white/20 text-gray-300 hover:border-white/40 hover:text-white",
        }

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
            icon: "h-10 w-10 p-2 flex items-center justify-center",
        }

        return (
            <motion.button
                ref={ref}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading || props.disabled}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {children}
            </motion.button>
        )
    }
)

OmegaButton.displayName = "OmegaButton"
