import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib"
import fontkit from "@pdf-lib/fontkit"
import { computeSettlement } from "./calc"
import { formatDateLocal, translate, type Locale } from "./i18n"
import { formatIDR } from "./money"
import type { AppData, Gig } from "./types"

const W = 595.28
const H = 841.89
const M = 48

// Itinerary palette
const INK = rgb(0.09, 0.09, 0.11)
const SUB = rgb(0.42, 0.44, 0.47)
const FAINT = rgb(0.6, 0.62, 0.65)
const LINE = rgb(0.86, 0.87, 0.89)
const SURFACE = rgb(0.96, 0.965, 0.97)
const BAND = rgb(0.075, 0.08, 0.105)
const BAND_MUTED = rgb(0.58, 0.61, 0.66)
const ACCENT = rgb(0.93, 0.42, 0.24)
const ACCENT_DEEP = rgb(0.74, 0.29, 0.15)
const ACCENT_DIM = rgb(1, 0.945, 0.915)
const WHITE = rgb(1, 1, 1)
const BAND_H = 78

const BLUE_DEEP = rgb(0.16, 0.36, 0.75)
const BLUE_DIM = rgb(0.92, 0.95, 1)
const GREEN_DEEP = rgb(0.09, 0.48, 0.25)
const GREEN_DIM = rgb(0.93, 0.98, 0.94)
const AMBER_DEEP = rgb(0.72, 0.45, 0.07)
const AMBER_DIM = rgb(1, 0.97, 0.89)
const RED_DEEP = rgb(0.74, 0.2, 0.2)
const RED_DIM = rgb(1, 0.94, 0.94)

const STATUS: Record<string, [string, string]> = {
  draft: ["Draft", "Draf"],
  confirmed: ["Confirmed", "Terkonfirmasi"],
  paid: ["Paid", "Lunas"],
  cancelled: ["Cancelled", "Dibatalkan"],
}

const STATUS_CHIP: Record<string, { fg: typeof INK; bg: typeof INK }> = {
  draft: { fg: SUB, bg: SURFACE },
  confirmed: { fg: BLUE_DEEP, bg: BLUE_DIM },
  paid: { fg: GREEN_DEEP, bg: GREEN_DIM },
  cancelled: { fg: RED_DEEP, bg: RED_DIM },
}

const BALANCE_STYLE: Record<string, { fg: typeof INK; bg: typeof INK }> = {
  balanced: { fg: GREEN_DEEP, bg: GREEN_DIM },
  over_budget: { fg: AMBER_DEEP, bg: AMBER_DIM },
  split_invalid: { fg: RED_DEEP, bg: RED_DIM },
}

