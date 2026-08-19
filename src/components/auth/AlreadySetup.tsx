"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { useLocale } from "@/components/LocaleProvider"

export function AlreadySetup() {
  const router = useRouter()
  const { t } = useLocale()
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="logo-oblique text-2xl tracking-tight text-fg">magicpie</h1>
          <p className="text-sm text-fg-muted">{t("Already set up.")}</p>
        </div>
        <div className="card p-6 text-center shadow-md">
          <p className="text-sm text-fg-muted">{t("The app is already configured. Sign in to continue.")}</p>
          <Button className="mt-4 w-full" onClick={() => router.push("/login")}>
            {t("Sign in")}
          </Button>
        </div>
      </div>
    </div>
  )
}