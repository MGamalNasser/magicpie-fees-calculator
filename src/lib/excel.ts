import * as XLSX from "xlsx"
import ExcelJS from "exceljs"
import { computeSettlement } from "./calc"
import { SPECIALIST_ROLES } from "./rules"
import type { AppData, Gig } from "./types"

export const IMPORT_FORMAT_ERROR =
  "Format Excel tidak dikenali. Silakan gunakan Magicpie Template."

const DARK = "FF1A1E26"
const INK = "FF1A1E26"
const MUTED = "FF6B7280"
const FAINT = "FF9CA3AF"
const LIGHT = "FFF3F4F6"
const ACCENT = "FFBD4A26"
const GREEN = "FF17803D"
const AMBER = "FFB45309"

const MONEY_FMT = '"Rp"#,##0;[Red]-"Rp"#,##0'

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  confirmed: "Confirmed",
  paid: "Paid",
  cancelled: "Cancelled",
}

export async function gigToWorkbook(gig: Gig, state: AppData): Promise<ExcelJS.Workbook> {
  const settlement = computeSettlement(gig, state)

  const wb = new ExcelJS.Workbook()
  wb.creator = "magicpie"
  const ws = wb.addWorksheet("Settlement", {
    views: [{ showGridLines: false }],
    pageSetup: { orientation: "portrait", fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  })
  ws.columns = [{ width: 30 }, { width: 18 }, { width: 14 }, { width: 14 }, { width: 14 }]

  const moneyFmt = (r: number, c: number, value: number, opts?: { bold?: boolean; color?: string; size?: number; fill?: string }) => {
    const cell = ws.getCell(r, c)
    cell.value = value
    cell.numFmt = MONEY_FMT
    cell.font = { bold: opts?.bold ?? true, size: opts?.size ?? 10, color: { argb: opts?.color ?? INK } }
    cell.alignment = { horizontal: "right", vertical: "middle" }
    if (opts?.fill) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: opts.fill } }
    return cell
  }

  // ---- Title block ----
  ws.mergeCells("A1:E1")
  ws.getCell("A1").value = "Magicpie Settlement"
  ws.getCell("A1").font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } }
  ws.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } }
  ws.getCell("A1").alignment = { vertical: "middle" }
  ws.getRow(1).height = 30

  ws.mergeCells("A2:E2")
  ws.getCell("A2").value = gig.eventName
  ws.getCell("A2").font = { bold: true, size: 12, color: { argb: INK } }
  ws.getRow(2).height = 20

  ws.mergeCells("A3:E3")
  ws.getCell("A3").value = `${gig.gigType} · ${gig.eventDate}`
  ws.getCell("A3").font = { italic: true, size: 10, color: { argb: MUTED } }

  // ---- Meta block ----
  const meta: [string, string | number][] = [
    ["Client", gig.client || "—"],
    ["Venue", gig.venue || "—"],
    ["City", gig.city || "—"],
    ["Date", gig.eventDate],
    ["Soundcheck", gig.soundcheckTime || "—"],
    ["Show Time", gig.showTime || "—"],
    ["Type", gig.gigType],
    ["Status", STATUS_LABEL[gig.status] ?? gig.status],
    ["Total Fee", gig.totalFee],
  ]
  meta.forEach(([k, v], i) => {
    const r = 5 + i
    const lc = ws.getCell(r, 1)
    lc.value = k
    lc.font = { bold: true, size: 10, color: { argb: MUTED } }
    const vc = ws.getCell(r, 2)
    vc.value = v
    vc.font = { bold: true, size: 10, color: { argb: INK } }
    if (i === meta.length - 1) {
      moneyFmt(r, 2, gig.totalFee, { bold: true, color: ACCENT, size: 11 })
    }
  })

  const bandRow = (r: number, label: string) => {
    ws.mergeCells(r, 1, r, 5)
    const c = ws.getCell(r, 1)
    c.value = label
    c.font = { bold: true, size: 11, color: { argb: "FFFFFFFF" } }
    c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: DARK } }
    c.alignment = { vertical: "middle" }
    ws.getRow(r).height = 24
  }

  // ---- BAND ----
  bandRow(15, "BAND")
  settlement.memberLines.forEach((line, i) => {
    const r = 16 + i
    ws.getCell(r, 1).value = line.person?.name ?? "Unknown"
    ws.getCell(r, 1).font = { bold: true, size: 10, color: { argb: INK } }
    moneyFmt(r, 2, line.payout)
    ws.getCell(r, 3).value = `${line.gigMember.splitPct}%`
    ws.getCell(r, 3).font = { size: 10, color: { argb: FAINT } }
    ws.getCell(r, 3).alignment = { horizontal: "right", vertical: "middle" }
    ws.getCell(r, 4).value = line.gigMember.paymentStatus === "paid" ? "Paid" : "Pending"
    ws.getCell(r, 4).font = {
      bold: true,
      size: 10,
      color: { argb: line.gigMember.paymentStatus === "paid" ? GREEN : AMBER },
    }
  })

  // ---- PRODUCTION TEAM ----
  const crewStart = 16 + settlement.memberLines.length + 1
  bandRow(crewStart, "PRODUCTION TEAM")
  settlement.crewLines.forEach((line, i) => {
    const r = crewStart + 1 + i
    ws.getCell(r, 1).value = line.person?.name ?? "Unknown"
    ws.getCell(r, 1).font = { bold: true, size: 10, color: { argb: INK } }
    moneyFmt(r, 2, line.crew.fee)
    ws.getCell(r, 3).value = line.crew.role
    ws.getCell(r, 3).font = { size: 10, color: { argb: MUTED } }
    ws.getCell(r, 4).value = line.meal ? line.meal : "—"
    ws.getCell(r, 4).font = { size: 9, color: { argb: MUTED } }
  })

  // ---- OTHER EXPENSES ----
  const expStart = crewStart + 1 + settlement.crewLines.length + 1
  bandRow(expStart, "OTHER EXPENSES")
  gig.expenses.forEach((e, i) => {
    const r = expStart + 1 + i
    ws.getCell(r, 1).value = e.name
    ws.getCell(r, 1).font = { bold: true, size: 10, color: { argb: INK } }
    moneyFmt(r, 2, e.amount)
    ws.getCell(r, 3).value = e.category
    ws.getCell(r, 3).font = { size: 10, color: { argb: MUTED } }
  })

  // ---- SUMMARY ----
  const summary: [string, number][] = [
    ["Crew Total", settlement.crewTotal],
    ["Meals Total", settlement.mealTotal],
    ["Production Total", settlement.productionTotal],
    ["Other Total", settlement.otherTotal],
    [
      "Total Expenses",
      settlement.crewTotal + settlement.mealTotal + settlement.productionTotal + settlement.otherTotal,
    ],
    ["Net Band", settlement.netBand],
    ["Per Member", settlement.perMember],
  ]
  const sumStart = expStart + 1 + gig.expenses.length + 1
  bandRow(sumStart, "SUMMARY")
  summary.forEach(([k, v], i) => {
    const r = sumStart + 1 + i
    const isNet = i === summary.length - 2
    const isPer = i === summary.length - 1
    const lc = ws.getCell(r, 1)
    lc.value = k
    lc.font = { bold: true, size: isNet || isPer ? 11 : 10, color: { argb: isNet ? INK : MUTED } }
    if (isNet) lc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT } }
    moneyFmt(r, 2, v, {
      bold: true,
      size: isNet ? 11 : isPer ? 11 : 10,
      color: isNet ? INK : isPer ? ACCENT : INK,
      fill: isNet ? LIGHT : undefined,
    })
  })

  // ---- Footer ----
  const footRow = sumStart + 1 + summary.length + 1
  ws.mergeCells(footRow, 1, footRow, 5)
  const fc = ws.getCell(footRow, 1)
  fc.value = "Generated with magicpie"
  fc.font = { italic: true, size: 9, color: { argb: FAINT } }

  return wb
}

