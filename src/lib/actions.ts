"use server"

import { and, desc, eq, notInArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import {
  auditLogs,
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
  user,
} from "@/lib/db/schema"
import type {
  AppData,
  AuditLogRow,
  Gig,
  ItineraryTemplate,
  MyPayoutsData,
  ProductionRole,
  Settings,
} from "@/lib/types"
import { getAppData, getMyPayouts, getWorkspaceOwnerId } from "@/lib/db/queries"
import { seedTenant } from "@/lib/db/seed"

async function requireUser(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error("Unauthorized")
  return session.user.id
}

async function requireAdmin(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) throw new Error("Unauthorized")
  if (session.user.role === "member") throw new Error("Unauthorized")
  const ownerId = await getWorkspaceOwnerId()
  return ownerId ?? session.user.id
}

function revalidateAll() {
  revalidatePath("/")
  revalidatePath("/gigs")
  revalidatePath("/itinerary")
  revalidatePath("/masters")
  revalidatePath("/settings")
  revalidatePath("/me")
}

const AUDIT_LOG_LIMIT = 500

async function logAudit(
  userId: string,
  action: string,
  opts: { gigId?: string; entityName?: string; detail?: string } = {},
) {
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      userId,
      action,
      gigId: opts.gigId ?? null,
      entityName: opts.entityName ?? null,
      detail: opts.detail ?? null,
      createdAt: new Date(),
    })
    const keep = await db
      .select({ id: auditLogs.id })
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(AUDIT_LOG_LIMIT)
      .all()
    if (keep.length >= AUDIT_LOG_LIMIT) {
      await db
        .delete(auditLogs)
        .where(notInArray(auditLogs.id, keep.map((r) => r.id)))
    }
  } catch {
    // audit logging must never break the underlying operation
  }
}

type ActionResult = { ok: true; devLink?: string } | { ok: false; error: string }

export async function getDataAction(): Promise<AppData> {
  const userId = await requireAdmin()
  return getAppData(userId)
}

