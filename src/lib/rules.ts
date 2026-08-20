export const PRODUCTION_CATEGORIES = [
  "Photographer",
  "VJ",
  "Content Creator",
  "Videographer",
  "FOH Engineer",
  "Lighting",
]

export const OTHER_CATEGORIES = [
  "Uang Kas",
  "Uang Tak Terduga",
  "Transport",
  "Parking",
  "Toll",
  "Equipment",
  "Guest Musician",
  "Catering",
  "Lainnya",
]

export const EXPENSE_CATEGORIES = [...PRODUCTION_CATEGORIES, ...OTHER_CATEGORIES]

export const CREW_ROLE_SUGGESTIONS = [
  "Sound Engineer",
  "FOH Engineer",
  "Monitor Engineer",
  "Stage Crew",
  "Stage Manager",
  "Roadman",
  "Road Crew",
  "Guitar Tech",
  "Drum Tech",
  "Bass Tech",
  "Keyboard Tech",
  "Backline Tech",
  "Lighting Tech",
  "VJ",
  "Photographer",
  "Videographer",
  "Merchandiser",
  "Production Manager",
  "Driver",
  "Content Creator",
  "Additional Member",
]

export const GIG_TYPES = [
  "Private Event",
  "Festival",
  "Corporate",
  "Birthday",
  "Launch",
  "Campus",
  "School",
  "Other",
]

export const SOUNDCHECK_PRESETS: { label: string; time: string }[] = [
  { label: "Morning", time: "08:00" },
  { label: "Midday", time: "12:00" },
  { label: "Evening", time: "16:00" },
  { label: "Night", time: "20:00" },
]

export const SHOW_PRESETS: { label: string; time: string }[] = [
  { label: "Afternoon", time: "14:00" },
  { label: "Early evening", time: "17:00" },
  { label: "Night show", time: "20:00" },
  { label: "Late night", time: "22:00" },
]

export type ItineraryKind = "local" | "out_of_town"

export interface ItineraryTemplateItem {
  labelKey: string
  base: "soundcheck" | "show"
  offsetMin: number
}

export const ITINERARY_TEMPLATES: Record<ItineraryKind, ItineraryTemplateItem[]> = {
  local: [
    { labelKey: "Soundcheck", base: "soundcheck", offsetMin: 0 },
    { labelKey: "Line check", base: "soundcheck", offsetMin: 60 },
    { labelKey: "Doors open", base: "show", offsetMin: -60 },
    { labelKey: "Showtime", base: "show", offsetMin: 0 },
  ],
  out_of_town: [
    { labelKey: "Depart", base: "show", offsetMin: -300 },
    { labelKey: "Arrive venue", base: "show", offsetMin: -180 },
    { labelKey: "Load in & setup", base: "soundcheck", offsetMin: -60 },
    { labelKey: "Soundcheck", base: "soundcheck", offsetMin: 0 },
    { labelKey: "Line check", base: "soundcheck", offsetMin: 60 },
    { labelKey: "Doors open", base: "show", offsetMin: -60 },
    { labelKey: "Showtime", base: "show", offsetMin: 0 },
  ],
}

export const ITINERARY_KINDS: { id: ItineraryKind; label: string }[] = [
  { id: "local", label: "Local" },
  { id: "out_of_town", label: "Out of town" },
]

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number)
  if (!Number.isFinite(h) || !Number.isFinite(m)) return 0
  return h * 60 + m
}

function toTime(min: number): string {
  const m = ((min % 1440) + 1440) % 1440
  const h = String(Math.floor(m / 60)).padStart(2, "0")
  const mm = String(m % 60).padStart(2, "0")
  return `${h}:${mm}`
}

export function buildItinerary(
  kind: ItineraryKind,
  soundcheck: string,
  show: string,
): { time: string; label: string }[] {
  const base = {
    soundcheck: toMin(soundcheck),
    show: toMin(show),
  }
  return ITINERARY_TEMPLATES[kind].map((d) => ({
    time: toTime(base[d.base] + d.offsetMin),
    label: d.labelKey,
  }))
}

export const SPECIALIST_ROLES = [
  "Photographer",
  "VJ",
  "Content Creator",
  "Videographer",
  "FOH Engineer",
  "Lighting",
  "Special Guest Crew",
]

export const GIG_STATUSES = ["draft", "confirmed", "paid", "cancelled"] as const

export const DEFAULT_SETTINGS = {
  crewMinFee: 600_000,
  crewMaxFee: 800_000,
  mealRate: 100_000,
  mealCutoff: "12:00",
}
