"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  CircleAlert,
  Plus,
  Trash2,
  X,
} from "lucide-react"
import { useData } from "@/components/DataProvider"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card, SectionHeader } from "@/components/ui/Card"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { Field, Input, Select, Textarea } from "@/components/ui/Input"
import { MoneyInput } from "@/components/ui/MoneyInput"
import { computeSettlement } from "@/lib/calc"
import { formatIDR } from "@/lib/money"
import { useLocale } from "@/components/LocaleProvider"
import {
  EXPENSE_CATEGORIES,
  GIG_TYPES,
  PRODUCTION_CATEGORIES,
  SHOW_PRESETS,
  SOUNDCHECK_PRESETS,
} from "@/lib/rules"
import { cn } from "@/lib/cn"
import type { Gig, GigMember, GigCrew, Expense } from "@/lib/types"

function newGig(): Gig {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    eventName: "",
    client: "",
    venue: "",
    city: "",
    eventDate: new Date().toISOString().slice(0, 10),
    gigType: "Wedding",
    totalFee: 0,
    soundcheckTime: "",
    showTime: "",
    mealOverride: null,
    splitMode: "equal",
    status: "draft",
    notes: "",
    createdAt: now,
    updatedAt: now,
    members: [],
    crew: [],
    expenses: [],
  }
}

