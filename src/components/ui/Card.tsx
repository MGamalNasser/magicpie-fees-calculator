import { cn } from "@/lib/cn"

export function Card({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("card", className)}>{children}</div>
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div>
        <h2 className="text-sm font-semibold text-fg">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-[13px] text-fg-muted">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}
