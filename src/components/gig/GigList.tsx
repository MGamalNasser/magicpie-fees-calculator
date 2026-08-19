"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CalendarDays, FileUp, Plus, Search } from "lucide-react"
import { useData } from "@/components/DataProvider"
import { Badge, statusTone, GIG_STATUS_LABEL } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { EmptyState, Skeleton } from "@/components/ui/EmptyState"
import { Input } from "@/components/ui/Input"
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table"
import { computeSettlement } from "@/lib/calc"
import { excelToGig, IMPORT_FORMAT_ERROR } from "@/lib/excel"
import { formatCompact } from "@/lib/money"
import { useLocale } from "@/components/LocaleProvider"

export function GigList() {
  const { data, loading, saveGig, saveMember, saveCrew } = useData()
  const router = useRouter()
  const { t, td } = useLocale()
  const [q, setQ] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [importError, setImportError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    if (!data) return []
    return data.gigs.filter((g) => {
      const hay = [g.eventName, g.client, g.city, g.venue].join(" ").toLowerCase()
      const matchQ = !q || hay.includes(q.toLowerCase())
      const matchS = statusFilter === "all" || g.status === statusFilter
      return matchQ && matchS
    })
  }, [data, q, statusFilter])

  const onImportFile = async (file: File) => {
        if (!data) return
        try {
          const buf = await file.arrayBuffer()
          const { gig, newMembers, newCrew } = excelToGig(buf, data)
          for (const m of newMembers) await saveMember(m)
          for (const c of newCrew) await saveCrew(c)
          await saveGig(gig, "import")
          setImportError(null)
          router.push(`/gigs/${gig.id}`)
          router.refresh()
        } catch (e) {
          setImportError(e instanceof Error ? e.message : IMPORT_FORMAT_ERROR)
        }
      }

  if (loading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const total = data.gigs.reduce((s, g) => s + g.totalFee, 0)

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-fg">{t("Gigs")}</h1>
          <p className="text-sm text-fg-muted">
            {t("{n} gigs · {total} total", { n: data.gigs.length, total: formatCompact(total) })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) onImportFile(f)
              e.target.value = ""
            }}
          />
          <Button
            variant="secondary"
            onClick={() => fileRef.current?.click()}
          >
            <FileUp className="h-4 w-4" />
            {t("Import")}
          </Button>
          <Link href="/gigs/new">
            <Button>
              <Plus className="h-4 w-4" />
              {t("New Gig")}
            </Button>
          </Link>
        </div>
      </div>

      {importError ? (
        <div className="rounded-lg bg-red-soft px-3 py-2 text-[13px] text-red">
          {importError}
        </div>
      ) : null}

      <Card className="p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={data.gigs.length > 0 ? t("Search by event, client, or city…") : t("Search gigs…")}
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-lg border border-line bg-elevated px-3 text-sm text-fg focus-ring"
          >
            <option value="all">{t("All statuses")}</option>
            {Object.entries(GIG_STATUS_LABEL).map(([k, v]) => (
              <option key={k} value={k}>
                {t(v)}
              </option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-5 w-5" />}
            title={data.gigs.length === 0 ? t("No gigs yet") : t("No matching gigs")}
            description={
              data.gigs.length === 0
                ? t("Create your first gig to start settling fees.")
                : t("Try a different search or status filter.")
            }
            action={
              data.gigs.length === 0 ? (
                <Link href="/gigs/new">
                  <Button size="sm">
                    <Plus className="h-3.5 w-3.5" />
                    {t("New Gig")}
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <THead>
              <Th>{t("Event")}</Th>
              <Th>{t("Date")}</Th>
              <Th>{t("Client")}</Th>
              <Th className="text-right">{t("Fee")}</Th>
              <Th className="text-right">{t("Net band")}</Th>
              <Th>{t("Status")}</Th>
            </THead>
            <TBody>
              {filtered.map((g) => {
                const s = computeSettlement(g, data)
                return (
                  <Tr key={g.id} onClick={() => router.push(`/gigs/${g.id}`)}>
                    <Td>
                      <div className="font-medium text-fg">{g.eventName}</div>
                      <div className="text-xs text-fg-muted">{g.gigType}</div>
                    </Td>
                    <Td className="text-fg-muted">{td(g.eventDate)}</Td>
                    <Td className="text-fg-muted">{g.client || "—"}</Td>
                    <Td className="tnum text-right font-medium text-fg">
                      {formatCompact(g.totalFee)}
                    </Td>
                    <Td className="tnum text-right text-fg-muted">
                      {formatCompact(s.netBand)}
                    </Td>
                    <Td>
                      <Badge tone={statusTone(g.status)} dot>
                        {t(GIG_STATUS_LABEL[g.status] ?? g.status)}
                      </Badge>
                    </Td>
                  </Tr>
                )
              })}
            </TBody>
          </Table>
        )}
      </Card>
    </div>
  )
}