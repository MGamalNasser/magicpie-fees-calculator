import { relations, sql } from "drizzle-orm"
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"
import { user } from "./auth-schema"

export * from "./auth-schema"

export const members = sqliteTable(
  "members",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountUserId: text("account_user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    name: text("name").notNull(),
    role: text("role").notNull().default("Member"),
    defaultSplit: integer("default_split").notNull().default(20),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    account: text("account"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [index("members_user_idx").on(t.userId)],
)

export const crew = sqliteTable(
  "crew",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    role: text("role").notNull(),
    roleType: text("role_type", { enum: ["standard", "specialist"] })
      .notNull()
      .default("standard"),
    defaultFee: integer("default_fee").notNull().default(650_000),
    minFee: integer("min_fee").notNull().default(600_000),
    maxFee: integer("max_fee").notNull().default(800_000),
    mealEligible: integer("meal_eligible", { mode: "boolean" }).notNull().default(true),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [index("crew_user_idx").on(t.userId)],
)

export const gigs = sqliteTable(
  "gigs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    eventName: text("event_name").notNull(),
    client: text("client").notNull().default(""),
    venue: text("venue").notNull().default(""),
    city: text("city").notNull().default(""),
    eventDate: text("event_date").notNull(),
    gigType: text("gig_type").notNull().default("Other"),
    totalFee: integer("total_fee").notNull().default(0),
    soundcheckTime: text("soundcheck_time").notNull().default(""),
    showTime: text("show_time").notNull().default(""),
    mealOverride: integer("meal_override"),
    splitMode: text("split_mode", { enum: ["equal", "percentage"] })
      .notNull()
      .default("equal"),
    status: text("status", { enum: ["draft", "confirmed", "paid", "cancelled"] })
      .notNull()
      .default("draft"),
    notes: text("notes").notNull().default(""),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("gigs_user_date_idx").on(t.userId, t.eventDate)],
)

export const gigMembers = sqliteTable(
  "gig_members",
  {
    id: text("id").primaryKey(),
    gigId: text("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    memberId: text("member_id").notNull(),
    splitPct: integer("split_pct").notNull().default(0),
    payout: integer("payout").notNull().default(0),
    paymentStatus: text("payment_status", { enum: ["pending", "paid"] })
      .notNull()
      .default("pending"),
    paymentDate: text("payment_date"),
    paymentMethod: text("payment_method"),
  },
  (t) => [index("gig_members_gig_idx").on(t.gigId)],
)

export const gigCrew = sqliteTable(
  "gig_crew",
  {
    id: text("id").primaryKey(),
    gigId: text("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    crewId: text("crew_id").notNull(),
    role: text("role").notNull(),
    roleType: text("role_type", { enum: ["standard", "specialist"] }).notNull(),
    fee: integer("fee").notNull().default(0),
    overrideRate: integer("override_rate", { mode: "boolean" }).notNull().default(false),
    paymentStatus: text("payment_status", { enum: ["pending", "paid"] })
      .notNull()
      .default("pending"),
    paymentDate: text("payment_date"),
    paymentMethod: text("payment_method"),
  },
  (t) => [index("gig_crew_gig_idx").on(t.gigId)],
)

export const itineraryTemplates = sqliteTable(
  "itinerary_templates",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    gigId: text("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    name: text("name").notNull().default(""),
    templateType: text("template_type", { enum: ["local", "out_of_town"] })
      .notNull()
      .default("local"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("itinerary_templates_gig_idx").on(t.gigId),
    index("itinerary_templates_user_idx").on(t.userId),
  ],
)

export const itineraryTemplateItems = sqliteTable(
  "itinerary_template_items",
  {
    id: text("id").primaryKey(),
    templateId: text("template_id")
      .notNull()
      .references(() => itineraryTemplates.id, { onDelete: "cascade" }),
    time: text("time").notNull().default(""),
    label: text("label").notNull().default(""),
    position: integer("position").notNull().default(0),
  },
  (t) => [index("itinerary_template_items_tpl_idx").on(t.templateId)],
)

export const expenses = sqliteTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    gigId: text("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    category: text("category").notNull(),
    name: text("name").notNull(),
    amount: integer("amount").notNull().default(0),
    notes: text("notes").notNull().default(""),
  },
  (t) => [index("expenses_gig_idx").on(t.gigId)],
)

export const settings = sqliteTable(
  "settings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    crewMinFee: integer("crew_min_fee").notNull().default(600_000),
    crewMaxFee: integer("crew_max_fee").notNull().default(800_000),
    mealRate: integer("meal_rate").notNull().default(100_000),
    mealCutoff: text("meal_cutoff").notNull().default("12:00"),
  },
  (t) => [uniqueIndex("settings_user_uidx").on(t.userId)],
)

export const productionRoles = sqliteTable(
  "production_roles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    defaultFee: integer("default_fee").notNull().default(0),
    active: integer("active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [index("production_roles_user_idx").on(t.userId)],
)

export const productionRolesRelations = relations(productionRoles, ({ one }) => ({
  owner: one(user, { fields: [productionRoles.userId], references: [user.id] }),
}))

export const membersRelations = relations(members, ({ one }) => ({
  owner: one(user, { fields: [members.userId], references: [user.id] }),
  accountUser: one(user, { fields: [members.accountUserId], references: [user.id] }),
}))

export const crewRelations = relations(crew, ({ one }) => ({
  owner: one(user, { fields: [crew.userId], references: [user.id] }),
}))

export const gigsRelations = relations(gigs, ({ many, one }) => ({
  owner: one(user, { fields: [gigs.userId], references: [user.id] }),
  members: many(gigMembers),
  crew: many(gigCrew),
  expenses: many(expenses),
  itineraryTemplates: many(itineraryTemplates),
}))

export const itineraryTemplatesRelations = relations(itineraryTemplates, ({ one, many }) => ({
  owner: one(user, { fields: [itineraryTemplates.userId], references: [user.id] }),
  gig: one(gigs, { fields: [itineraryTemplates.gigId], references: [gigs.id] }),
  items: many(itineraryTemplateItems),
}))

export const itineraryTemplateItemsRelations = relations(itineraryTemplateItems, ({ one }) => ({
  template: one(itineraryTemplates, {
    fields: [itineraryTemplateItems.templateId],
    references: [itineraryTemplates.id],
  }),
}))

export const gigMembersRelations = relations(gigMembers, ({ one }) => ({
  gig: one(gigs, { fields: [gigMembers.gigId], references: [gigs.id] }),
}))

export const gigCrewRelations = relations(gigCrew, ({ one }) => ({
  gig: one(gigs, { fields: [gigCrew.gigId], references: [gigs.id] }),
}))

export const expensesRelations = relations(expenses, ({ one }) => ({
  gig: one(gigs, { fields: [expenses.gigId], references: [gigs.id] }),
}))

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    action: text("action").notNull(),
    gigId: text("gig_id").references(() => gigs.id, { onDelete: "set null" }),
    entityName: text("entity_name"),
    detail: text("detail"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [
    index("audit_logs_user_idx").on(t.userId),
    index("audit_logs_gig_idx").on(t.gigId),
    index("audit_logs_created_idx").on(t.createdAt),
  ],
)

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  owner: one(user, { fields: [auditLogs.userId], references: [user.id] }),
  gig: one(gigs, { fields: [auditLogs.gigId], references: [gigs.id] }),
}))

export const settingsRelations = relations(settings, ({ one }) => ({
  owner: one(user, { fields: [settings.userId], references: [user.id] }),
}))
