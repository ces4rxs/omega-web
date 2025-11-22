import React from "react"
import { cn } from "@/lib/utils"

interface OmegaSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    className?: string
}

export const OmegaSkeleton = React.forwardRef<HTMLDivElement, OmegaSkeletonProps>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "animate-pulse rounded-md bg-white/5",
                    className
                )}
                {...props}
            />
        )
    }
)

OmegaSkeleton.displayName = "OmegaSkeleton"
