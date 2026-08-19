import { and, desc, eq, inArray } from "drizzle-orm"
import { db } from "./index"
import {
  crew,
  expenses,
  gigCrew,
  gigMembers,
  gigs,
  itineraryTemplateItems,
  itineraryTemplates,
  members,
  productionRoles,
  settings,
} from "./schema"
import type {
  AppData,
  Gig,
  ItineraryTemplate,
  MyPayout,
  MyPayoutsData,
  Settings,
} from "@/lib/types"
import { DEFAULT_SETTINGS } from "@/lib/rules"

export async function getProductionRoles(userId: string) {
  return db
    .select()
    .from(productionRoles)
    .where(eq(productionRoles.userId, userId))
    .all()
}

export async function getSettings(userId: string): Promise<Settings> {
  const row = await db.select().from(settings).where(eq(settings.userId, userId)).get()
  if (!row) return { ...DEFAULT_SETTINGS }
  return {
    crewMinFee: row.crewMinFee,
    crewMaxFee: row.crewMaxFee,
    mealRate: row.mealRate,
    mealCutoff: row.mealCutoff,
  }
}

export async function getMembers(userId: string) {
  return db.select().from(members).where(eq(members.userId, userId)).all()
}

export async function getCrew(userId: string) {
  return db.select().from(crew).where(eq(crew.userId, userId)).all()
}

export async function getGig(userId: string, gigId: string): Promise<Gig | null> {
  const g = await db
    .select()
    .from(gigs)
    .where(and(eq(gigs.id, gigId), eq(gigs.userId, userId)))
    .get()
  if (!g) return null
  return assembleGig(g.id)
}

export async function getGigs(userId: string): Promise<Gig[]> {
  const rows = await db
    .select()
    .from(gigs)
    .where(eq(gigs.userId, userId))
    .orderBy(desc(gigs.eventDate))
    .all()
  return Promise.all(rows.map((r) => assembleGig(r.id)))
}

export async function getItineraryTemplates(userId: string): Promise<ItineraryTemplate[]> {
  const rows = await db
    .select()
    .from(itineraryTemplates)
    .where(eq(itineraryTemplates.userId, userId))
    .orderBy(desc(itineraryTemplates.updatedAt))
    .all()
  return Promise.all(rows.map((r) => assembleItineraryTemplate(r.id)))
}

async function assembleItineraryTemplate(id: string): Promise<ItineraryTemplate> {
  const t = await db.select().from(itineraryTemplates).where(eq(itineraryTemplates.id, id)).get()
  if (!t) throw new Error("Itinerary template not found")
  const items = await db
    .select()
    .from(itineraryTemplateItems)
    .where(eq(itineraryTemplateItems.templateId, id))
    .orderBy(itineraryTemplateItems.position)
    .all()
  return {
    id: t.id,
    gigId: t.gigId,
    name: t.name,
    templateType: t.templateType,
    items: items.map((i) => ({ id: i.id, time: i.time, label: i.label })),
    createdAt: new Date(t.createdAt).toISOString(),
    updatedAt: new Date(t.updatedAt).toISOString(),
  }
}

export async function getAppData(userId: string): Promise<AppData> {
  const [m, c, g, t, s, pr] = await Promise.all([
    getMembers(userId),
    getCrew(userId),
    getGigs(userId),
    getItineraryTemplates(userId),
    getSettings(userId),
    getProductionRoles(userId),
  ])
  return {
    members: m.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      defaultSplit: r.defaultSplit,
      active: r.active,
      account: r.account ?? undefined,
    })),
    crew: c.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role,
      roleType: r.roleType,
      defaultFee: r.defaultFee,
      minFee: r.minFee,
      maxFee: r.maxFee,
      mealEligible: r.mealEligible,
      active: r.active,
    })),
    gigs: g,
    templates: t,
    settings: s,
    productionRoles: pr.map((r) => ({
      id: r.id,
      name: r.name,
      defaultFee: r.defaultFee,
      active: r.active,
    })),
  }
}

async function assembleGig(id: string): Promise<Gig> {
  const g = await db.select().from(gigs).where(eq(gigs.id, id)).get()
  const gm = await db.select().from(gigMembers).where(eq(gigMembers.gigId, id)).all()
  const gc = await db.select().from(gigCrew).where(eq(gigCrew.gigId, id)).all()
  const ex = await db.select().from(expenses).where(eq(expenses.gigId, id)).all()

  return {
    id: g!.id,
    eventName: g!.eventName,
    client: g!.client,
    venue: g!.venue,
    city: g!.city,
    eventDate: g!.eventDate,
    gigType: g!.gigType,
    totalFee: g!.totalFee,
    soundcheckTime: g!.soundcheckTime,
    showTime: g!.showTime,
    mealOverride: g!.mealOverride,
    splitMode: g!.splitMode,
    status: g!.status,
    notes: g!.notes,
    createdAt: new Date(g!.createdAt).toISOString(),
    updatedAt: new Date(g!.updatedAt).toISOString(),
    members: gm.map((m) => ({
      id: m.id,
      memberId: m.memberId,
      splitPct: m.splitPct,
      payout: m.payout,
      paymentStatus: m.paymentStatus,
      paymentDate: m.paymentDate ?? undefined,
      paymentMethod: m.paymentMethod ?? undefined,
    })),
    crew: gc.map((c) => ({
      id: c.id,
      crewId: c.crewId,
      role: c.role,
      roleType: c.roleType,
      fee: c.fee,
      overrideRate: c.overrideRate,
      paymentStatus: c.paymentStatus,
      paymentDate: c.paymentDate ?? undefined,
      paymentMethod: c.paymentMethod ?? undefined,
    })),
    expenses: ex.map((e) => ({
      id: e.id,
      category: e.category,
      name: e.name,
      amount: e.amount,
      notes: e.notes,
    })),
  }
}

export async function getMyPayouts(authUserId: string): Promise<MyPayoutsData> {
  const memberRows = await db
    .select()
    .from(members)
    .where(eq(members.accountUserId, authUserId))
    .all()

  if (memberRows.length === 0) return { members: [], payouts: [] }

  const ids = memberRows.map((m) => m.id)
  const rows = await db
    .select({
      memberId: gigMembers.memberId,
      payout: gigMembers.payout,
      splitPct: gigMembers.splitPct,
      paymentStatus: gigMembers.paymentStatus,
      paymentDate: gigMembers.paymentDate,
      paymentMethod: gigMembers.paymentMethod,
      eventName: gigs.eventName,
      eventDate: gigs.eventDate,
      gigStatus: gigs.status,
    })
    .from(gigMembers)
    .innerJoin(gigs, eq(gigs.id, gigMembers.gigId))
    .where(inArray(gigMembers.memberId, ids))
    .orderBy(desc(gigs.eventDate))
    .all()

  const payouts: MyPayout[] = rows.map((r) => ({
    memberId: r.memberId,
    payout: r.payout,
    splitPct: r.splitPct,
    paymentStatus: r.paymentStatus,
    paymentDate: r.paymentDate ?? undefined,
    paymentMethod: r.paymentMethod ?? undefined,
    eventName: r.eventName,
    eventDate: r.eventDate,
    gigStatus: r.gigStatus,
  }))

  return {
    members: memberRows.map((m) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      defaultSplit: m.defaultSplit,
      active: m.active,
      account: m.account ?? undefined,
    })),
    payouts,
  }
}
