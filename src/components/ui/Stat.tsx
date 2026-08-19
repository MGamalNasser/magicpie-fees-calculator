import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { Card } from "./Card"
import { cn } from "@/lib/cn"

export function Stat({
  label,
  value,
  delta,
  deltaLabel,
  icon,
  hint,
}: {
  label: string
  value: string
  delta?: number
  deltaLabel?: string
  icon?: React.ReactNode
  hint?: string
}) {
  const up = (delta ?? 0) >= 0
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-fg-muted">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-semibold tnum tracking-tight text-fg">{value}</p>
      {delta !== undefined ? (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium tnum",
              up ? "text-green" : "text-red",
            )}
          >
            {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
            {Math.abs(delta).toLocaleString("id-ID")}
          </span>
          <span className="text-xs text-fg-subtle">{deltaLabel}</span>
        </div>
      ) : hint ? (
        <div className="mt-1.5 text-xs text-fg-subtle">{hint}</div>
      ) : null}
    </Card>
  )
}
