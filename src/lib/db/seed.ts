import { randomUUID } from "node:crypto"
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
import { buildItinerary, DEFAULT_SETTINGS, type ItineraryKind } from "@/lib/rules"

const newId = () => randomUUID()

export const PRODUCTION_ROLE_DEFAULTS: { name: string; defaultFee: number }[] = [
  { name: "Photographer", defaultFee: 300_000 },
  { name: "VJ", defaultFee: 200_000 },
  { name: "Content Creator", defaultFee: 500_000 },
  { name: "Videographer", defaultFee: 0 },
  { name: "FOH Engineer", defaultFee: 0 },
  { name: "Lighting", defaultFee: 0 },
]

export async function seedTenant(userId: string): Promise<void> {
  const memberIds = Array.from({ length: 5 }, () => newId())
  const memberNames = ["Bayu", "Gege", "Boim", "Dendi", "Ical"]
  const memberRoles = ["Vocal", "Lead Guitar", "Guitar", "Bass", "Drums"]

  await db.insert(members).values(
    memberNames.map((name, i) => ({
      id: memberIds[i],
      userId,
      name,
      role: memberRoles[i],
      defaultSplit: 20,
      active: true,
    })),
  )

  const crewDefs = [
    { id: newId(), name: "Farras", role: "Sound Engineer", roleType: "standard" as const, defaultFee: 700_000, minFee: 600_000, maxFee: 800_000, mealEligible: true },
    { id: newId(), name: "Taqin", role: "Road Crew", roleType: "standard" as const, defaultFee: 650_000, minFee: 600_000, maxFee: 800_000, mealEligible: true },
    { id: newId(), name: "Indra", role: "Road Crew", roleType: "standard" as const, defaultFee: 650_000, minFee: 600_000, maxFee: 800_000, mealEligible: true },
    { id: newId(), name: "Fahmi", role: "Road Crew", roleType: "standard" as const, defaultFee: 650_000, minFee: 600_000, maxFee: 800_000, mealEligible: true },
    { id: newId(), name: "Content Creator", role: "Content Creator", roleType: "specialist" as const, defaultFee: 500_000, minFee: 0, maxFee: 0, mealEligible: false },
  ]

  await db.insert(crew).values(
    crewDefs.map((c) => ({
      id: c.id,
      userId,
      name: c.name,
      role: c.role,
      roleType: c.roleType,
      defaultFee: c.defaultFee,
      minFee: c.minFee,
      maxFee: c.maxFee,
      mealEligible: c.mealEligible,
      active: true,
    })),
  )

  await db.insert(settings).values({
    id: newId(),
    userId,
    crewMinFee: DEFAULT_SETTINGS.crewMinFee,
    crewMaxFee: DEFAULT_SETTINGS.crewMaxFee,
    mealRate: DEFAULT_SETTINGS.mealRate,
    mealCutoff: DEFAULT_SETTINGS.mealCutoff,
  })

  await db.insert(productionRoles).values(
    PRODUCTION_ROLE_DEFAULTS.map((p) => ({
      id: newId(),
      userId,
      name: p.name,
      defaultFee: p.defaultFee,
      active: true,
    })),
  )

  await seedDemoGigs(userId, memberIds, crewDefs.map((c) => c.id))
}

