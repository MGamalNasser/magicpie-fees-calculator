import { cn } from "@/lib/cn"

export function Table({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-line text-left text-xs font-medium uppercase tracking-wide text-fg-subtle">
        {children}
      </tr>
    </thead>
  )
}

export function Th({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <th className={cn("px-3 py-2.5 font-medium", className)}>{children}</th>
}

export function TBody({ children }: { children: React.ReactNode }) {
  return <tbody>{children}</tbody>
}

export function Tr({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}) {
  return (
    <tr
      className={cn(
        "border-b border-line last:border-0 hover:bg-surface",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function Td({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return <td className={cn("px-3 py-3 align-middle", className)}>{children}</td>
}