export async function gigToPdfBytes(
  gig: Gig,
  state: AppData,
  locale: Locale,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`${gig.eventName} — Settlement`)
  doc.setCreator("magicpie")
  doc.setProducer("magicpie")

  const fnt = await loadPdfFonts(doc)
  const { regular, semibold, bold, italic } = fnt
  const clean = (s: string) => (fnt.custom ? s : toAscii(s))

  const t = (k: string, params?: Record<string, string | number>) => translate(k, locale, params)
  const dash = (v: string) => v || "—"
  const money = (n: number) => (n < 0 ? "−" : "") + formatIDR(Math.abs(n))

  let page = doc.addPage([W, H])
  let y = H

  const ensure = (needed: number) => {
    if (y - needed < 56) {
      page = doc.addPage([W, H])
      y = H - M
    }
  }

  const sectionLabel = (title: string) => {
    ensure(70)
    y -= 6
    page.drawRectangle({ x: M, y: y - 3, width: 4, height: 15, color: ACCENT })
    page.drawText(title, { x: M + 12, y, size: 13, font: bold, color: INK })
    y -= 18
  }

  const pill = (leftX: number, midY: number, text: string, fg: typeof INK, bg: typeof INK) => {
    const w = semibold.widthOfTextAtSize(text, 8.5) + 24
    page.drawSvgPath(roundRectPath(w, 20, 10), { x: leftX, y: midY + 10, color: bg })
    page.drawText(text, { x: leftX + 12, y: baseline(midY, 8.5, semibold), size: 8.5, font: semibold, color: fg })
    return w
  }

  type Column = { label: string; x: number; width: number; align?: "left" | "right" }
  type Cell = string | { text: string; f?: typeof regular; color?: typeof INK }

  const tableHead = (cols: Column[]) => {
    ensure(30)
    y -= 8
    for (const c of cols) {
      const xx = c.align === "right" ? c.x + c.width : c.x
      page.drawText(fitText(c.label.toUpperCase(), semibold, 7.5, c.width), {
        x: xx,
        y,
        size: 7.5,
        font: semibold,
        color: FAINT,
      })
    }
    const ly = y - 5
    page.drawLine({ start: { x: M, y: ly }, end: { x: W - M, y: ly }, thickness: 0.6, color: LINE })
    y -= 14
  }

  const tableRow = (cols: Column[], cells: Cell[], size = 9.5, rowH = 19) => {
    ensure(rowH + 2)
    for (let i = 0; i < cols.length; i++) {
      const c = cols[i]
      const cell = cells[i]
      const text = typeof cell === "string" ? cell : cell.text
      const f = typeof cell === "string" ? regular : cell.f ?? regular
      const color = typeof cell === "string" ? INK : cell.color ?? INK
      const w = f.widthOfTextAtSize(text, size)
      const x = c.align === "right" ? c.x + c.width - w : c.x
      page.drawText(fitText(text, f, size, c.width), { x, y, size, font: f, color })
    }
    y -= rowH
  }

  // ---- Header band ----
  page.drawRectangle({ x: 0, y: H - BAND_H, width: W, height: BAND_H, color: BAND })
  page.drawRectangle({ x: 0, y: H - 5, width: W, height: 5, color: ACCENT })
  page.drawText("magicpie", { x: M, y: H - 33, size: 21, font: italic, color: WHITE })
  const bandLabel = t("Settlement report").toUpperCase()
  const spaced = bandLabel.split("").join(" ")
  const blW = semibold.widthOfTextAtSize(spaced, 9)
  page.drawCircle({ x: W - M - blW - 11, y: H - 30, size: 2, color: ACCENT })
  page.drawText(spaced, { x: W - M - blW, y: H - 33, size: 9, font: semibold, color: BAND_MUTED })

  // ---- Title block ----
  y = H - BAND_H - 26
  const statusKey = gig.status
  const st = STATUS[statusKey]
  const stLabel = t(st?.[0] ?? statusKey)
  const stStyle = STATUS_CHIP[statusKey] ?? { fg: SUB, bg: SURFACE }
  const stW = semibold.widthOfTextAtSize(stLabel, 8.5) + 24
  pill(W - M - stW, y - 10, stLabel, stStyle.fg, stStyle.bg)
  const dateStr = formatDateLocal(gig.eventDate, locale)
  const dtW = semibold.widthOfTextAtSize(dateStr, 8.5) + 24
  pill(W - M - dtW, y - 32, dateStr, ACCENT_DEEP, ACCENT_DIM)

  const eventName = clean(gig.eventName || "—")
  const name = fitText(eventName, bold, 23, W - 2 * M - Math.max(stW, dtW) - 12)
  page.drawText(name, { x: M, y, size: 23, font: bold, color: INK })

  y -= 30
  const sub = [gig.gigType, clean(gig.client), [clean(gig.venue), clean(gig.city)].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(" · ")
  page.drawText(fitText(sub || "—", regular, 11, W - 2 * M), { x: M, y, size: 11, font: regular, color: SUB })

  y -= 20
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: LINE })
  y -= 22

  // ---- Info cards ----
  const cards: [string, string][] = [
    [t("Date"), dateStr],
    [t("Client"), clean(dash(gig.client))],
    [t("Venue"), clean(dash(gig.venue))],
    [t("City"), clean(dash(gig.city))],
    [t("Soundcheck"), dash(gig.soundcheckTime)],
    [t("Show time"), dash(gig.showTime)],
  ]
  const gap = 8
  const colsN = 3
  const cw = (W - 2 * M - gap * (colsN - 1)) / colsN
  const chh = 42
  ensure(2 * chh + gap + 20)
  cards.forEach(([label, value], idx) => {
    const cx = M + (idx % colsN) * (cw + gap)
    const ct = y - Math.floor(idx / colsN) * (chh + gap)
    page.drawSvgPath(roundRectPath(cw, chh, 9), { x: cx, y: ct, color: SURFACE })
    page.drawText(label.toUpperCase(), { x: cx + 14, y: ct - 16, size: 7.5, font: semibold, color: FAINT })
    page.drawText(fitText(value, regular, 10.5, cw - 30), { x: cx + 14, y: ct - 32, size: 10.5, font: regular, color: INK })
  })
  y -= 2 * chh + gap

  const settlement = computeSettlement(gig, state)

  // ---- Band ----
  sectionLabel(t("Band"))
  const bandCols: Column[] = [
    { label: t("Member"), x: M, width: 240 },
    { label: t("Split"), x: M + 240, width: 110, align: "right" },
    { label: t("Payout"), x: M + 350, width: 149, align: "right" },
  ]
  tableHead(bandCols)
  for (const line of settlement.memberLines) {
    tableRow(bandCols, [
      { text: line.person?.name ?? t("Unknown"), f: semibold },
      gig.splitMode === "percentage" ? `${line.gigMember.splitPct}%` : t("Equal"),
      { text: money(line.payout), f: semibold },
    ])
  }
  ensure(24)
  page.drawLine({ start: { x: M, y: y + 8 }, end: { x: W - M, y: y + 8 }, thickness: 0.6, color: LINE })
  tableRow(
    bandCols,
    [{ text: t("Total payout"), f: semibold, color: SUB }, "", { text: money(settlement.memberPayoutTotal), f: semibold }],
  )

  // ---- Production team ----
  if (settlement.crewLines.length > 0) {
    sectionLabel(t("Production team"))
    const hasMeals = settlement.mealTotal > 0
    const crewCols: Column[] = hasMeals
      ? [
          { label: t("Name"), x: M, width: 200 },
          { label: t("Role"), x: M + 200, width: 130 },
          { label: t("Fee"), x: M + 330, width: 100, align: "right" },
          { label: t("Meals"), x: M + 430, width: 69, align: "right" },
        ]
      : [
          { label: t("Name"), x: M, width: 230 },
          { label: t("Role"), x: M + 230, width: 149 },
          { label: t("Fee"), x: M + 379, width: 120, align: "right" },
        ]
    tableHead(crewCols)
    for (const line of settlement.crewLines) {
      const cells: Cell[] = [
        { text: line.person?.name ?? t("Unknown"), f: semibold },
        line.crew.role,
        { text: money(line.crew.fee), f: semibold },
      ]
      if (hasMeals) cells.push({ text: line.meal ? money(line.meal) : "—", color: SUB })
      tableRow(crewCols, cells)
    }
  }

  // ---- Expenses ----
  if (gig.expenses.length > 0) {
    sectionLabel(t("Expenses"))
    const expCols: Column[] = [
      { label: t("Category"), x: M, width: 130 },
      { label: t("Name"), x: M + 130, width: 255 },
      { label: t("Amount"), x: M + 385, width: 114, align: "right" },
    ]
    tableHead(expCols)
    for (const e of gig.expenses) {
      tableRow(expCols, [
        { text: e.category, color: SUB },
        { text: e.name, f: semibold },
        { text: money(e.amount), f: semibold },
      ])
    }
  }

  // ---- Summary ----
  sectionLabel(t("Summary"))
  const summary: [string, string][] = [
    [t("Gig fee"), money(settlement.gigFee)],
    [t("Crew"), money(-settlement.crewTotal)],
    [t("Meals"), money(-settlement.mealTotal)],
    [t("Production"), money(-settlement.productionTotal)],
    [t("Other"), money(-settlement.otherTotal)],
  ]
  for (const [k, v] of summary) {
    ensure(22)
    page.drawText(k, { x: M, y, size: 9.5, font: regular, color: SUB })
    const vw = semibold.widthOfTextAtSize(v, 9.5)
    page.drawText(v, { x: W - M - vw, y, size: 9.5, font: semibold, color: INK })
    y -= 20
  }
  page.drawLine({
    start: { x: M, y },
    end: { x: W - M, y },
    thickness: 0.7,
    color: LINE,
    dashArray: [3, 3],
  })
  y -= 14
  const balKey = settlement.balanceStatus
  const balLabel = t(balKey === "balanced" ? "Balanced" : balKey === "over_budget" ? "Over budget" : "Split invalid")
  const balStyle = BALANCE_STYLE[balKey] ?? { fg: SUB, bg: SURFACE }
  const balW = semibold.widthOfTextAtSize(balLabel, 8.5) + 24
  ensure(36)
  page.drawSvgPath(roundRectPath(W - 2 * M, 30, 8), { x: M, y: y + 6, color: SURFACE })
  pill(M + 12, y - 9, balLabel, balStyle.fg, balStyle.bg)
  page.drawText(t("Net band"), { x: M + 12 + balW + 14, y, size: 11, font: bold, color: INK })
  const nb = money(settlement.netBand)
  const nbW = bold.widthOfTextAtSize(nb, 12)
  page.drawText(nb, { x: W - M - nbW, y, size: 12, font: bold, color: INK })
  y -= 30
  ensure(30)
  page.drawText(t("÷ {n} members", { n: settlement.memberCount }), { x: M, y, size: 9.5, font: regular, color: SUB })
  const pm = money(settlement.perMember)
  const pmW = bold.widthOfTextAtSize(pm, 13)
  page.drawText(pm, { x: W - M - pmW, y, size: 13, font: bold, color: ACCENT_DEEP })
  y -= 24

  // ---- Footer (all pages) ----
  const pages = doc.getPages()
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 36 }, end: { x: W - M, y: 36 }, thickness: 0.7, color: LINE })
    p.drawText("magicpie", { x: M, y: 26, size: 8.5, font: italic, color: FAINT })
    const pg = t("Page {n} of {total}", { n: i + 1, total: pages.length })
    p.drawText(pg, {
      x: W - M - regular.widthOfTextAtSize(pg, 8),
      y: 26,
      size: 8,
      font: regular,
      color: FAINT,
    })
  })

  return doc.save()
}

