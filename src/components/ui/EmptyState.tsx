import { cn } from "@/lib/cn"

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line px-6 py-12 text-center",
        className,
      )}
    >
      {icon ? (
        <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-fg-subtle">
          {icon}
        </div>
      ) : null}
      <h3 className="text-sm font-semibold text-fg">{title}</h3>
      {description ? (
        <p className="max-w-sm text-[13px] text-fg-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse rounded-md bg-muted", className)} />
  )
}