export async function saveGigAction(
  gig: Gig,
  opts?: { source?: "manual" | "import" },
): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const source = opts?.source ?? "manual"
  const existing = await db
    .select({ id: gigs.id })
    .from(gigs)
    .where(and(eq(gigs.id, gig.id), eq(gigs.userId, userId)))
    .get()

  if (existing) {
    await db
      .update(gigs)
      .set({
        eventName: gig.eventName,
        client: gig.client,
        venue: gig.venue,
        city: gig.city,
        eventDate: gig.eventDate,
        gigType: gig.gigType,
        totalFee: gig.totalFee,
        soundcheckTime: gig.soundcheckTime,
        showTime: gig.showTime,
        mealOverride: gig.mealOverride,
        splitMode: gig.splitMode,
        status: gig.status,
        notes: gig.notes,
        updatedAt: new Date(),
      })
      .where(and(eq(gigs.id, gig.id), eq(gigs.userId, userId)))
    await db.delete(gigMembers).where(eq(gigMembers.gigId, gig.id))
    await db.delete(gigCrew).where(eq(gigCrew.gigId, gig.id))
    await db.delete(expenses).where(eq(expenses.gigId, gig.id))
  } else {
    await db.insert(gigs).values({
      id: gig.id,
      userId,
      eventName: gig.eventName,
      client: gig.client,
      venue: gig.venue,
      city: gig.city,
      eventDate: gig.eventDate,
      gigType: gig.gigType,
      totalFee: gig.totalFee,
      soundcheckTime: gig.soundcheckTime,
      showTime: gig.showTime,
      mealOverride: gig.mealOverride,
      splitMode: gig.splitMode,
      status: gig.status,
      notes: gig.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  if (gig.members.length > 0) {
    await db.insert(gigMembers).values(
      gig.members.map((m) => ({
        id: m.id,
        gigId: gig.id,
        memberId: m.memberId,
        splitPct: m.splitPct,
        payout: m.payout,
        paymentStatus: m.paymentStatus,
        paymentDate: m.paymentDate,
        paymentMethod: m.paymentMethod,
      })),
    )
  }
  if (gig.crew.length > 0) {
    await db.insert(gigCrew).values(
      gig.crew.map((c) => ({
        id: c.id,
        gigId: gig.id,
        crewId: c.crewId,
        role: c.role,
        roleType: c.roleType,
        fee: c.fee,
        overrideRate: c.overrideRate,
        paymentStatus: c.paymentStatus,
        paymentDate: c.paymentDate,
        paymentMethod: c.paymentMethod,
      })),
    )
  }
  if (gig.expenses.length > 0) {
    await db.insert(expenses).values(
      gig.expenses.map((e) => ({
        id: e.id,
        gigId: gig.id,
        category: e.category,
        name: e.name,
        amount: e.amount,
        notes: e.notes ?? "",
      })),
    )
  }

  await logAudit(
    userId,
    source === "import" ? "gig.import" : existing ? "gig.update" : "gig.create",
    { gigId: gig.id, entityName: gig.eventName },
  )

  revalidateAll()
  return { ok: true }
}

export async function deleteGigAction(gigId: string): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const row = await db
    .select({ eventName: gigs.eventName })
    .from(gigs)
    .where(and(eq(gigs.id, gigId), eq(gigs.userId, userId)))
    .get()
  await db.delete(gigs).where(and(eq(gigs.id, gigId), eq(gigs.userId, userId)))
  await logAudit(userId, "gig.delete", { gigId, entityName: row?.eventName ?? "Gig" })
  revalidateAll()
  return { ok: true }
}

export async function saveItineraryTemplateAction(
  tpl: ItineraryTemplate,
): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const gigRow = await db
    .select({ id: gigs.id })
    .from(gigs)
    .where(and(eq(gigs.id, tpl.gigId), eq(gigs.userId, userId)))
    .get()
  if (!gigRow) throw new Error("Unauthorized")

  const existing = await db
    .select({ id: itineraryTemplates.id })
    .from(itineraryTemplates)
    .where(and(eq(itineraryTemplates.id, tpl.id), eq(itineraryTemplates.userId, userId)))
    .get()

  if (existing) {
    await db
      .update(itineraryTemplates)
      .set({
        name: tpl.name,
        templateType: tpl.templateType,
        updatedAt: new Date(),
      })
      .where(and(eq(itineraryTemplates.id, tpl.id), eq(itineraryTemplates.userId, userId)))
    await db
      .delete(itineraryTemplateItems)
      .where(eq(itineraryTemplateItems.templateId, tpl.id))
  } else {
    await db.insert(itineraryTemplates).values({
      id: tpl.id,
      userId,
      gigId: tpl.gigId,
      name: tpl.name,
      templateType: tpl.templateType,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  if (tpl.items.length > 0) {
    await db.insert(itineraryTemplateItems).values(
      tpl.items.map((i, idx) => ({
        id: i.id,
        templateId: tpl.id,
        time: i.time,
        label: i.label,
        position: idx,
      })),
    )
  }

  await logAudit(userId, existing ? "itinerary.update" : "itinerary.create", {
    gigId: tpl.gigId,
    entityName: tpl.name || "Itinerary",
  })

  revalidateAll()
  return { ok: true }
}

export async function deleteItineraryTemplateAction(id: string): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const row = await db
    .select({ name: itineraryTemplates.name, gigId: itineraryTemplates.gigId })
    .from(itineraryTemplates)
    .where(and(eq(itineraryTemplates.id, id), eq(itineraryTemplates.userId, userId)))
    .get()
  await db
    .delete(itineraryTemplates)
    .where(and(eq(itineraryTemplates.id, id), eq(itineraryTemplates.userId, userId)))
  if (row) {
    await logAudit(userId, "itinerary.delete", { gigId: row.gigId, entityName: row.name })
  }
  revalidateAll()
  return { ok: true }
}

export async function setGigStatusAction(gigId: string, status: Gig["status"]): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const row = await db
    .select({ status: gigs.status, eventName: gigs.eventName })
    .from(gigs)
    .where(and(eq(gigs.id, gigId), eq(gigs.userId, userId)))
    .get()
  await db
    .update(gigs)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(gigs.id, gigId), eq(gigs.userId, userId)))
  if (row) {
    await logAudit(userId, "gig.status", {
      gigId,
      entityName: row.eventName,
      detail: `${row.status} → ${status}`,
    })
  }
  revalidateAll()
  return { ok: true }
}

