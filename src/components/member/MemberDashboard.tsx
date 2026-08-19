"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarClock, CheckCircle2, Clock3, Wallet } from "lucide-react"
import * as actions from "@/lib/actions"
import { Badge } from "@/components/ui/Badge"
import { Card } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"
import { Stat } from "@/components/ui/Stat"
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table"
import { useLocale } from "@/components/LocaleProvider"
import { formatIDR, formatDate } from "@/lib/money"
import type { MyPayoutsData } from "@/lib/types"

export function MemberDashboard() {
  const { t, td } = useLocale()
  const [data, setData] = useState<MyPayoutsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    actions
      .getMyPayoutsAction()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => {
    if (!data) return { paid: 0, awaiting: 0, next: null as { name: string; date: string } | null }
    const paid = data.payouts
      .filter((p) => p.paymentStatus === "paid" && p.gigStatus !== "cancelled")
      .reduce((sum, p) => sum + p.payout, 0)
    const awaiting = data.payouts
      .filter((p) => p.paymentStatus === "pending" && p.gigStatus === "confirmed")
      .reduce((sum, p) => sum + p.payout, 0)
    const upcoming = data.payouts
      .filter((p) => p.gigStatus === "confirmed")
      .sort((a, b) => (a.eventDate < b.eventDate ? -1 : 1))
      .find((p) => p.eventDate >= new Date().toISOString().slice(0, 10))
    return {
      paid,
      awaiting,
      next: upcoming ? { name: upcoming.eventName, date: upcoming.eventDate } : null,
    }
  }, [data])

  if (loading) return null

  return (
    <div className="animate-in space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-fg">{t("My Payouts")}</h1>
        <p className="text-sm text-fg-muted">{t("Your payouts across all gigs.")}</p>
      </div>

      {!data || data.members.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Wallet className="h-5 w-5" />}
            title={t("No payouts yet.")}
            description={t("Your account is not linked to a member record yet.")}
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat
              label={t("Total paid")}
              value={formatIDR(stats.paid)}
              icon={<CheckCircle2 className="h-4 w-4 text-fg-subtle" />}
            />
            <Stat
              label={t("Awaiting payment")}
              value={formatIDR(stats.awaiting)}
              icon={<Clock3 className="h-4 w-4 text-fg-subtle" />}
            />
            <Stat
              label={t("Next gig")}
              value={stats.next ? formatDate(stats.next.date) : "—"}
              icon={<CalendarClock className="h-4 w-4 text-fg-subtle" />}
              hint={stats.next ? stats.next.name : t("Nothing scheduled")}
            />
          </div>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-fg">{t("Payout history")}</h2>
            {data.payouts.length === 0 ? (
              <div className="mt-4">
                <EmptyState
                  icon={<Wallet className="h-5 w-5" />}
                  title={t("No payouts yet.")}
                />
              </div>
            ) : (
              <div className="mt-4">
                <Table>
                  <THead>
                    <Th>{t("Event")}</Th>
                    <Th>{t("Date")}</Th>
                    <Th className="text-right">{t("Split")}</Th>
                    <Th className="text-right">{t("Payout")}</Th>
                    <Th>{t("Status")}</Th>
                  </THead>
                  <TBody>
                    {data.payouts.map((p, i) => (
                      <Tr key={`${p.memberId}-${p.eventDate}-${i}`}>
                        <Td className="font-medium text-fg">{p.eventName}</Td>
                        <Td className="text-fg-muted">{td(p.eventDate)}</Td>
                        <Td className="tnum text-right text-fg-muted">{p.splitPct}%</Td>
                        <Td className="tnum text-right font-medium text-fg">
                          {formatIDR(p.payout)}
                        </Td>
                        <Td>
                          <Badge tone={p.paymentStatus === "paid" ? "green" : "amber"} dot>
                            {p.paymentStatus === "paid" ? t("Paid") : t("Pending")}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  )
}