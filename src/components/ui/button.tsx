import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "sm" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default: "border-transparent bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:bg-cyan-300",
  secondary: "border border-slate-600 bg-slate-800 text-sky-100 shadow-md shadow-slate-900/40 hover:bg-slate-700",
  outline: "border border-cyan-400/70 bg-transparent text-cyan-200 hover:bg-cyan-500/10",
  ghost: "border-transparent bg-transparent text-slate-200 hover:bg-slate-800/60",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-5", 
  sm: "h-9 px-4 text-sm", 
  lg: "h-12 px-6 text-base", 
  icon: "h-10 w-10 p-0", 
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-2xl border text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-60",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
