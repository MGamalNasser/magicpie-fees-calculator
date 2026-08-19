import { redirect } from "next/navigation"
import { getSessionCookie } from "better-auth/cookies"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"
import { AdminSetupCard } from "@/components/auth/AdminSetupCard"
import { AlreadySetup } from "@/components/auth/AlreadySetup"

export const dynamic = "force-dynamic"

export default async function SignupPage() {
  const sessionCookie = getSessionCookie(await headers())
  if (sessionCookie) redirect("/")

  const existing = await db.select({ id: user.id }).from(user).all()
  if (existing.length > 0) {
    return <AlreadySetup />
  }
  return <AdminSetupCard />
}