async function seedDemoGigs(userId: string, memberIds: string[], crewIds: string[]): Promise<void> {
  const [farras, taqin, indra, fahmi, creator] = crewIds
  const now = new Date().getTime()
  const ts = (daysAgo: number) => new Date(now - daysAgo * 86_400_000)
  const dateStr = (daysAgo: number) => new Date(now - daysAgo * 86_400_000).toISOString().slice(0, 10)

  const crewFee = (id: string) =>
    id === farras ? 700_000 : id === creator ? 500_000 : 650_000

  const specs = [
    {
      name: "Dies Natalis Universitas Indonesia",
      client: "BEM UI",
      venue: "Balairung UI",
      city: "Depok",
      daysAgo: 32,
      type: "Festival",
      fee: 15_000_000,
      soundcheck: "14:00",
      show: "19:00",
      kind: "out_of_town" as ItineraryKind,
      crew: [farras, taqin, indra, fahmi],
      expenses: [
        { c: "Photographer", n: "Photographer", a: 300_000 },
        { c: "VJ", n: "VJ", a: 200_000 },
        { c: "Content Creator", n: "Content Creator", a: 500_000 },
        { c: "Transport", n: "Transport", a: 800_000 },
        { c: "Uang Kas", n: "Uang Kas", a: 200_000 },
      ],
      status: "paid" as const,
      memberPayout: 2_070_000,
    },
    {
      name: "Pentas Seni SMAN 1 Jakarta",
      client: "OSIS SMAN 1",
      venue: "Aula SMAN 1",
      city: "Jakarta",
      daysAgo: 46,
      type: "Private Event",
      fee: 6_500_000,
      soundcheck: "09:00",
      show: "15:00",
      kind: "local" as ItineraryKind,
      crew: [farras, taqin],
      expenses: [
        { c: "Photographer", n: "Photographer", a: 300_000 },
        { c: "Uang Kas", n: "Uang Kas", a: 150_000 },
      ],
      status: "paid" as const,
      memberPayout: 940_000,
    },
    {
      name: "Gelar Karya SMK Nusantara",
      client: "Yayasan Nusantara",
      venue: "Lapangan Sekolah",
      city: "Bogor",
      daysAgo: 59,
      type: "Festival",
      fee: 8_500_000,
      soundcheck: "13:00",
      show: "19:00",
      kind: "out_of_town" as ItineraryKind,
      crew: [farras, taqin, indra],
      expenses: [
        { c: "Content Creator", n: "Content Creator", a: 500_000 },
        { c: "Transport", n: "Transport", a: 400_000 },
        { c: "Uang Kas", n: "Uang Kas", a: 150_000 },
      ],
      status: "paid" as const,
      memberPayout: 1_090_000,
    },
    {
      name: "Semarak Kampus",
      client: "Panitia Dies",
      venue: "Gedung Serba Guna",
      city: "Bandung",
      daysAgo: 74,
      type: "Corporate",
      fee: 11_000_000,
      soundcheck: "12:00",
      show: "20:00",
      kind: "out_of_town" as ItineraryKind,
      crew: [farras, taqin, indra, fahmi],
      expenses: [
        { c: "VJ", n: "VJ", a: 200_000 },
        { c: "Lighting", n: "Lighting", a: 300_000 },
        { c: "Transport", n: "Transport", a: 600_000 },
        { c: "Uang Kas", n: "Uang Kas", a: 200_000 },
      ],
      status: "confirmed" as const,
      memberPayout: 1_410_000,
    },
    {
      name: "Wisuda Universitas",
      client: "Biro Kemahasiswaan",
      venue: "Convention Hall",
      city: "Tangerang",
      daysAgo: 87,
      type: "Corporate",
      fee: 7_000_000,
      soundcheck: "10:00",
      show: "14:00",
      kind: "local" as ItineraryKind,
      crew: [farras, taqin],
      expenses: [
        { c: "Photographer", n: "Photographer", a: 300_000 },
        { c: "Uang Kas", n: "Uang Kas", a: 150_000 },
      ],
      status: "paid" as const,
      memberPayout: 1_040_000,
    },
  ]

  for (const spec of specs) {
    const gigId = newId()
    const eventDate = dateStr(spec.daysAgo)
    const paid = spec.status === "paid"
    const itinerary = buildItinerary(spec.kind, spec.soundcheck, spec.show)

    await db.insert(gigs).values({
      id: gigId,
      userId,
      eventName: spec.name,
      client: spec.client,
      venue: spec.venue,
      city: spec.city,
      eventDate,
      gigType: spec.type,
      totalFee: spec.fee,
      soundcheckTime: spec.soundcheck,
      showTime: spec.show,
      mealOverride: null,
      splitMode: "equal",
      status: spec.status,
      notes: "",
      createdAt: ts(spec.daysAgo),
      updatedAt: ts(2),
    })

    await db.insert(gigMembers).values(
      memberIds.map((id) => ({
        id: newId(),
        gigId,
        memberId: id,
        splitPct: 20,
        payout: spec.memberPayout,
        paymentStatus: paid ? ("paid" as const) : ("pending" as const),
        paymentDate: paid ? eventDate : null,
        paymentMethod: paid ? "Transfer" : null,
      })),
    )

    await db.insert(gigCrew).values(
      spec.crew.map((cid) => ({
        id: newId(),
        gigId,
        crewId: cid,
        role: cid === farras ? "Sound Engineer" : cid === creator ? "Content Creator" : "Road Crew",
        roleType: cid === creator ? ("specialist" as const) : ("standard" as const),
        fee: crewFee(cid),
        overrideRate: false,
        paymentStatus: paid ? ("paid" as const) : ("pending" as const),
        paymentDate: paid ? eventDate : null,
      })),
    )

    if (spec.expenses.length > 0) {
      await db.insert(expenses).values(
        spec.expenses.map((e) => ({
          id: newId(),
          gigId,
          category: e.c,
          name: e.n,
          amount: e.a,
          notes: "",
        })),
      )
    }

    const templateId = newId()
    await db.insert(itineraryTemplates).values({
      id: templateId,
      userId,
      gigId,
      name: spec.name,
      templateType: spec.kind,
      createdAt: ts(spec.daysAgo),
      updatedAt: ts(2),
    })
    await db.insert(itineraryTemplateItems).values(
      itinerary.map((i, idx) => ({
        id: newId(),
        templateId,
        time: i.time,
        label: i.label,
        position: idx,
      })),
    )
  }
}
