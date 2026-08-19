const idr = new Intl.NumberFormat("id-ID")

export function formatIDR(n: number): string {
  return "Rp" + idr.format(Math.round(n))
}

export function formatCompact(n: number): string {
  if (n >= 1_000_000_000) return "Rp" + (n / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B"
  if (n >= 1_000_000) return "Rp" + (n / 1_000_000).toFixed(2).replace(/\.0+$/, "") + "M"
  if (n >= 1_000) return "Rp" + (n / 1_000).toFixed(0) + "K"
  return "Rp" + n
}

export function parseMoneyInput(s: string): number {
  const digits = s.replace(/[^\d]/g, "")
  if (!digits) return 0
  return parseInt(digits, 10)
}

export function formatDate(iso: string): string {
  if (!iso) return ""
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
}

export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7)
}