export async function setMemberPaymentAction(
  gigId: string,
  rowId: string,
  paymentStatus: "pending" | "paid",
  paymentDate?: string,
  paymentMethod?: string,
): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const gigRow = await db
    .select({ id: gigs.id, eventName: gigs.eventName })
    .from(gigs)
    .where(and(eq(gigs.id, gigId), eq(gigs.userId, userId)))
    .get()
  if (!gigRow) throw new Error("Unauthorized")
  const row = await db
    .select({ memberId: gigMembers.memberId, paymentStatus: gigMembers.paymentStatus })
    .from(gigMembers)
    .where(eq(gigMembers.id, rowId))
    .get()
  await db
    .update(gigMembers)
    .set({ paymentStatus, paymentDate, paymentMethod })
    .where(eq(gigMembers.id, rowId))
  if (row) {
    const memberName =
      (
        await db
          .select({ name: members.name })
          .from(members)
          .where(eq(members.id, row.memberId))
          .get()
      )?.name ?? "Member"
    const detail = [`${row.paymentStatus} → ${paymentStatus}`]
    if (paymentDate) detail.push(paymentDate)
    if (paymentMethod) detail.push(paymentMethod)
    await logAudit(userId, "member.payment", {
      gigId,
      entityName: memberName,
      detail: detail.join(" · "),
    })
  }
  revalidateAll()
  return { ok: true }
}

export async function setCrewPaymentAction(
  gigId: string,
  rowId: string,
  paymentStatus: "pending" | "paid",
  paymentDate?: string,
  paymentMethod?: string,
): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const gigRow = await db
    .select({ id: gigs.id, eventName: gigs.eventName })
    .from(gigs)
    .where(and(eq(gigs.id, gigId), eq(gigs.userId, userId)))
    .get()
  if (!gigRow) throw new Error("Unauthorized")
  const row = await db
    .select({ crewId: gigCrew.crewId, paymentStatus: gigCrew.paymentStatus })
    .from(gigCrew)
    .where(eq(gigCrew.id, rowId))
    .get()
  await db
    .update(gigCrew)
    .set({ paymentStatus, paymentDate, paymentMethod })
    .where(eq(gigCrew.id, rowId))
  if (row) {
    const crewName =
      (
        await db
          .select({ name: crew.name })
          .from(crew)
          .where(eq(crew.id, row.crewId))
          .get()
      )?.name ?? "Crew"
    const detail = [`${row.paymentStatus} → ${paymentStatus}`]
    if (paymentDate) detail.push(paymentDate)
    if (paymentMethod) detail.push(paymentMethod)
    await logAudit(userId, "crew.payment", {
      gigId,
      entityName: crewName,
      detail: detail.join(" · "),
    })
  }
  revalidateAll()
  return { ok: true }
}

export async function saveMemberAction(input: {
  id: string
  name: string
  role: string
  defaultSplit: number
  active: boolean
  account?: string
}): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const existing = await db
    .select({ id: members.id })
    .from(members)
    .where(and(eq(members.id, input.id), eq(members.userId, userId)))
    .get()
  if (existing) {
    await db
      .update(members)
      .set({
        name: input.name,
        role: input.role,
        defaultSplit: input.defaultSplit,
        active: input.active,
        account: input.account,
      })
      .where(and(eq(members.id, input.id), eq(members.userId, userId)))
  } else {
    await db.insert(members).values({
      id: input.id,
      userId,
      name: input.name,
      role: input.role,
      defaultSplit: input.defaultSplit,
      active: input.active,
      account: input.account,
    })
  }
  await logAudit(userId, existing ? "member.update" : "member.create", {
    entityName: input.name,
    detail: `${input.role} · ${input.defaultSplit}%`,
  })
  revalidateAll()
  return { ok: true }
}

