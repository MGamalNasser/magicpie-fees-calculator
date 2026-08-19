"use client"

import { useEffect, useRef, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/cn"

export function Combobox({
  value,
  onChange,
  options,
  placeholder,
  emptyText,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder?: string
  emptyText?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDocClick)
    return () => document.removeEventListener("mousedown", onDocClick)
  }, [])

  const q = value.trim().toLowerCase()
  const exact = options.some((o) => o.toLowerCase() === q)
  const filtered =
    value.trim() === "" || exact ? options : options.filter((o) => o.toLowerCase().includes(q))

  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full h-9 rounded-lg bg-elevated border border-line px-3 pr-8 text-sm text-fg placeholder:text-fg-subtle focus-ring focus-visible:border-accent transition-colors disabled:opacity-50 disabled:pointer-events-none"
      />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle options"
        className="absolute inset-y-0 right-0 flex w-8 items-center justify-center text-fg-subtle hover:text-fg"
      >
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-line bg-elevated p-1 shadow-lg">
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-fg-muted">{emptyText}</li>
          ) : (
            filtered.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left text-sm text-fg hover:bg-muted"
                >
                  <span>{o}</span>
                  {o === value ? <Check className="h-3.5 w-3.5 text-accent" /> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
