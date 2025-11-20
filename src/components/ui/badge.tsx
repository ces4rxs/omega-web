"use client";

import * as React from "react";
import clsx from "clsx";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "success" | "warning" | "destructive" | "outline";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-zinc-800 text-zinc-100 border border-zinc-700",
    success: "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40",
    warning: "bg-amber-500/10 text-amber-300 border border-amber-500/40",
    destructive: "bg-red-600/20 text-red-300 border border-red-500/50",
    outline: "bg-transparent text-zinc-100 border border-zinc-500/60",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => (
        <span
            ref={ref}
            className={clsx(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                "transition-colors whitespace-nowrap",
                variantClasses[variant],
                className
            )}
            {...props}
        />
    )
);

Badge.displayName = "Badge";