export async function deleteMemberAction(id: string): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const row = await db
    .select({ name: members.name })
    .from(members)
    .where(and(eq(members.id, id), eq(members.userId, userId)))
    .get()
  await db.delete(members).where(and(eq(members.id, id), eq(members.userId, userId)))
  if (row) await logAudit(userId, "member.delete", { entityName: row.name })
  revalidateAll()
  return { ok: true }
}

export async function saveCrewAction(input: {
  id: string
  name: string
  role: string
  roleType: "standard" | "specialist"
  defaultFee: number
  minFee: number
  maxFee: number
  mealEligible: boolean
  active: boolean
}): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const existing = await db
    .select({ id: crew.id })
    .from(crew)
    .where(and(eq(crew.id, input.id), eq(crew.userId, userId)))
    .get()
  if (existing) {
    await db
      .update(crew)
      .set({
        name: input.name,
        role: input.role,
        roleType: input.roleType,
        defaultFee: input.defaultFee,
        minFee: input.minFee,
        maxFee: input.maxFee,
        mealEligible: input.mealEligible,
        active: input.active,
      })
      .where(and(eq(crew.id, input.id), eq(crew.userId, userId)))
  } else {
    await db.insert(crew).values({
      id: input.id,
      userId,
      name: input.name,
      role: input.role,
      roleType: input.roleType,
      defaultFee: input.defaultFee,
      minFee: input.minFee,
      maxFee: input.maxFee,
      mealEligible: input.mealEligible,
      active: input.active,
    })
  }
  await logAudit(userId, existing ? "crew.update" : "crew.create", {
    entityName: input.name,
    detail: `${input.role} · ${input.roleType}`,
  })
  revalidateAll()
  return { ok: true }
}

export async function deleteCrewAction(id: string): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const row = await db
    .select({ name: crew.name })
    .from(crew)
    .where(and(eq(crew.id, id), eq(crew.userId, userId)))
    .get()
  await db.delete(crew).where(and(eq(crew.id, id), eq(crew.userId, userId)))
  if (row) await logAudit(userId, "crew.delete", { entityName: row.name })
  revalidateAll()
  return { ok: true }
}

export async function saveSettingsAction(input: Settings): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const existing = await db
    .select({ id: settings.id })
    .from(settings)
    .where(eq(settings.userId, userId))
    .get()
  if (existing) {
    await db
      .update(settings)
      .set({
        crewMinFee: input.crewMinFee,
        crewMaxFee: input.crewMaxFee,
        mealRate: input.mealRate,
        mealCutoff: input.mealCutoff,
      })
      .where(eq(settings.userId, userId))
  } else {
    await db.insert(settings).values({
      id: crypto.randomUUID(),
      userId,
      crewMinFee: input.crewMinFee,
      crewMaxFee: input.crewMaxFee,
      mealRate: input.mealRate,
      mealCutoff: input.mealCutoff,
    })
  }
  await logAudit(userId, "settings.update", {
    entityName: "Settings",
    detail: `crew ${input.crewMinFee}–${input.crewMaxFee} · meal ${input.mealRate} @ ${input.mealCutoff}`,
  })
  revalidateAll()
  return { ok: true }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function setupAdminAction(input: {
  setupCode: string
  name: string
  email: string
  password: string
}): Promise<ActionResult> {
  if (!process.env.ADMIN_SETUP_CODE || input.setupCode !== process.env.ADMIN_SETUP_CODE) {
    return { ok: false, error: "Invalid setup code" }
  }
  if (!EMAIL_RE.test(input.email)) {
    return { ok: false, error: "Invalid email" }
  }
  const existing = await db.select({ id: user.id }).from(user).all()
  if (existing.length > 0) {
    return { ok: false, error: "An admin account already exists." }
  }
  const res = await auth.api.signUpEmail({
    body: { name: input.name, email: input.email, password: input.password },
  })
  if (!res?.token) {
    return { ok: false, error: "Something went wrong. Please try again." }
  }
  const created = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, input.email.toLowerCase()))
    .get()
  if (!created) {
    return { ok: false, error: "Something went wrong. Please try again." }
  }
  await db.update(user).set({ role: "admin" }).where(eq(user.id, created.id))
  await seedTenant(created.id)
  return { ok: true }
}

