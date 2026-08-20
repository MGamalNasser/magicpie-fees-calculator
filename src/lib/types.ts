export type RoleType = "standard" | "specialist"
export type GigStatus = "draft" | "confirmed" | "paid" | "cancelled"
export type PaymentStatus = "pending" | "paid"
export type SplitMode = "equal" | "percentage"
export type BalanceStatus = "balanced" | "over_budget" | "split_invalid"

export interface Member {
  id: string
  name: string
  role: string
  defaultSplit: number
  active: boolean
  account?: string
}

export interface CrewMember {
  id: string
  name: string
  role: string
  roleType: RoleType
  defaultFee: number
  minFee: number
  maxFee: number
  mealEligible: boolean
  active: boolean
}

export interface Expense {
  id: string
  category: string
  name: string
  amount: number
  notes?: string
}

export interface GigMember {
  id: string
  memberId: string
  splitPct: number
  payout: number
  paymentStatus: PaymentStatus
  paymentDate?: string
  paymentMethod?: string
}

export interface GigCrew {
  id: string
  crewId: string
  role: string
  roleType: RoleType
  fee: number
  overrideRate: boolean
  paymentStatus: PaymentStatus
  paymentDate?: string
  paymentMethod?: string
}

export interface ItineraryItem {
  id: string
  time: string
  label: string
}

export interface ItineraryTemplate {
  id: string
  gigId: string
  name: string
  templateType: "local" | "out_of_town"
  items: ItineraryItem[]
  createdAt: string
  updatedAt: string
}

export interface Gig {
  id: string
  eventName: string
  client: string
  venue: string
  city: string
  eventDate: string
  gigType: string
  totalFee: number
  soundcheckTime: string
  showTime: string
  mealOverride: number | null
  splitMode: SplitMode
  status: GigStatus
  notes: string
  createdAt: string
  updatedAt: string
  members: GigMember[]
  crew: GigCrew[]
  expenses: Expense[]
}

export interface Settings {
  crewMinFee: number
  crewMaxFee: number
  mealRate: number
  mealCutoff: string
}

export interface ProductionRole {
  id: string
  name: string
  defaultFee: number
  active: boolean
}

export interface AppData {
  members: Member[]
  crew: CrewMember[]
  gigs: Gig[]
  templates: ItineraryTemplate[]
  settings: Settings
  productionRoles: ProductionRole[]
}

export interface AuditLogRow {
  id: string
  actorName: string
  action: string
  gigName: string | null
  entityName: string | null
  detail: string | null
  createdAt: string
}

export interface MyPayout {
  memberId: string
  payout: number
  splitPct: number
  paymentStatus: PaymentStatus
  paymentDate?: string
  paymentMethod?: string
  eventName: string
  eventDate: string
  gigStatus: GigStatus
}

export interface MyPayoutsData {
  members: Member[]
  payouts: MyPayout[]
}

export interface CrewLineResult {
  crew: GigCrew
  person: CrewMember | null
  meal: number
  validation: { ok: boolean; message?: string }
}

export interface MemberLineResult {
  gigMember: GigMember
  person: Member | null
  payout: number
}

export interface Settlement {
  gigFee: number
  crewTotal: number
  mealTotal: number
  productionTotal: number
  otherTotal: number
  expensesTotal: number
  netBand: number
  memberCount: number
  perMember: number
  memberLines: MemberLineResult[]
  crewLines: CrewLineResult[]
  memberPayoutTotal: number
  balanceStatus: BalanceStatus
  splitTotal: number
}
