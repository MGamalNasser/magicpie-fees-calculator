import { forwardRef } from "react"
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/cn"

const base =
  "w-full h-9 rounded-lg bg-elevated border border-line px-3 text-sm text-fg placeholder:text-fg-subtle focus-ring focus-visible:border-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn(base, className)} {...props} />
  ),
)
Input.displayName = "Input"

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(base, "appearance-none pr-8", className)} {...props}>
    {children}
  </select>
))
Select.displayName = "Select"

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, "h-auto min-h-20 py-2", className)} {...props} />
))
Textarea.displayName = "Textarea"

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[13px] font-medium text-fg-muted">{label}</span>
      {children}
      {hint ? <span className="text-xs text-fg-subtle">{hint}</span> : null}
    </label>
  )
}
