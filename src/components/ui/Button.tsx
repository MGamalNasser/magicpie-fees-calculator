import { forwardRef } from "react"
import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

type Variant = "primary" | "secondary" | "ghost" | "danger" | "accent-soft"
type Size = "sm" | "md" | "lg" | "icon"

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-fg hover:bg-accent-hover shadow-sm",
  secondary:
    "bg-elevated text-fg border border-line hover:border-line-strong hover:bg-muted shadow-sm",
  ghost: "text-fg-muted hover:text-fg hover:bg-muted",
  danger: "bg-red-soft text-red hover:opacity-90",
  "accent-soft": "bg-accent-soft text-accent hover:opacity-90",
}

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] rounded-lg gap-1.5",
  md: "h-9 px-4 text-sm rounded-lg gap-2",
  lg: "h-10 px-5 text-sm rounded-xl gap-2",
  icon: "h-9 w-9 rounded-lg",
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "focus-ring inline-flex select-none items-center justify-center font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
)
Button.displayName = "Button"
