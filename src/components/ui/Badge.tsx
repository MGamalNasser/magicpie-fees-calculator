import { cn } from "@/lib/cn"

export type BadgeTone = "green" | "amber" | "red" | "blue" | "zinc"

const tones: Record<BadgeTone, string> = {
  green: "bg-green-soft text-green",
  amber: "bg-amber-soft text-amber",
  red: "bg-red-soft text-red",
  blue: "bg-blue-soft text-blue",
  zinc: "bg-muted text-fg-muted",
}

export function Dot({}: { tone: BadgeTone }) {
  return <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
}

export function Badge({
  tone = "zinc",
  dot = false,
  children,
  className,
}: {
  tone?: BadgeTone
  dot?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
    >
      {dot ? <Dot tone={tone} /> : null}
      {children}
    </span>
  )
}

export function statusTone(
  s: string,
): BadgeTone {
  switch (s) {
    case "paid":
    case "balanced":
      return "green"
    case "over_budget":
    case "split_invalid":
      return "red"
    case "confirmed":
      return "blue"
    case "pending":
    case "draft":
      return "amber"
    default:
      return "zinc"
  }
}

export const GIG_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  paid: "Paid",
  cancelled: "Cancelled",
}
