import React from "react"
import { cn } from "@/lib/utils"

interface OmegaGridProps extends React.HTMLAttributes<HTMLDivElement> {
    cols?: 1 | 2 | 3 | 4 | 12
    gap?: 2 | 4 | 6 | 8
    children: React.ReactNode
    className?: string
}

export const OmegaGrid = React.forwardRef<HTMLDivElement, OmegaGridProps>(
    ({ cols = 1, gap = 4, children, className, ...props }, ref) => {

        const gridCols = {
            1: "grid-cols-1",
            2: "grid-cols-1 md:grid-cols-2",
            3: "grid-cols-1 md:grid-cols-3",
            4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
            12: "grid-cols-12",
        }

        const gaps = {
            2: "gap-2",
            4: "gap-4",
            6: "gap-6",
            8: "gap-8",
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "grid",
                    gridCols[cols],
                    gaps[gap],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

OmegaGrid.displayName = "OmegaGrid"
