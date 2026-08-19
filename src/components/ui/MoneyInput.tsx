import { forwardRef, useId } from "react"
import type { InputHTMLAttributes } from "react"
import { cn } from "@/lib/cn"
import { parseMoneyInput } from "@/lib/money"

export interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: number
  onChange?: (n: number) => void
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const id = useId()
    const display =
      value === 0 ? "" : "Rp" + value.toLocaleString("id-ID")
    return (
      <div className={cn("relative", className)}>
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-fg-subtle">
          Rp
        </span>
        <input
          ref={ref}
          id={id}
          inputMode="numeric"
          className="w-full h-9 rounded-lg bg-elevated border border-line pl-9 pr-3 text-right text-sm tnum text-fg placeholder:text-fg-subtle focus-ring focus-visible:border-accent transition-colors"
          value={display}
          onChange={(e) => onChange?.(parseMoneyInput(e.target.value))}
          onFocus={(e) => {
            e.target.select()
            props.onFocus?.(e)
          }}
          placeholder="0"
          {...props}
        />
      </div>
    )
  },
)
MoneyInput.displayName = "MoneyInput"
