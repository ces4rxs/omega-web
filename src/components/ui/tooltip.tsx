import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipContext = React.createContext<{ id: string } | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const id = React.useId();
  return <TooltipContext.Provider value={{ id }}>{children}</TooltipContext.Provider>;
}

export type TooltipTriggerProps = React.HTMLAttributes<HTMLSpanElement>;

export const TooltipTrigger = React.forwardRef<HTMLSpanElement, TooltipTriggerProps>(
  ({ children, className, ...props }, ref) => {
    const context = React.useContext(TooltipContext);
    return (
      <span
        ref={ref}
        className={cn("group relative inline-flex cursor-help", className)}
        aria-describedby={context?.id}
        {...props}
      >
        {children}
      </span>
    );
  }
);
TooltipTrigger.displayName = "TooltipTrigger";

export type TooltipContentProps = React.HTMLAttributes<HTMLDivElement>;

export const TooltipContent = React.forwardRef<HTMLDivElement, TooltipContentProps>(
  ({ className, style, ...props }, ref) => {
    const context = React.useContext(TooltipContext);
    return (
      <div
        ref={ref}
        id={context?.id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-50 hidden -translate-x-1/2 translate-y-3 whitespace-pre-line rounded-2xl border border-cyan-500/30 bg-slate-950/90 px-4 py-3 text-xs font-medium text-slate-100 shadow-xl ring-1 ring-cyan-500/20 group-hover:flex",
          className
        )}
        style={style}
        {...props}
      />
    );
  }
);
TooltipContent.displayName = "TooltipContent";