export function pdfFileName(gig: Gig): string {
  const safeName = gig.eventName.replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_")
  return `Magicpie_Report_${safeName || "Event"}_${gig.eventDate}.pdf`
}

const fontBytesCache = new Map<string, Promise<ArrayBuffer>>()

async function fetchFontBytes(name: string): Promise<ArrayBuffer> {
  let p = fontBytesCache.get(name)
  if (!p) {
    p = fetch(`/fonts/${name}`).then(async (r) => {
      if (!r.ok) throw new Error(`font ${name} unavailable`)
      return r.arrayBuffer()
    })
    fontBytesCache.set(name, p)
  }
  return p
}

interface PdfFonts {
  regular: PDFFont
  semibold: PDFFont
  bold: PDFFont
  italic: PDFFont
  mono: PDFFont
  custom: boolean
}

async function loadPdfFonts(doc: PDFDocument): Promise<PdfFonts> {
  const defs: {
    key: "regular" | "semibold" | "bold" | "italic" | "mono"
    file: string
    fallback: StandardFonts
  }[] = [
    { key: "regular", file: "Poppins-Regular.ttf", fallback: StandardFonts.Helvetica },
    { key: "semibold", file: "Poppins-SemiBold.ttf", fallback: StandardFonts.HelveticaBold },
    { key: "bold", file: "Poppins-Bold.ttf", fallback: StandardFonts.HelveticaBold },
    { key: "italic", file: "Poppins-Italic.ttf", fallback: StandardFonts.HelveticaOblique },
    { key: "mono", file: "IBMPlexMono-Regular.ttf", fallback: StandardFonts.Helvetica },
  ]
  const out = {} as PdfFonts
  let custom = true
  doc.registerFontkit(fontkit)
  for (const d of defs) {
    try {
      const bytes = await fetchFontBytes(d.file)
      out[d.key] = await doc.embedFont(new Uint8Array(bytes))
    } catch {
      custom = false
      out[d.key] = await doc.embedFont(d.fallback)
    }
  }
  out.custom = custom
  return out
}

