# PRD — Magicpie Fees Calculator

**Product:** Magicpie Fees Calculator (Web Honor Splitter)
**Status:** v1.0 — Final (deployed live)
**Live URL:** https://magicpie-dashboard.vercel.app

## 1. Product Overview

A web app for the Magicpie band (Gege, Ical, Bayu, Dendi, Boim) to manage gig income,
calculate production deductions, and split net fees across the band. Managers record each
gig's contract fee, assign members and crew, add production and operational expenses, and
the app computes the net band fee automatically — with payout tracking, PDF/Excel export,
itinerary templates, and a full audit log.

The app is closed-access: **no public signup and no invites**. Five pre-created accounts
are the only way in, and every admin operates on **one shared workspace**.

## 2. Tech Stack

- **Framework:** Next.js 16 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn-style UI components (`src/components/ui`)
- **Auth:** better-auth — **email/password only** (Google OAuth removed)
- **Database:** Drizzle ORM + `@libsql/client`
  - **Production:** Turso (hosted libSQL) — `libsql://magicpie-mgamalnasser.aws-ap-northeast-1.turso.io`
  - **Local fallback:** `file:./magicpie.db`
- **Exports:** `pdf-lib` (PDF), `exceljs`/`xlsx` (Excel)
- **Deployment:** Vercel (Production), `npm run build && next start`

## 3. Authentication, Roles & Access

- **Sign-in:** email + password only (`/login`). Google social login was **removed**.
- **No invites:** the invite system (tokens, invite links, invite emails) was **removed**.
- **No public signup:** `databaseHooks.user.create.before` blocks account creation once any
  user exists. `/signup` shows the first-admin setup only when the user table is empty
  (gated by `ADMIN_SETUP_CODE`).
- **Pre-created accounts (the only access):**

  | Name | Email | Role |
  |------|-------|------|
  | Gege | m.gamal.nasser@gmail.com | `superadmin` (workspace owner) |
  | Ical | ical@magicpie.id | `admin` |
  | Bayu | bayu@magicpie.id | `admin` |
  | Dendi | dendi@magicpie.id | `admin` |
  | Boim | boim@magicpie.id | `admin` |

- **Roles:**
  - `superadmin` / `admin` — full access to all modules.
  - `member` — redirected to `/me` only; the shell hides all other nav; all server actions
    throw `Unauthorized` for member role.
- **Shared workspace:** `getWorkspaceOwnerId()` resolves the single `superadmin` user and
  **all data (gigs, members, crew, settings, production roles, audit log) is scoped to that
  owner** — every admin sees and edits the same band-wide data. Member-linked accounts are
  optional via `members.account_user_id`.

## 4. Business Rules

### 4.1 Gig Types
`Private Event, Festival, Corporate, Birthday, Launch, Campus, School, Other`.
The default for new gigs is **Festival** (Wedding was removed).

### 4.2 Expenses
- **Production categories:** Photographer, VJ, Content Creator, Videographer,
  FOH Engineer, Lighting.
- **Operational categories:** Uang Kas, Uang Tak Terduga, Transport, Parking, Toll,
  Equipment, Guest Musician, Catering, Lainnya.
- **Production roles** are managed as presets in Masters (name + default fee) and feed the
  gig expense picker.

### 4.3 Crew
- Per-gig crew fee is validated against settings bounds (default **min 600,000 / max
  800,000**) with `override_rate` to allow exceptions.
- **Meal allowance:** meal-eligible crew receive the meal rate (default **100,000**) when
  the gig's soundcheck time is before the cutoff (default **12:00**); otherwise 0.
- Crew can be deactivated (kept for history, no longer selectable).

### 4.4 Fee Settlement
- **Net fee = total fee − (crew fees + meal allowances + production expenses +
  operational expenses).**
- Split modes: **equal** or **percentage** (members carry `default_split`, e.g. 20).
- Gig statuses: `draft → confirmed → paid`, or `cancelled`.
- Per-member / per-crew `payment_status` (`pending`/`paid`) with payment date & method.

## 5. Functional Modules

| Route | Module | Notes |
|-------|--------|-------|
| `/login` | Login | email/password sign-in |
| `/signup` | First-admin setup | only when zero users exist |
| `/` | Dashboard | gig stats + recent gigs |
| `/gigs`, `/gigs/new`, `/gigs/[id]`, `/gigs/[id]/edit` | Gig management | CRUD, members/crew/expenses, settlement breakdown, status, **PDF & Excel export**, delete |
| `/itinerary` | Itinerary templates | local / out-of-town templates with ordered time-slot items; export logging |
| `/masters` | Masters | members, crew, production roles presets |
| `/me` | Member dashboard | own payouts per gig (members only) |
| `/settings` | Settings | crew fee bounds, meal rate & cutoff, production roles, **activity/audit log** |

**Removed (do not reintroduce):** `/invite` page, invite actions
(`sendInviteAction`, `acceptInviteAction`, `getInvitesAction`, `revokeInviteAction`,
`getInviteInfoAction`), invite emails (`src/lib/email.ts`, Resend), Google social login,
Wedding gig type.

## 6. Data Model (Turso / libSQL)

- `user`, `session`, `account` — better-auth tables (role on user).
- `members` — band members (default split, active, optional linked account).
- `crew` — crew presets (role, role type standard/specialist, fee bounds, meal eligibility).
- `gigs`, `gig_members`, `gig_crew` — gigs and their settlement lines.
- `expenses` — per-gig production/operational expenses.
- `itinerary_templates`, `itinerary_template_items` — reusable itineraries.
- `settings` — per-owner crew/meal defaults.
- `production_roles` — production expense presets.
- `audit_logs` — full activity trail (gig, member, crew, settings, exports).

All business tables are keyed to the workspace owner (`user_id`), cascading on delete.

## 7. Server Actions

`getDataAction, saveGigAction, deleteGigAction, setGigStatusAction,
setMemberPaymentAction, setCrewPaymentAction, saveItineraryTemplateAction,
deleteItineraryTemplateAction, logItineraryExportAction, saveMemberAction,
deleteMemberAction, saveCrewAction, deleteCrewAction, saveSettingsAction,
setupAdminAction, saveProductionRoleAction, deleteProductionRoleAction,
getMyPayoutsAction, logExportAction, getAuditLogAction`

## 8. Deployment & Environment

Vercel (Production) + Turso hosted DB. Required env vars:

- `BETTER_AUTH_URL` — `https://magicpie-dashboard.vercel.app`
- `BETTER_AUTH_SECRET` — better-auth signing secret (required in production)
- `TURSO_DATABASE_URL` — Turso DB URL
- `TURSO_AUTH_TOKEN` — Turso write token
- `ADMIN_SETUP_CODE` — code required for first-admin setup

Note: better-auth 500s every auth route if `BETTER_AUTH_SECRET` is unset in production,
and the app needs `TURSO_*` (Vercel's filesystem is ephemeral — the local SQLite fallback
does not persist there).

## 9. Known Limitations

- Access is fixed to the five pre-created accounts; adding a manager requires a manual DB
  insert + `setupAdminAction` (or the first-admin setup when the table is empty).
- Local development uses `file:./magicpie.db`; schema changes must be pushed to Turso
  (`npx drizzle-kit push --force` with `TURSO_*` set).