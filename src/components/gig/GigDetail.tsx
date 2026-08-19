"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  FileDown,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react"
import { useData } from "@/components/DataProvider"
import { Badge, statusTone, GIG_STATUS_LABEL } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, SectionHeader } from "@/components/ui/Card"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Select } from "@/components/ui/Input"
import { Table, TBody, Td, Th, THead, Tr } from "@/components/ui/Table"
import { StatusSeal } from "@/components/gig/GigEditor"
import * as actions from "@/lib/actions"
import { computeSettlement } from "@/lib/calc"
import { excelFileName, gigToBlob } from "@/lib/excel"
import { formatIDR, toISODate } from "@/lib/money"
import { gigToPdfBytes, pdfFileName } from "@/lib/pdf"
import { useLocale } from "@/components/LocaleProvider"
import type { Gig } from "@/lib/types"

export function GigDetail({ gigId }: { gigId: string }) {
  const { data, loading, deleteGig, setGigStatus, setMemberPayment, setCrewPayment } =
    useData()
  const router = useRouter()
  const { t, td, locale } = useLocale()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const gig = useMemo(
    () => data?.gigs.find((g) => g.id === gigId) ?? null,
    [data, gigId],
  )

  const settlement = useMemo(
    () => (data && gig ? computeSettlement(gig, data) : null),
    [gig, data],
  )

  if (loading || !data) return null
  if (!gig) {
    return (
      <Card className="p-8 text-center text-sm text-fg-muted">
        {t("Gig not found.")}{" "}
        <Link href="/gigs" className="text-accent hover:underline">
          {t("Back to gigs")}
        </Link>
      </Card>
    )
  }

  const exportExcel = async () => {
    const blob = await gigToBlob(gig, data)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = excelFileName(gig)
    a.click()
    URL.revokeObjectURL(url)
    actions.logExportAction(gig.id, "xlsx").catch(() => {})
  }

  const exportPdf = async () => {
    const bytes = await gigToPdfBytes(gig, data, locale)
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = pdfFileName(gig)
    a.click()
    URL.revokeObjectURL(url)
    actions.logExportAction(gig.id, "pdf").catch(() => {})
  }

  const info: [string, string][] = [
    [t("Date"), td(gig.eventDate)],
    [t("Client"), gig.client || "—"],
    [t("Venue"), gig.venue || "—"],
    [t("City"), gig.city || "—"],
    [t("Soundcheck"), gig.soundcheckTime || "—"],
    [t("Show time"), gig.showTime || "—"],
    [t("Type"), gig.gigType],
  ]

  return (
    <div className="animate-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/gigs"
            className="focus-ring rounded-lg p-1.5 text-fg-muted hover:bg-muted hover:text-fg"
            aria-label={t("Back to gigs")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-fg">
                {gig.eventName}
              </h1>
              <Badge tone={statusTone(gig.status)} dot>
                {t(GIG_STATUS_LABEL[gig.status] ?? gig.status)}
              </Badge>
            </div>
            <p className="text-[13px] text-fg-muted">
              {formatIDR(gig.totalFee)} · {td(gig.eventDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={exportExcel}>
            <FileDown className="h-3.5 w-3.5" />
            {t("Export")}
          </Button>
          <Button variant="secondary" onClick={exportPdf}>
            <FileText className="h-3.5 w-3.5" />
            {t("Export PDF")}
          </Button>
          <Link href={`/gigs/${gig.id}/edit`}>
            <Button variant="secondary">
              <Pencil className="h-3.5 w-3.5" />
              {t("Edit")}
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-5">
            <SectionHeader title={t("Info")} className="mb-4" />
            <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {info.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 text-sm">
                  <span className="text-fg-muted">{k}</span>
                  <span className="font-medium text-fg">{v}</span>
                </div>
              ))}
            </div>
            {gig.notes ? (
              <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-sm text-fg-muted">
                {gig.notes}
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <SectionHeader
              title={t("Members")}
              action={
                <Select
                  value={gig.status}
                  onChange={(e) =>
                    setGigStatus(gig.id, e.target.value as Gig["status"])
                  }
                  className="h-8 w-36 text-[13px]"
                >
                  {Object.entries(GIG_STATUS_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>
                      {t(v)}
                    </option>
                  ))}
                </Select>
              }
            />
            <div className="mt-3">
              <Table>
                <THead>
                  <Th>{t("Member")}</Th>
                  <Th className="text-right">{t("Split")}</Th>
                  <Th className="text-right">{t("Payout")}</Th>
                  <Th>{t("Status")}</Th>
                </THead>
                <TBody>
                  {gig.members.map((gm) => {
                    const person = data.members.find((m) => m.id === gm.memberId)
                    const line = settlement?.memberLines.find((l) => l.gigMember.id === gm.id)
                    return (
                      <Tr key={gm.id}>
                        <Td className="font-medium text-fg">
                          {person?.name ?? t("Unknown")}
                          <span className="ml-2 text-xs font-normal text-fg-subtle">
                            {person?.role}
                          </span>
                        </Td>
                        <Td className="tnum text-right text-fg-muted">
                          {gig.splitMode === "percentage" ? `${gm.splitPct}%` : t("Equal")}
                        </Td>
                        <Td className="tnum text-right font-medium text-fg">
                          {formatIDR(line?.payout ?? 0)}
                        </Td>
                        <Td>
                          <PaymentToggle
                            status={gm.paymentStatus}
                            method={gm.paymentMethod}
                            onMark={() =>
                              setMemberPayment(
                                gig.id,
                                gm.id,
                                gm.paymentStatus === "paid" ? "pending" : "paid",
                                gm.paymentStatus === "paid" ? undefined : toISODate(new Date()),
                                gm.paymentStatus === "paid" ? undefined : "Transfer",
                              )
                            }
                            onMethod={(m) =>
                              setMemberPayment(gig.id, gm.id, "paid", gm.paymentDate ?? toISODate(new Date()), m)
                            }
                          />
                        </Td>
                      </Tr>
                    )
                  })}
                </TBody>
              </Table>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title={t("Production team")} />
            <div className="mt-3">
              <Table>
                <THead>
                  <Th>{t("Name")}</Th>
                  <Th>{t("Role")}</Th>
                  <Th className="text-right">{t("Fee")}</Th>
                  <Th className="text-right">{t("Meals")}</Th>
                  <Th>{t("Status")}</Th>
                </THead>
                <TBody>
                  {gig.crew.map((gc) => {
                    const person = data.crew.find((c) => c.id === gc.crewId)
                    const line = settlement?.crewLines.find((l) => l.crew.id === gc.id)
                    return (
                      <Tr key={gc.id}>
                        <Td className="font-medium text-fg">{person?.name ?? t("Unknown")}</Td>
                        <Td className="text-fg-muted">{gc.role}</Td>
                        <Td className="tnum text-right font-medium text-fg">
                          {formatIDR(gc.fee)}
                        </Td>
                        <Td className="tnum text-right text-fg-muted">
                          {line?.meal ? formatIDR(line.meal) : "—"}
                        </Td>
                        <Td>
                          <PaymentToggle
                            status={gc.paymentStatus}
                            method={gc.paymentMethod}
                            onMark={() =>
                              setCrewPayment(
                                gig.id,
                                gc.id,
                                gc.paymentStatus === "paid" ? "pending" : "paid",
                                gc.paymentStatus === "paid" ? undefined : toISODate(new Date()),
                                gc.paymentStatus === "paid" ? undefined : "Transfer",
                              )
                            }
                            onMethod={(m) =>
                              setCrewPayment(gig.id, gc.id, "paid", gc.paymentDate ?? toISODate(new Date()), m)
                            }
                          />
                        </Td>
                      </Tr>
                    )
                  })}
                </TBody>
              </Table>
            </div>
          </Card>

          {gig.expenses.length > 0 ? (
            <Card className="p-5">
              <SectionHeader title={t("Expenses")} />
              <div className="mt-3">
                <Table>
                  <THead>
                    <Th>{t("Category")}</Th>
                    <Th>{t("Name")}</Th>
                    <Th className="text-right">{t("Amount")}</Th>
                  </THead>
                  <TBody>
                    {gig.expenses.map((e) => (
                      <Tr key={e.id}>
                        <Td className="text-fg-muted">{e.category}</Td>
                        <Td className="font-medium text-fg">{e.name}</Td>
                        <Td className="tnum text-right font-medium text-fg">
                          {formatIDR(e.amount)}
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </div>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <Card className="p-5">
            <SectionHeader title={t("Settlement")} className="mb-4" />
            {settlement ? (
              <div className="space-y-2">
                <LedgerRow label={t("Gig fee")} value={settlement.gigFee} />
                <LedgerRow label={t("Crew")} value={-settlement.crewTotal} />
                <LedgerRow label={t("Meals")} value={-settlement.mealTotal} />
                <LedgerRow label={t("Production")} value={-settlement.productionTotal} />
                <LedgerRow label={t("Other")} value={-settlement.otherTotal} />
                <div className="my-2 border-t border-dashed border-line" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-fg">{t("Net band")}</span>
                  <span className="tnum text-sm font-semibold text-fg">
                    {formatIDR(settlement.netBand)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-fg-muted">
                    {t("÷ {n} members", { n: settlement.memberCount })}
                  </span>
                  <span className="tnum text-sm font-semibold text-accent">
                    {formatIDR(settlement.perMember)}
                  </span>
                </div>
                <StatusSeal status={settlement.balanceStatus} />
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t("Delete gig?")}
        description={t("This permanently removes the gig and its settlement lines.")}
        confirmLabel={t("Delete gig")}
        onConfirm={async () => {
          await deleteGig(gig.id)
          router.push("/gigs")
        }}
      />
    </div>
  )
}

function LedgerRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-fg-muted">{label}</span>
      <span className="tnum font-medium text-fg">
        {value < 0 ? `−${formatIDR(Math.abs(value))}` : formatIDR(value)}
      </span>
    </div>
  )
}

function PaymentToggle({
  status,
  method,
  onMark,
  onMethod,
}: {
  status: "pending" | "paid"
  method?: string
  onMark: () => void
  onMethod: (m: string) => void
}) {
  const { t } = useLocale()
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onMark}
        className={
          "focus-ring inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors " +
          (status === "paid"
            ? "bg-green-soft text-green"
            : "bg-amber-soft text-amber")
        }
        title={status === "paid" ? t("Mark as pending") : t("Mark as paid")}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {status === "paid" ? t("Paid") : t("Pending")}
      </button>
      {status === "paid" ? (
        <select
          value={method ?? "Transfer"}
          onChange={(e) => onMethod(e.target.value)}
          className="h-6 rounded border border-line bg-elevated px-1 text-[11px] text-fg-muted focus-ring"
        >
          <option>{t("Transfer")}</option>
          <option>{t("Cash")}</option>
          <option>{t("QRIS")}</option>
        </select>
      ) : null}
    </div>
  )
}