"use client"

import { useState } from "react"
import { FileDown, MapPin, Pencil, Plus, Route, Trash2 } from "lucide-react"
import Link from "next/link"
import { useData } from "@/components/DataProvider"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { EmptyState } from "@/components/ui/EmptyState"
import { useLocale } from "@/components/LocaleProvider"
import { formatDateLocal } from "@/lib/i18n"
import { itineraryPdfFileName, itineraryToPdfBytes } from "@/lib/pdf"
import type { Gig, ItineraryTemplate } from "@/lib/types"
import { ItineraryDialog } from "./ItineraryDialog"

export function ItineraryList() {
  const { data, loading, saveItineraryTemplate, deleteItineraryTemplate } = useData()
  const { t, locale } = useLocale()
  const [editing, setEditing] = useState<{ gig: Gig; template: ItineraryTemplate | null } | null>(
    null,
  )
  const [confirmDelete, setConfirmDelete] = useState<ItineraryTemplate | null>(null)

  if (loading || !data) {
    return <p className="text-sm text-fg-muted">{t("Loading…")}</p>
  }

  const exportPdf = async (tpl: ItineraryTemplate) => {
    const gig = data.gigs.find((g) => g.id === tpl.gigId)
    if (!gig) return
    const bytes = await itineraryToPdfBytes(tpl, gig, locale)
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = itineraryPdfFileName(tpl.name)
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-fg">{t("Itinerary")}</h1>
        <p className="mt-1 text-sm text-fg-muted">{t("Rundown from soundcheck to show.")}</p>
      </div>

      {data.gigs.length === 0 ? (
        <Card className="p-5">
          <EmptyState
            icon={<Route className="h-5 w-5" />}
            title={t("No gigs yet")}
            description={t("Add a gig first to build its itinerary.")}
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {data.gigs.map((gig) => {
            const templates = data.templates.filter((tp) => tp.gigId === gig.id)
            return (
              <Card key={gig.id} className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/gigs/${gig.id}`}
                      className="truncate text-[15px] font-semibold text-fg hover:text-accent"
                    >
                      {gig.eventName}
                    </Link>
                    <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-fg-muted">
                      {formatDateLocal(gig.eventDate, locale)}
                      {gig.venue || gig.city ? (
                        <>
                          <span>·</span>
                          <MapPin className="h-3 w-3" />
                          {gig.venue || gig.city}
                          {gig.venue && gig.city ? `, ${gig.city}` : ""}
                        </>
                      ) : null}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => setEditing({ gig, template: null })}>
                    <Plus className="h-3.5 w-3.5" />
                    {t("New itinerary template")}
                  </Button>
                </div>

                {templates.length === 0 ? (
                  <p className="mt-4 rounded-lg bg-muted px-3 py-2.5 text-[13px] text-fg-muted">
                    {t("No itineraries yet")}
                  </p>
                ) : (
                  <div className="mt-3 divide-y divide-line">
                    {templates.map((tpl) => (
                      <div key={tpl.id} className="flex flex-wrap items-center gap-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-fg">{tpl.name}</p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <Badge tone={tpl.templateType === "local" ? "blue" : "zinc"}>
                              {t(tpl.templateType === "local" ? "Local" : "Out of town")}
                            </Badge>
                            <span className="text-xs text-fg-subtle">
                              {t("{n} items", { n: tpl.items.length })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditing({ gig, template: tpl })}
                            className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-fg"
                            aria-label={t("Edit itinerary template")}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => exportPdf(tpl)}
                            className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-fg"
                            aria-label={t("Download PDF")}
                          >
                            <FileDown className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(tpl)}
                            className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-red"
                            aria-label={t("Delete template")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {editing ? (
        <ItineraryDialog
          gig={editing.gig}
          template={editing.template}
          onClose={() => setEditing(null)}
          onSave={async (tpl) => {
            await saveItineraryTemplate(tpl)
            setEditing(null)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title={t("Delete template?")}
        description={t("This itinerary template will be removed.")}
        onConfirm={async () => {
          if (confirmDelete) await deleteItineraryTemplate(confirmDelete.id)
        }}
      />
    </div>
  )
}