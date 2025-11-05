import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "outline";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-cyan-500/20 text-cyan-200 border border-cyan-500/30",
  success: "bg-emerald-500/20 text-emerald-200 border border-emerald-400/40",
  warning: "bg-amber-500/20 text-amber-200 border border-amber-400/40",
  outline: "bg-transparent text-slate-200 border border-slate-600",
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  )
);

Badge.displayName = "Badge";
