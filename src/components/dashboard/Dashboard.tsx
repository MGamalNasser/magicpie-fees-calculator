"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarDays, TrendingUp, Wallet } from "lucide-react"
import { useData } from "@/components/DataProvider"
import { Badge, GIG_STATUS_LABEL, statusTone } from "@/components/ui/Badge"
import { Card, SectionHeader } from "@/components/ui/Card"
import { Stat } from "@/components/ui/Stat"
import { EmptyState, Skeleton } from "@/components/ui/EmptyState"
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table"
import { Button } from "@/components/ui/Button"
import { computeSettlement } from "@/lib/calc"
import { formatCompact, formatIDR, monthKey, toISODate } from "@/lib/money"
import { useLocale } from "@/components/LocaleProvider"

function todayISO() {
  return toISODate(new Date())
}

export function Dashboard() {
  const { data, loading } = useData()
  const router = useRouter()
  const { t, td, locale } = useLocale()

  const stats = useMemo(() => {
    if (!data) return null
    const now = new Date()
    const thisMonth = toISODate(now).slice(0, 7)
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonth = toISODate(lastMonthDate).slice(0, 7)

    let thisRevenue = 0
    let lastRevenue = 0
    let netBand = 0
    let crewTotal = 0
    let mealTotal = 0
    let otherTotal = 0
    let membersPaid = 0
    let pendingValue = 0
    const upcoming = data.gigs
      .filter((g) => g.eventDate >= todayISO() && g.status !== "cancelled")
      .sort((a, b) => a.eventDate.localeCompare(b.eventDate))
      .slice(0, 3)

    for (const gig of data.gigs) {
      const mk = monthKey(gig.eventDate)
      const amount = gig.totalFee
      if (mk === thisMonth) thisRevenue += amount
      if (mk === lastMonth) lastRevenue += amount
      const s = computeSettlement(gig, data)
      netBand += s.netBand
      crewTotal += s.crewTotal
      mealTotal += s.mealTotal
      otherTotal += s.productionTotal + s.otherTotal
      if (gig.status === "paid") {
        membersPaid += s.memberCount
      } else if (gig.status === "confirmed") {
        pendingValue += gig.totalFee
      }
    }

    const delta = lastRevenue > 0 ? ((thisRevenue - lastRevenue) / lastRevenue) * 100 : thisRevenue > 0 ? 100 : 0

    return {
      thisRevenue,
      delta: Math.round(delta),
      netBand,
      crewTotal,
      mealTotal,
      otherTotal,
      membersPaid,
      pendingValue,
      upcoming,
      thisMonth,
    }
  }, [data])

  const bars = useMemo(() => {
    if (!data) return []
    const now = new Date()
    const fmt = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { month: "short" })
    const out: { label: string; value: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = toISODate(d).slice(0, 7)
      const value = data.gigs
        .filter((g) => monthKey(g.eventDate) === key)
        .reduce((s, g) => s + g.totalFee, 0)
      out.push({
        label: fmt.format(d),
        value,
      })
    }
    return out
  }, [data, locale])

  if (loading || !data || !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-52 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    )
  }

  const maxBar = Math.max(...bars.map((b) => b.value), 1)

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-fg">{t("Overview")}</h1>
        <p className="text-sm text-fg-muted">
          {new Date().toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <Card className="p-6">
        <p className="text-[13px] font-medium text-fg-muted">{t("Revenue this month")}</p>
        <p className="mt-2 text-4xl font-semibold tnum tracking-tight text-fg">
          {formatIDR(stats.thisRevenue)}
        </p>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          <TrendingUp className="h-3.5 w-3.5" />
          {stats.delta >= 0 ? "+" : ""}
          {stats.delta.toLocaleString("id-ID")}% {t("vs last month")}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label={t("Net band (all time)")}
          value={formatCompact(stats.netBand)}
          icon={<Wallet className="h-4 w-4 text-fg-subtle" />}
          hint={t("Across {n} gigs", { n: data.gigs.length })}
        />
        <Stat
          label={t("Members paid")}
          value={String(stats.membersPaid)}
          icon={<TrendingUp className="h-4 w-4 text-fg-subtle" />}
          hint={t("Marked paid in settlements")}
        />
        <Stat
          label={t("Awaiting settlement")}
          value={formatCompact(stats.pendingValue)}
          icon={<CalendarDays className="h-4 w-4 text-fg-subtle" />}
          hint={t("Confirmed, not yet paid")}
        />
        <Stat
          label={t("Upcoming gigs")}
          value={String(stats.upcoming.length)}
          icon={<CalendarDays className="h-4 w-4 text-fg-subtle" />}
          hint={stats.upcoming[0] ? t("Next: {name}", { name: stats.upcoming[0].eventName }) : t("Nothing scheduled")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <SectionHeader title={t("Revenue by month")} className="mb-5" />
          <div className="flex h-36 items-end gap-3">
            {bars.map((b, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex w-full items-end" style={{ height: 120 }}>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${Math.max((b.value / maxBar) * 100, 2)}%`,
                      background:
                        i === bars.length - 1 ? "var(--green)" : "var(--blue)",
                    }}
                    title={formatIDR(b.value)}
                  />
                </div>
                <span className="text-[11px] text-fg-subtle">{b.label}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <SectionHeader
            title={t("Recent gigs")}
            action={
              <Link href="/gigs">
                <Button variant="ghost" size="sm">
                  {t("View all")}
                </Button>
              </Link>
            }
          />
          <div className="mt-3">
            {data.gigs.length === 0 ? (
              <EmptyState
                title={t("No gigs yet")}
                description={t("Create your first gig to start tracking settlements.")}
                action={
                  <Link href="/gigs/new">
                    <Button size="sm">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {t("New Gig")}
                    </Button>
                  </Link>
                }
              />
            ) : (
              <Table>
                <THead>
                  <Th>{t("Event")}</Th>
                  <Th>{t("Date")}</Th>
                  <Th className="text-right">{t("Fee")}</Th>
                  <Th>{t("Status")}</Th>
                </THead>
                <TBody>
                  {data.gigs.slice(0, 5).map((g) => (
                    <Tr
                      key={g.id}
                      onClick={() => router.push(`/gigs/${g.id}`)}
                    >
                      <Td className="font-medium text-fg">{g.eventName}</Td>
                      <Td className="text-fg-muted">{td(g.eventDate)}</Td>
                      <Td className="tnum text-right font-medium text-fg">
                        {formatCompact(g.totalFee)}
                      </Td>
                      <Td>
                        <Badge tone={statusTone(g.status)} dot>
                          {t(GIG_STATUS_LABEL[g.status] ?? g.status)}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}