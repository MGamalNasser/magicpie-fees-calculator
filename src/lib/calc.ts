import type { AppData, BalanceStatus, Gig, Settlement } from "./types"
import { PRODUCTION_CATEGORIES } from "./rules"

function timeToMinutes(t: string): number {
  if (!t) return 0
  const [h, m] = t.split(":").map(Number)
  return (h || 0) * 60 + (m || 0)
}

function crewById(state: AppData) {
  return new Map(state.crew.map((c) => [c.id, c]))
}

function memberById(state: AppData) {
  return new Map(state.members.map((m) => [m.id, m]))
}

export function computeSettlement(gig: Gig, state: AppData): Settlement {
  const crewMap = crewById(state)
  const memberMap = memberById(state)
  const settings = state.settings

  const crewTotal = gig.crew.reduce((s, c) => s + (c.fee || 0), 0)

  const autoMeal =
    gig.mealOverride !== null
      ? gig.mealOverride
      : timeToMinutes(gig.soundcheckTime) < timeToMinutes(settings.mealCutoff)
        ? settings.mealRate
        : 0

  const crewLines = gig.crew.map((c) => {
    const person = crewMap.get(c.crewId) ?? null
    const eligible = person?.mealEligible ?? false
    const meal = eligible ? autoMeal : 0
    let validation: { ok: boolean; message?: string } = { ok: true }
    if (c.roleType === "standard" && !c.overrideRate) {
      if (c.fee > settings.crewMaxFee) {
        validation = {
          ok: false,
          message: `Standard crew rate cannot exceed Rp${settings.crewMaxFee.toLocaleString("id-ID")}.`,
        }
      } else if (c.fee < settings.crewMinFee) {
        validation = {
          ok: false,
          message: `Standard crew rate cannot be below Rp${settings.crewMinFee.toLocaleString("id-ID")}.`,
        }
      }
    }
    return { crew: c, person, meal, validation }
  })

  const mealTotal = crewLines.reduce((s, l) => s + l.meal, 0)

  const productionTotal = gig.expenses
    .filter((e) => PRODUCTION_CATEGORIES.includes(e.category))
    .reduce((s, e) => s + (e.amount || 0), 0)
  const otherTotal = gig.expenses
    .filter((e) => !PRODUCTION_CATEGORIES.includes(e.category))
    .reduce((s, e) => s + (e.amount || 0), 0)

  const expensesTotal = crewTotal + mealTotal + productionTotal + otherTotal
  const netBand = gig.totalFee - expensesTotal
  const memberCount = gig.members.length

  const splitTotal = gig.members.reduce((s, m) => s + (m.splitPct || 0), 0)

  let memberLines: Settlement["memberLines"]
  if (gig.splitMode === "percentage" && gig.members.length > 0 && splitTotal > 0) {
    memberLines = gig.members.map((gm) => ({
      gigMember: gm,
      person: memberMap.get(gm.memberId) ?? null,
      payout: Math.round((netBand * (gm.splitPct || 0)) / 100),
    }))
  } else {
    const base = memberCount > 0 ? Math.floor(netBand / memberCount) : 0
    const remainder = netBand - base * memberCount
    memberLines = gig.members.map((gm, i) => ({
      gigMember: gm,
      person: memberMap.get(gm.memberId) ?? null,
      payout: i === 0 ? base + remainder : base,
    }))
  }

  const memberPayoutTotal = memberLines.reduce((s, l) => s + l.payout, 0)
  const perMember = memberCount > 0 ? Math.round(netBand / memberCount) : 0

  let balanceStatus: BalanceStatus = "balanced"
  if (netBand < 0) balanceStatus = "over_budget"
  else if (gig.splitMode === "percentage" && splitTotal !== 100) balanceStatus = "split_invalid"

  return {
    gigFee: gig.totalFee,
    crewTotal,
    mealTotal,
    productionTotal,
    otherTotal,
    expensesTotal,
    netBand,
    memberCount,
    perMember,
    memberLines,
    crewLines,
    memberPayoutTotal,
    balanceStatus,
    splitTotal,
  }
}

export function isFinalizable(s: Settlement): boolean {
  return s.balanceStatus === "balanced" && s.gigFee > 0 && s.memberCount > 0
}