export async function saveProductionRoleAction(input: ProductionRole): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const existing = await db
    .select({ id: productionRoles.id })
    .from(productionRoles)
    .where(and(eq(productionRoles.id, input.id), eq(productionRoles.userId, userId)))
    .get()
  if (existing) {
    await db
      .update(productionRoles)
      .set({ name: input.name, defaultFee: input.defaultFee, active: input.active })
      .where(and(eq(productionRoles.id, input.id), eq(productionRoles.userId, userId)))
  } else {
    await db.insert(productionRoles).values({
      id: input.id,
      userId,
      name: input.name,
      defaultFee: input.defaultFee,
      active: input.active,
    })
  }
  await logAudit(userId, existing ? "production_role.update" : "production_role.create", {
    entityName: input.name,
    detail: String(input.defaultFee),
  })
  revalidatePath("/settings")
  return { ok: true }
}

export async function deleteProductionRoleAction(id: string): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const row = await db
    .select({ name: productionRoles.name })
    .from(productionRoles)
    .where(and(eq(productionRoles.id, id), eq(productionRoles.userId, userId)))
    .get()
  await db
    .delete(productionRoles)
    .where(and(eq(productionRoles.id, id), eq(productionRoles.userId, userId)))
  if (row) await logAudit(userId, "production_role.delete", { entityName: row.name })
  revalidatePath("/settings")
  return { ok: true }
}

export async function getMyPayoutsAction(): Promise<MyPayoutsData> {
  const userId = await requireUser()
  return getMyPayouts(userId)
}

export async function logExportAction(
  gigId: string,
  kind: "pdf" | "xlsx",
): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const row = await db
    .select({ eventName: gigs.eventName })
    .from(gigs)
    .where(and(eq(gigs.id, gigId), eq(gigs.userId, userId)))
    .get()
  if (!row) throw new Error("Unauthorized")
  await logAudit(userId, kind === "pdf" ? "export.pdf" : "export.xlsx", {
    gigId,
    entityName: row.eventName,
  })
  return { ok: true }
}

export async function logItineraryExportAction(input: {
  templateId?: string
  gigId: string
  name: string
}): Promise<{ ok: true }> {
  const userId = await requireAdmin()
  const gigRow = await db
    .select({ id: gigs.id })
    .from(gigs)
    .where(and(eq(gigs.id, input.gigId), eq(gigs.userId, userId)))
    .get()
  if (!gigRow) throw new Error("Unauthorized")
  if (input.templateId) {
    const tpl = await db
      .select({ id: itineraryTemplates.id })
      .from(itineraryTemplates)
      .where(
        and(
          eq(itineraryTemplates.id, input.templateId),
          eq(itineraryTemplates.userId, userId),
        ),
      )
      .get()
    if (!tpl) throw new Error("Unauthorized")
  }
  await logAudit(userId, "export.itinerary_pdf", {
    gigId: input.gigId,
    entityName: input.name,
  })
  return { ok: true }
}

export async function getAuditLogAction(limit = 100): Promise<AuditLogRow[]> {
  const userId = await requireAdmin()
  const rows = await db
    .select({
      id: auditLogs.id,
      actorName: user.name,
      action: auditLogs.action,
      gigName: gigs.eventName,
      entityName: auditLogs.entityName,
      detail: auditLogs.detail,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .leftJoin(user, eq(auditLogs.userId, user.id))
    .leftJoin(gigs, eq(auditLogs.gigId, gigs.id))
    .where(eq(auditLogs.userId, userId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit)
    .all()
  return rows.map((r) => ({
    id: r.id,
    actorName: r.actorName ?? "Unknown",
    action: r.action,
    gigName: r.gigName ?? null,
    entityName: r.entityName ?? null,
    detail: r.detail ?? null,
    createdAt: r.createdAt.toISOString(),
  }))
}