function roundRectPath(w: number, h: number, r: number): string {
  const rr = Math.min(r, w / 2, h / 2)
  return [
    `M ${rr} 0`,
    `L ${w - rr} 0`,
    `Q ${w} 0 ${w} ${rr}`,
    `L ${w} ${h - rr}`,
    `Q ${w} ${h} ${w - rr} ${h}`,
    `L ${rr} ${h}`,
    `Q 0 ${h} 0 ${h - rr}`,
    `L 0 ${rr}`,
    `Q 0 0 ${rr} 0`,
    "Z",
  ].join(" ")
}

function baseline(cy: number, size: number, f: PDFFont): number {
  return cy + f.heightAtSize(size) * 0.38
}

function fitText(s: string, f: PDFFont, size: number, maxW: number): string {
  if (f.widthOfTextAtSize(s, size) <= maxW) return s
  let out = s
  while (out.length > 1 && f.widthOfTextAtSize(out + "…", size) > maxW) out = out.slice(0, -1)
  return out + "…"
}

function toAscii(s: string): string {
  const d = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return d.replace(/[^\x20-\x7E\u00A0\u00B7\u2013\u2014\u2018\u2019\u201C\u201D\u2026\u2022]/g, "·")
}

export async function itineraryToPdfBytes(
  tpl: {
    name: string
    templateType: "local" | "out_of_town"
    items: { time: string; label: string }[]
  },
  gig: Gig,
  locale: Locale,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`${tpl.name} — ${gig.eventName}`)
  doc.setCreator("magicpie")
  doc.setProducer("magicpie")

  const fnt = await loadPdfFonts(doc)
  const { regular, semibold, bold, italic, mono } = fnt
  const clean = (s: string) => (fnt.custom ? s : toAscii(s))

  const t = (k: string, params?: Record<string, string | number>) => translate(k, locale, params)
  const dash = (v: string) => v || "—"

  let page = doc.addPage([W, H])
  let y = H

  const ensure = (needed: number) => {
    if (y - needed < 56) {
      page = doc.addPage([W, H])
      y = H - M
    }
  }

  const sectionLabel = (title: string) => {
    ensure(44)
    y -= 6
    page.drawRectangle({ x: M, y: y - 3, width: 4, height: 15, color: ACCENT })
    page.drawText(title, { x: M + 12, y, size: 13, font: bold, color: INK })
    y -= 20
  }

  // ---- Header band ----
  page.drawRectangle({ x: 0, y: H - BAND_H, width: W, height: BAND_H, color: BAND })
  page.drawRectangle({ x: 0, y: H - 5, width: W, height: 5, color: ACCENT })
  page.drawText("magicpie", { x: M, y: H - 33, size: 21, font: italic, color: WHITE })
  const bandLabel = t("Itinerary").toUpperCase()
  const spaced = bandLabel.split("").join(" ")
  const blW = semibold.widthOfTextAtSize(spaced, 9)
  page.drawCircle({ x: W - M - blW - 11, y: H - 30, size: 2, color: ACCENT })
  page.drawText(spaced, { x: W - M - blW, y: H - 33, size: 9, font: semibold, color: BAND_MUTED })

  // ---- Title block ----
  y = H - BAND_H - 26
  const dateStr = formatDateLocal(gig.eventDate, locale)
  const dtW = semibold.widthOfTextAtSize(dateStr, 10) + 24
  const chipX = W - M - dtW
  page.drawSvgPath(roundRectPath(dtW, 26, 13), { x: chipX, y: y + 3, color: ACCENT_DIM })
  page.drawText(dateStr, {
    x: chipX + 12,
    y: baseline(y - 10, 10, semibold),
    size: 10,
    font: semibold,
    color: ACCENT_DEEP,
  })

  const typeLabel = t(tpl.templateType === "local" ? "Local" : "Out of town")
  const tyW = semibold.widthOfTextAtSize(typeLabel, 8.5) + 20
  const tyX = W - M - tyW
  page.drawSvgPath(roundRectPath(tyW, 20, 10), {
    x: tyX,
    y: y - 20,
    color: SURFACE,
    borderColor: LINE,
    borderWidth: 1,
  })
  page.drawText(typeLabel, {
    x: tyX + 10,
    y: baseline(y - 30, 8.5, semibold),
    size: 8.5,
    font: semibold,
    color: FAINT,
  })

  const eventName = clean(gig.eventName || "—")
  const name = fitText(eventName, bold, 23, W - 2 * M - dtW - 12)
  page.drawText(name, { x: M, y, size: 23, font: bold, color: INK })

  y -= 34
  const where = [clean(gig.venue), clean(gig.city)].filter(Boolean).join(", ")
  page.drawText(fitText(where || "—", regular, 11, W - 2 * M), {
    x: M,
    y,
    size: 11,
    font: regular,
    color: SUB,
  })

  y -= 22
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: LINE })
  y -= 24

  // ---- Info cards ----
  const cards: [string, string][] = [
    [t("Date"), dateStr],
    [t("Venue"), clean(dash(gig.venue))],
    [t("City"), clean(dash(gig.city))],
    [t("Soundcheck"), dash(gig.soundcheckTime)],
    [t("Show time"), dash(gig.showTime)],
    [t("Type"), dash(gig.gigType)],
  ]
  const gap = 10
  const cols = 3
  const cw = (W - 2 * M - gap * (cols - 1)) / cols
  const chh = 44
  ensure(2 * chh + gap + 20)
  cards.forEach(([label, value], idx) => {
    const cx = M + (idx % cols) * (cw + gap)
    const ct = y - Math.floor(idx / cols) * (chh + gap)
    page.drawSvgPath(roundRectPath(cw, chh, 9), { x: cx, y: ct, color: SURFACE })
    page.drawText(label.toUpperCase(), { x: cx + 14, y: ct - 16, size: 7.5, font: semibold, color: FAINT })
    page.drawText(fitText(value, regular, 10.5, cw - 30), {
      x: cx + 14,
      y: ct - 32,
      size: 10.5,
      font: regular,
      color: INK,
    })
  })
  y -= 2 * chh + gap

  // ---- Timeline ----
  sectionLabel(t("Day rundown"))
  const railX = M + 122
  for (const item of tpl.items) {
    ensure(38)
    const top = y
    const bottom = y - 36
    const mid = (top + bottom) / 2
    const show = item.label.toLowerCase() === "showtime"
    page.drawLine({
      start: { x: railX, y: top + 1 },
      end: { x: railX, y: bottom - 1 },
      thickness: 1.2,
      color: LINE,
    })
    page.drawCircle({ x: railX, y: mid, size: show ? 3.8 : 3, color: show ? ACCENT : INK })
    if (show) page.drawCircle({ x: railX, y: mid, size: 1.3, color: WHITE })
    const timeStr = dash(item.time)
    page.drawSvgPath(roundRectPath(90, 22, 11), { x: M, y: mid + 11, color: show ? ACCENT : ACCENT_DIM })
    page.drawText(timeStr, {
      x: M + (90 - mono.widthOfTextAtSize(timeStr, 9.5)) / 2,
      y: baseline(mid, 9.5, mono),
      size: 9.5,
      font: mono,
      color: show ? WHITE : ACCENT_DEEP,
    })
    const activity = clean(t(item.label))
    const actFont = show ? semibold : regular
    page.drawText(fitText(activity, actFont, 10.5, W - M - railX - 16), {
      x: railX + 14,
      y: baseline(mid, 10.5, actFont),
      size: 10.5,
      font: actFont,
      color: show ? ACCENT : INK,
    })
    y = bottom - 4
  }
  if (tpl.items.length === 0) {
    ensure(24)
    page.drawText(t("No items"), { x: railX + 14, y, size: 10.5, font: regular, color: FAINT })
    y -= 24
  }

  // ---- Maps ----
  const mapQuery = `${gig.venue}, ${gig.city}`.trim().replace(/,\s*,/g, ",").trim()
  if (mapQuery && mapQuery !== ",") {
    sectionLabel(t("Maps"))
    ensure(88)
    const ch2 = 56
    const cardBot = y - ch2
    page.drawSvgPath(roundRectPath(W - 2 * M, ch2, 10), { x: M, y, color: SURFACE })
    const pcx = M + 26
    const pcy = cardBot + 28
    page.drawCircle({ x: pcx, y: pcy, size: 17, color: ACCENT_DIM })
    const pin =
      "M 9.5 21 C 9.5 21 0 12.5 0 7.5 C 0 3.4 4.3 0 9.5 0 C 14.7 0 19 3.4 19 7.5 C 19 12.5 9.5 21 9.5 21 Z " +
      "M 9.5 10.5 C 7.4 10.5 5.7 8.8 5.7 6.7 C 5.7 4.6 7.4 2.9 9.5 2.9 C 11.6 2.9 13.3 4.6 13.3 6.7 C 13.3 8.8 11.6 10.5 9.5 10.5 Z"
    page.drawSvgPath(pin, { x: pcx - 9.5, y: pcy + 10.5, color: ACCENT })
    page.drawText(t("Venue location").toUpperCase(), {
      x: M + 56,
      y: cardBot + 43,
      size: 7.5,
      font: semibold,
      color: FAINT,
    })
    const addr = clean(mapQuery)
    page.drawText(fitText(addr, regular, 10.5, W - 2 * M - 56 - 210), {
      x: M + 56,
      y: cardBot + 26,
      size: 10.5,
      font: regular,
      color: INK,
    })
    const btnText = t("Open in Google Maps")
    const bw = semibold.widthOfTextAtSize(btnText, 8.5) + 30
    const bh = 26
    const bx = W - M - bw
    page.drawSvgPath(roundRectPath(bw, bh, 13), { x: bx, y: cardBot + 15 + bh, color: ACCENT })
    page.drawText(btnText, {
      x: bx + 15,
      y: baseline(cardBot + 28, 8.5, semibold),
      size: 8.5,
      font: semibold,
      color: WHITE,
    })
    y = cardBot - 24
  }

  // ---- Footer (all pages) ----
  const pages = doc.getPages()
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 36 }, end: { x: W - M, y: 36 }, thickness: 0.7, color: LINE })
    p.drawText("magicpie", { x: M, y: 26, size: 8.5, font: italic, color: FAINT })
    const pg = t("Page {n} of {total}", { n: i + 1, total: pages.length })
    p.drawText(pg, {
      x: W - M - regular.widthOfTextAtSize(pg, 8),
      y: 26,
      size: 8,
      font: regular,
      color: FAINT,
    })
  })

  return doc.save()
}

export function itineraryPdfFileName(name: string): string {
  const safeName = name.replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_")
  return `Magicpie_Itinerary_${safeName || "Template"}.pdf`
}