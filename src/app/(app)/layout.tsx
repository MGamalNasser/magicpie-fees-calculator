import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { DataProvider } from "@/components/DataProvider"
import { Shell } from "@/components/Shell"

export const dynamic = "force-dynamic"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) redirect("/login")

  const role = session.user.role === "member" ? "member" : "admin"

  if (role === "member") {
    return <Shell role="member">{children}</Shell>
  }

  return (
    <DataProvider>
      <Shell role="admin">{children}</Shell>
    </DataProvider>
  )
}