export function GigEditor({ gigId }: { gigId?: string }) {
  const { data, loading, saveGig, deleteGig } = useData()
  const router = useRouter()
  const { t } = useLocale()

  const existing = useMemo(
    () => data?.gigs.find((g) => g.id === gigId) ?? null,
    [data, gigId],
  )

  const [draft, setDraft] = useState<Gig | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  const gig: Gig | null = draft ?? existing ?? (data && !gigId ? newGig() : null)

  const settlement = useMemo(
    () => (data && gig ? computeSettlement(gig, data) : null),
    [gig, data],
  )

  if (loading || !data) {
    return <p className="text-sm text-fg-muted">{t("Loading…")}</p>
  }

  if (!gig) return null

  const typeExamples: Record<string, { name: string; client: string }> = {
    Wedding: { name: t("e.g. Wedding of Sari & Raka"), client: t("e.g. Family of the bride") },
    "Private Event": { name: t("e.g. Rooftop birthday party"), client: t("e.g. Rizky's family") },
    Birthday: { name: t("e.g. Birthday at the garden"), client: t("e.g. Rizky's family") },
    Festival: { name: t("e.g. Djakarta Warehouse Project"), client: t("e.g. Ismaya Live") },
    Corporate: { name: t("e.g. Annual company dinner"), client: t("e.g. PT Maju Jaya") },
    Launch: { name: t("e.g. Product launch night"), client: t("e.g. Marketing team") },
  }
  const example = typeExamples[gig.gigType]
  const eventNamePlaceholder = example?.name ?? t("Give this gig a name")
  const clientPlaceholder = example?.client ?? t("Who's paying for the show?")

  const patch = (p: Partial<Gig>) => {
    setDraft({ ...gig, ...p, updatedAt: new Date().toISOString() })
  }

  const setMember = (id: string, p: Partial<GigMember>) => {
    patch({ members: gig.members.map((m) => (m.id === id ? { ...m, ...p } : m)) })
  }
  const removeMember = (id: string) => {
    patch({ members: gig.members.filter((m) => m.id !== id) })
  }
  const addMember = (memberId: string) => {
    if (gig.members.some((m) => m.memberId === memberId)) return
    const person = data.members.find((m) => m.id === memberId)
    if (!person) return
    const gm: GigMember = {
      id: crypto.randomUUID(),
      memberId,
      splitPct: person.defaultSplit,
      payout: 0,
      paymentStatus: "pending",
    }
    patch({ members: [...gig.members, gm] })
  }

  const setCrewRow = (id: string, p: Partial<GigCrew>) => {
    patch({ crew: gig.crew.map((c) => (c.id === id ? { ...c, ...p } : c)) })
  }
  const removeCrew = (id: string) => {
    patch({ crew: gig.crew.filter((c) => c.id !== id) })
  }
  const addCrew = (crewId: string) => {
    if (gig.crew.some((c) => c.crewId === crewId)) return
    const person = data.crew.find((c) => c.id === crewId)
    if (!person) return
    const row: GigCrew = {
      id: crypto.randomUUID(),
      crewId,
      role: person.role,
      roleType: person.roleType,
      fee: person.defaultFee,
      overrideRate: false,
      paymentStatus: "pending",
    }
    patch({ crew: [...gig.crew, row] })
  }

  const addExpense = () => {
    const e: Expense = {
      id: crypto.randomUUID(),
      category: "Uang Kas",
      name: "",
      amount: 0,
    }
    patch({ expenses: [...gig.expenses, e] })
  }
  const setExpense = (id: string, p: Partial<Expense>) => {
    patch({ expenses: gig.expenses.map((e) => (e.id === id ? { ...e, ...p } : e)) })
  }
  const removeExpense = (id: string) => {
    patch({ expenses: gig.expenses.filter((e) => e.id !== id) })
  }

  const availableMembers = data.members.filter(
    (m) => m.active && !gig.members.some((gm) => gm.memberId === m.id),
  )
  const availableCrew = data.crew.filter(
    (c) => c.active && !gig.crew.some((gc) => gc.crewId === c.id),
  )

  const save = async (dest?: string) => {
    if (!gig.eventName.trim()) return
    setSaving(true)
    try {
      await saveGig(gig)
      router.push(dest ?? `/gigs/${gig.id}`)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (gigId) {
      router.push("/gigs")
    } else if (gig.eventName.trim()) {
      save("/gigs")
    } else {
      router.push("/gigs")
    }
  }

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            disabled={saving}
            className="focus-ring rounded-lg p-1.5 text-fg-muted hover:bg-muted hover:text-fg disabled:opacity-50"
            aria-label={t("Back to gigs")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-fg">
              {gigId ? gig.eventName || t("Untitled gig") : t("New gig")}
            </h1>
            <p className="text-[13px] text-fg-muted">
              {formatIDR(gig.totalFee)} · {gig.eventDate}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {gigId ? (
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              <Trash2 className="h-3.5 w-3.5" />
              {t("Delete gig")}
            </Button>
          ) : null}
          <Button variant="secondary" onClick={() => router.push("/gigs")}>
            {t("Cancel")}
          </Button>
          <Button onClick={() => save()} disabled={saving || !gig.eventName.trim()}>
            <Check className="h-4 w-4" />
            {saving ? t("Saving…") : t("Save gig")}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="p-5">
            <SectionHeader title={t("Details")} className="mb-4" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("Event name")}>
                <Input
                  value={gig.eventName}
                  onChange={(e) => patch({ eventName: e.target.value })}
                  placeholder={eventNamePlaceholder}
                />
              </Field>
              <Field label={t("Client")}>
                <Input
                  value={gig.client}
                  onChange={(e) => patch({ client: e.target.value })}
                  placeholder={clientPlaceholder}
                />
              </Field>
              <Field label={t("Venue")}>
                <Input
                  value={gig.venue}
                  onChange={(e) => patch({ venue: e.target.value })}
                  placeholder={t("e.g. JIExpo Kemayoran")}
                />
              </Field>
              <Field label={t("City")}>
                <Input
                  value={gig.city}
                  onChange={(e) => patch({ city: e.target.value })}
                  placeholder={t("e.g. Bandung")}
                />
              </Field>
              <Field label={t("Date")}>
                <Input
                  type="date"
                  value={gig.eventDate}
                  onChange={(e) => patch({ eventDate: e.target.value })}
                />
              </Field>
              <Field label={t("Gig type")}>
                <Select
                  value={gig.gigType}
                  onChange={(e) => patch({ gigType: e.target.value })}
                >
                  {GIG_TYPES.map((ty) => (
                    <option key={ty} value={ty}>
                      {ty}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("Total fee")}>
                <MoneyInput
                  value={gig.totalFee}
                  onChange={(n) => patch({ totalFee: n })}
                />
              </Field>
              <Field label={t("Soundcheck time")} hint={t("Before the cutoff time, eligible crew get a meal allowance.")}>
                <Select
                  value={gig.soundcheckTime}
                  onChange={(e) => patch({ soundcheckTime: e.target.value })}
                >
                  <option value="">—</option>
                  {SOUNDCHECK_PRESETS.map((s) => (
                    <option key={s.time} value={s.time}>
                      {t(s.label)} ({s.time})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("Show time")}>
                <Select
                  value={gig.showTime}
                  onChange={(e) => patch({ showTime: e.target.value })}
                >
                  <option value="">—</option>
                  {SHOW_PRESETS.map((s) => (
                    <option key={s.time} value={s.time}>
                      {t(s.label)} ({s.time})
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("Meals")} hint={t("Override the automatic meal allowance for this gig.")}>
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 text-sm text-fg-muted">
                    <input
                      type="checkbox"
                      checked={gig.mealOverride !== null}
                      onChange={(e) =>
                        patch({
                          mealOverride: e.target.checked ? data.settings.mealRate : null,
                        })
                      }
                      className="focus-ring h-3.5 w-3.5 accent-[var(--accent)]"
                    />
                    {t("Override")}
                  </label>
                  {gig.mealOverride !== null ? (
                    <div className="w-36">
                      <MoneyInput
                        value={gig.mealOverride}
                        onChange={(n) => patch({ mealOverride: n })}
                      />
                    </div>
                  ) : (
                    <span className="text-[13px] text-fg-subtle">
                      {t("Auto ({fee} per eligible crew)", { fee: formatIDR(data.settings.mealRate) })}
                    </span>
                  )}
                </div>
              </Field>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader
              title={t("Band split")}
              description={t("How the net band share is divided among members.")}
              className="mb-4"
              action={
                <div className="flex items-center rounded-lg border border-line p-0.5">
                  {(["equal", "percentage"] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => patch({ splitMode: m })}
                      className={cn(
                        "rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                        gig.splitMode === m
                          ? "bg-accent text-accent-fg"
                          : "text-fg-muted hover:text-fg",
                      )}
                    >
                      {m === "equal" ? t("Equal") : t("% Split")}
                    </button>
                  ))}
                </div>
              }
            />
            {availableMembers.length > 0 ? (
              <div className="mb-3">
                <Select
                  value=""
                  onChange={(e) => e.target.value && addMember(e.target.value)}
                >
                  <option value="">{t("Add member…")}</option>
                  {availableMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {m.role}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <p className="mb-3 rounded-lg bg-muted px-3 py-2 text-[13px] text-fg-muted">
                {t("No more members available.")}{" "}
                <Link href="/masters" className="text-accent hover:underline">
                  {t("Manage members")}
                </Link>
              </p>
            )}
            {gig.members.length === 0 ? (
              <p className="text-[13px] text-fg-subtle">
                {t("Add at least one member to split the settlement.")}
              </p>
            ) : (
              <div className="divide-y divide-line">
                {gig.members.map((gm) => {
                  const person = data.members.find((m) => m.id === gm.memberId)
                  const line = settlement?.memberLines.find(
                    (l) => l.gigMember.id === gm.id,
                  )
                  return (
                    <div key={gm.id} className="flex items-center gap-3 py-2.5">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-fg-muted">
                          {person?.name.slice(0, 1) ?? "?"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-fg">
                            {person?.name ?? t("Unknown")}
                          </p>
                          <p className="truncate text-xs text-fg-muted">
                            {person?.role}
                          </p>
                        </div>
                      </div>
                      {gig.splitMode === "percentage" ? (
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={gm.splitPct}
                          onChange={(e) =>
                            setMember(gm.id, {
                              splitPct: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                            })
                          }
                          className="h-8 w-16 rounded-lg border border-line bg-elevated px-2 text-right text-sm tnum focus-ring focus-visible:border-accent"
                        />
                      ) : null}
                      <div className="w-28 text-right">
                        <p className="tnum text-sm font-medium text-fg">
                          {formatIDR(line?.payout ?? 0)}
                        </p>
                        <p className="text-[11px] text-fg-subtle">{t("payout")}</p>
                      </div>
                      <button
                        onClick={() => removeMember(gm.id)}
                        className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-red"
                        aria-label={t("Remove member")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            {gig.splitMode === "percentage" && settlement?.balanceStatus === "split_invalid" ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-red">
                <CircleAlert className="h-3.5 w-3.5" />
                {t("Splits total {total}% — they must equal 100%.", { total: settlement.splitTotal })}
              </p>
            ) : null}
          </Card>

          <Card className="p-5">
            <SectionHeader
              title={t("Production team")}
              description={t("Crew and specialists paid from the gig fee.")}
              className="mb-4"
            />
            {availableCrew.length > 0 ? (
              <div className="mb-3">
                <Select
                  value=""
                  onChange={(e) => e.target.value && addCrew(e.target.value)}
                >
                  <option value="">{t("Add crew…")}</option>
                  {availableCrew.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} · {c.role}
                    </option>
                  ))}
                </Select>
              </div>
            ) : (
              <p className="mb-3 rounded-lg bg-muted px-3 py-2 text-[13px] text-fg-muted">
                {t("No more crew available.")}{" "}
                <Link href="/masters" className="text-accent hover:underline">
                  {t("Manage crew")}
                </Link>
              </p>
            )}
            {gig.crew.length === 0 ? (
              <p className="text-[13px] text-fg-subtle">
                {t("No crew added. Gig fee goes fully to the band.")}
              </p>
            ) : (
              <div className="divide-y divide-line">
                {gig.crew.map((gc) => {
                  const person = data.crew.find((c) => c.id === gc.crewId)
                  const line = settlement?.crewLines.find((l) => l.crew.id === gc.id)
                  return (
                    <div key={gc.id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-fg-muted">
                          {person?.name.slice(0, 1) ?? "?"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-fg">
                            {person?.name ?? t("Unknown")}
                          </p>
                          <p className="truncate text-xs text-fg-muted">
                            {person?.role}
                          </p>
                        </div>
                      </div>
                      <div className="w-32">
                        <MoneyInput value={gc.fee} onChange={(n) => setCrewRow(gc.id, { fee: n })} />
                      </div>
                      {gc.roleType === "standard" ? (
                        <label className="flex items-center gap-1.5 text-xs text-fg-muted">
                          <input
                            type="checkbox"
                            checked={gc.overrideRate}
                            onChange={(e) => setCrewRow(gc.id, { overrideRate: e.target.checked })}
                            className="focus-ring h-3.5 w-3.5 accent-[var(--accent)]"
                          />
                          {t("Override")}
                        </label>
                      ) : null}
                      {line?.meal ? (
                        <Badge tone="amber" className="hidden sm:inline-flex">
                          {t("+ meal {amount}", { amount: formatIDR(line.meal) })}
                        </Badge>
                      ) : null}
                      {!line?.validation.ok ? (
                        <span className="text-xs text-red">{line?.validation.message}</span>
                      ) : null}
                      <button
                        onClick={() => removeCrew(gc.id)}
                        className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-red"
                        aria-label={t("Remove crew")}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <SectionHeader
              title={t("Expenses")}
              description={t("Production and other costs. Production categories sit between crew and meals in the ledger.")}
              className="mb-4"
            />
            {gig.expenses.map((e) => (
              <div key={e.id} className="mb-2 flex flex-wrap items-center gap-2">
                <Select
                  value={e.category}
                  onChange={(ev) => setExpense(e.id, { category: ev.target.value })}
                  className="w-40"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                <Input
                  value={e.name}
                  onChange={(ev) => setExpense(e.id, { name: ev.target.value })}
                  placeholder={PRODUCTION_CATEGORIES.includes(e.category) ? t("e.g. Photographer") : t("e.g. Transport")}
                  className="w-40"
                />
                <div className="w-36">
                  <MoneyInput value={e.amount} onChange={(n) => setExpense(e.id, { amount: n })} />
                </div>
                <button
                  onClick={() => removeExpense(e.id)}
                  className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-red"
                  aria-label={t("Remove expense")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={addExpense}>
              <Plus className="h-3.5 w-3.5" />
              {t("Add expense")}
            </Button>
          </Card>

          <Card className="p-5">
            <Field label={t("Notes")}>
              <Textarea
                value={gig.notes}
                onChange={(e) => patch({ notes: e.target.value })}
                placeholder={t("e.g. Backline provided by the venue…")}
              />
            </Field>
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <SettlementLedger settlement={settlement} />
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

function SettlementLedger({
  settlement,
}: {
  settlement: ReturnType<typeof computeSettlement> | null
}) {
  const { t } = useLocale()
  const statusColor = !settlement
    ? "text-fg-subtle"
    : settlement.balanceStatus === "balanced"
      ? "text-green"
      : "text-red"

  const rows = settlement
    ? [
        { label: t("Gig fee"), value: settlement.gigFee, tone: "" },
        { label: t("Crew"), value: -settlement.crewTotal, tone: "" },
        { label: t("Meals"), value: -settlement.mealTotal, tone: "" },
        { label: t("Production"), value: -settlement.productionTotal, tone: "" },
        { label: t("Other"), value: -settlement.otherTotal, tone: "" },
      ]
    : []

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-line px-5 py-4">
        <p className="text-[13px] font-medium text-fg-muted">{t("Settlement")}</p>
        <p className={cn("mt-0.5 text-sm font-medium", statusColor)}>
          {settlement?.balanceStatus === "balanced"
            ? t("Balanced")
            : settlement?.balanceStatus === "over_budget"
              ? t("Over budget")
              : settlement?.balanceStatus === "split_invalid"
                ? t("Split invalid")
                : "…"}
        </p>
      </div>
      <div className="px-5 py-4">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between py-1 text-sm">
            <span className="text-fg-muted">{r.label}</span>
            <span className={cn("tnum font-medium text-fg", r.value < 0 ? "" : "")}>
              {r.value === 0 ? formatIDR(0) : `${r.value < 0 ? "−" : "+"}${formatIDR(Math.abs(r.value))}`}
            </span>
          </div>
        ))}
        <div className="my-2 border-t border-dashed border-line" />
        <div className="flex items-center justify-between py-1">
          <span className="text-sm font-semibold text-fg">{t("Net band")}</span>
          <span className="tnum text-sm font-semibold text-fg">
            {formatIDR(settlement?.netBand ?? 0)}
          </span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="text-sm text-fg-muted">
            {t("÷ {n} members", { n: settlement?.memberCount ?? 0 })}
          </span>
          <span className="tnum text-sm font-semibold text-accent">
            {formatIDR(settlement?.perMember ?? 0)}
          </span>
        </div>
        <div className="mt-3 border-t border-line pt-3">
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-fg-subtle">
            {t("Member payouts")}
          </p>
          {settlement?.memberLines.map((l) => (
            <div key={l.gigMember.id} className="flex items-center justify-between py-1 text-[13px]">
              <span className="text-fg-muted">{l.person?.name ?? t("Unknown")}</span>
              <span className="tnum font-medium text-fg">{formatIDR(l.payout)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          {!settlement || settlement.balanceStatus !== "balanced" ? (
            <p className="mb-2 text-xs text-red">
              {settlement?.balanceStatus === "over_budget"
                ? t("Total expenses exceed the gig fee.")
                : settlement?.balanceStatus === "split_invalid"
                  ? t("Percentage splits must total 100%.")
                  : t("Add a fee and at least one member to balance.")}
            </p>
          ) : null}
          <StatusSeal status={settlement?.balanceStatus ?? null} />
        </div>
      </div>
    </Card>
  )
}

export function StatusSeal({ status }: { status: "balanced" | "over_budget" | "split_invalid" | null }) {
  const { t } = useLocale()
  if (!status) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-[13px] text-fg-muted">
        {t("Waiting for input")}
      </div>
    )
  }
  const isBalanced = status === "balanced"
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium",
        isBalanced ? "bg-green-soft text-green" : "bg-red-soft text-red",
      )}
    >
      {isBalanced ? <Check className="h-4 w-4" /> : <CircleAlert className="h-4 w-4" />}
      {isBalanced ? t("Balanced — ready to finalize") : t("Not balanced — cannot finalize")}
    </div>
  )
}