"use client"

import { useState } from "react"
import { ExternalLink, FileDown, Plus, X } from "lucide-react"
import * as actions from "@/lib/actions"
import { Button } from "@/components/ui/Button"
import { Dialog } from "@/components/ui/Dialog"
import { Field, Input, Select } from "@/components/ui/Input"
import { useLocale } from "@/components/LocaleProvider"
import { itineraryPdfFileName, itineraryToPdfBytes } from "@/lib/pdf"
import { ITINERARY_KINDS, buildItinerary, type ItineraryKind } from "@/lib/rules"
import type { Gig, ItineraryItem, ItineraryTemplate } from "@/lib/types"

export function ItineraryDialog({
  gig,
  template,
  onClose,
  onSave,
}: {
  gig: Gig
  template: ItineraryTemplate | null
  onClose: () => void
  onSave: (tpl: ItineraryTemplate) => Promise<void>
}) {
  const { t, locale } = useLocale()
  const [name, setName] = useState(template?.name ?? gig.eventName)
  const [kind, setKind] = useState<ItineraryKind>(template?.templateType ?? "local")
  const [items, setItems] = useState<ItineraryItem[]>(
    template?.items ?? buildItinerary("local", gig.soundcheckTime, gig.showTime).map((i) => ({
      ...i,
      id: crypto.randomUUID(),
    })),
  )
  const [saving, setSaving] = useState(false)

  const mapQuery = `${gig.venue}, ${gig.city}`.trim().replace(/,\s*,/g, ",").trim()

  const applyKind = (k: ItineraryKind) => {
    setKind(k)
    setItems(buildItinerary(k, gig.soundcheckTime, gig.showTime).map((i) => ({
      ...i,
      id: crypto.randomUUID(),
    })))
  }

  const setItem = (id: string, p: Partial<ItineraryItem>) => {
    setItems(items.map((i) => (i.id === id ? { ...i, ...p } : i)))
  }
  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id))
  const addItem = () => setItems([...items, { id: crypto.randomUUID(), time: "", label: "" }])

  const exportPdf = async () => {
    const bytes = await itineraryToPdfBytes({ name, templateType: kind, items }, gig, locale)
    const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = itineraryPdfFileName(name)
    a.click()
    URL.revokeObjectURL(url)
    actions
      .logItineraryExportAction({
        templateId: template?.id,
        gigId: gig.id,
        name: name.trim() || gig.eventName,
      })
      .catch(() => {})
  }

  const save = async () => {
    setSaving(true)
    try {
      await onSave({
        id: template?.id ?? crypto.randomUUID(),
        gigId: gig.id,
        name: name.trim() || gig.eventName,
        templateType: kind,
        items,
        createdAt: template?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={template ? t("Edit itinerary template") : t("New itinerary template")}
      description={gig.eventName}
      className="max-w-2xl"
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label={t("Template name")}>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>
          <Field label={t("Type")}>
            <Select value={kind} onChange={(e) => applyKind(e.target.value as ItineraryKind)}>
              {ITINERARY_KINDS.map((k) => (
                <option key={k.id} value={k.id}>
                  {t(k.label)}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label={t("Rundown from soundcheck to show.")}>
          <div className="space-y-2">
            {items.length === 0 ? (
              <p className="rounded-lg bg-muted px-3 py-2 text-[13px] text-fg-muted">
                {t("Pick a template to build the day rundown.")}
              </p>
            ) : (
              items.map((item, idx) => (
                <div key={item.id} className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={item.time}
                    onChange={(e) => setItem(item.id, { time: e.target.value })}
                    className="w-28"
                    aria-label={t("Time")}
                  />
                  <Input
                    value={item.label}
                    onChange={(e) => setItem(item.id, { label: e.target.value })}
                    placeholder={
                      idx === 0
                        ? t("e.g. Load in & setup")
                        : idx === items.length - 1
                          ? t("e.g. Showtime")
                          : t("e.g. Doors open")
                    }
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-red"
                    aria-label={t("Remove item")}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
            <Button type="button" variant="secondary" size="sm" onClick={addItem}>
              <Plus className="h-3.5 w-3.5" />
              {t("Add item")}
            </Button>
          </div>
        </Field>

        {mapQuery ? (
          <div className="overflow-hidden rounded-lg border border-line">
            <iframe
              title="Venue map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=14&output=embed`}
              className="h-40 w-full"
              loading="lazy"
            />
            <div className="flex items-center justify-between gap-2 border-t border-line px-3 py-2">
              <span className="text-[13px] text-fg-muted">{t("Maps")}</span>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-[13px] font-medium text-accent hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t("Open in Google Maps")}
              </a>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={exportPdf}>
            <FileDown className="h-4 w-4" />
            {t("Download PDF")}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button type="submit" disabled={saving}>
            {t("Save template")}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}