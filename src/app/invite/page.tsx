import { redirect } from "next/navigation"
import { getSessionCookie } from "better-auth/cookies"
import { headers } from "next/headers"
import { getInviteInfoAction } from "@/lib/actions"
import { InviteCard } from "@/components/auth/InviteCard"

export const dynamic = "force-dynamic"

export default async function InvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const sessionCookie = getSessionCookie(await headers())
  if (sessionCookie) redirect("/")

  const { token } = await searchParams
  const info = token ? await getInviteInfoAction(token) : null

  return <InviteCard email={info?.email ?? null} memberName={info?.memberName ?? null} token={token ?? ""} />
}