export async function gigToBlob(gig: Gig, state: AppData): Promise<Blob> {
  const wb = await gigToWorkbook(gig, state)
  const out = await wb.xlsx.writeBuffer()
  return new Blob([out], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  })
}

export function excelFileName(gig: Gig): string {
  const safeName = gig.eventName.replace(/[^\w\- ]+/g, "").replace(/\s+/g, "_")
  return `Magicpie_Gig_${safeName || "Event"}_${gig.eventDate}.xlsx`
}

export function excelToGig(
  data: ArrayBuffer,
  state: AppData,
): { gig: Gig; newMembers: AppData["members"]; newCrew: AppData["crew"] } {
  const wb = XLSX.read(data)
  const ws = wb.Sheets["Settlement"] ?? wb.Sheets[wb.SheetNames[0]]
  if (!ws) throw new Error(IMPORT_FORMAT_ERROR)
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 })

  if (!rows.length) throw new Error(IMPORT_FORMAT_ERROR)
  const header = String(rows[0]?.[0] ?? "")
  if (!header.toLowerCase().includes("magicpie")) throw new Error(IMPORT_FORMAT_ERROR)

  const cell = (r: unknown[], i: number) => String(r?.[i] ?? "").trim()
  const num = (r: unknown[], i: number) => {
    const v = r?.[i]
    if (typeof v === "number") return Math.round(v)
    return parseInt(String(v).replace(/[^\d]/g, ""), 10) || 0
  }

  let eventName = ""
  let eventDate = ""
  let totalFee = 0
  let soundcheckTime = ""
  let showTime = ""
  const bandRows: { name: string; payout: number; splitPct: number }[] = []
  const crewRows: { name: string; fee: number; role: string }[] = []
  const expenseRows: { name: string; amount: number; category: string }[] = []

  let section = ""
  for (const r of rows) {
    const a = cell(r, 0)
    const up = a.toUpperCase()
    if (up === "ITINERARY" || up === "BAND" || up === "PRODUCTION TEAM" || up === "OTHER EXPENSES" || up === "SUMMARY") {
      section = up
      continue
    }
    if (!a) continue
    switch (section) {
      case "":
        if (up === "EVENT") eventName = cell(r, 1)
        else if (up === "DATE") eventDate = cell(r, 1)
        else if (up === "TOTAL FEE") totalFee = num(r, 1)
        else if (up === "SOUNDCHECK") soundcheckTime = cell(r, 1)
        else if (up === "SHOW TIME") showTime = cell(r, 1)
        break
      case "BAND":
        bandRows.push({ name: a, payout: num(r, 1), splitPct: parseInt(cell(r, 2).replace("%", ""), 10) || 0 })
        break
      case "PRODUCTION TEAM":
        crewRows.push({ name: a, fee: num(r, 1), role: cell(r, 2) || "Road Crew" })
        break
      case "OTHER EXPENSES":
        expenseRows.push({ name: a, amount: num(r, 1), category: cell(r, 2) || "Lainnya" })
        break
    }
  }

  const members = [...state.members]
  const crewMaster = [...state.crew]

  const memberIdFor = (name: string): string => {
    const hit = members.find((m) => m.name.toLowerCase() === name.toLowerCase())
    if (hit) return hit.id
    const m: AppData["members"][number] = {
      id: crypto.randomUUID(),
      name,
      role: "Member",
      defaultSplit: 0,
      active: true,
    }
    members.push(m)
    return m.id
  }
  const crewIdFor = (name: string, role: string): string => {
    const hit = crewMaster.find((c) => c.name.toLowerCase() === name.toLowerCase())
    if (hit) return hit.id
    const specialist = SPECIALIST_ROLES.includes(role)
    const c: AppData["crew"][number] = {
      id: crypto.randomUUID(),
      name,
      role,
      roleType: specialist ? "specialist" : "standard",
      defaultFee: 0,
      minFee: 600_000,
      maxFee: 800_000,
      mealEligible: !specialist,
      active: true,
    }
    crewMaster.push(c)
    return c.id
  }

  const gigId = crypto.randomUUID()
  const now = new Date().toISOString()

  const gig: Gig = {
    id: gigId,
    eventName: eventName || "Imported Gig",
    client: "",
    venue: "",
    city: "",
    eventDate: eventDate || new Date().toISOString().slice(0, 10),
    gigType: "Other",
    totalFee,
    soundcheckTime: soundcheckTime || "",
    showTime: showTime || "",
    mealOverride: null,
    splitMode: "equal",
    status: "draft",
    notes: "",
    createdAt: now,
    updatedAt: now,
    members: bandRows.map((b) => ({
      id: crypto.randomUUID(),
      memberId: memberIdFor(b.name),
      splitPct: b.splitPct,
      payout: b.payout,
      paymentStatus: "pending",
    })),
    crew: crewRows.map((c) => {
      const specialist = SPECIALIST_ROLES.includes(c.role)
      return {
        id: crypto.randomUUID(),
        crewId: crewIdFor(c.name, c.role),
        role: c.role,
        roleType: specialist ? "specialist" : "standard",
        fee: c.fee,
        overrideRate: false,
        paymentStatus: "pending",
      }
    }),
    expenses: expenseRows.map((e) => ({
      id: crypto.randomUUID(),
      category: e.category,
      name: e.name,
      amount: e.amount,
    })),
  }

  const splitSum = gig.members.reduce((s, m) => s + m.splitPct, 0)
  if (gig.members.length > 0 && splitSum === 100) {
    gig.splitMode = "percentage"
  }

  return {
    gig,
    newMembers: members.slice(state.members.length),
    newCrew: crewMaster.slice(state.crew.length),
  }
}
