"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { acceptInviteAction } from "@/lib/actions"
import { Button } from "@/components/ui/Button"
import { Field, Input } from "@/components/ui/Input"
import { useLocale } from "@/components/LocaleProvider"

export function InviteCard({
  email,
  memberName,
  token,
}: {
  email: string | null
  memberName: string | null
  token: string
}) {
  const router = useRouter()
  const { t } = useLocale()
  const [name, setName] = useState(memberName ?? "")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!email) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg px-4">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center gap-2">
            <h1 className="logo-oblique text-2xl tracking-tight text-fg">magicpie</h1>
          </div>
          <div className="card p-6 text-center shadow-md">
            <p className="text-sm text-fg-muted">
              {t("This invite is invalid or has expired.")}
            </p>
            <Button
              variant="secondary"
              className="mt-4 w-full"
              onClick={() => router.push("/login")}
            >
              {t("Sign in")}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await acceptInviteAction({ token, name, password })
      if (!res.ok) {
        setError(res.error)
        return
      }
      const signIn = await authClient.signIn.email({ email, password })
      if (signIn.error) {
        setError(signIn.error.message ?? t("Authentication failed"))
        return
      }
      router.push("/me")
      router.refresh()
    } catch {
      setError(t("Something went wrong. Please try again."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2">
          <h1 className="logo-oblique text-2xl tracking-tight text-fg">magicpie</h1>
          <p className="text-sm text-fg-muted">{t("Accept invite")}</p>
        </div>

        <div className="card p-6 shadow-md">
          {error ? (
            <div className="mb-4 rounded-lg bg-red-soft px-3 py-2 text-[13px] text-red">
              {error}
            </div>
          ) : null}
          <p className="mb-4 text-[13px] text-fg-muted">
            {t("You've been invited to Magicpie.")}{" "}
            {t("Set a password to activate your account.")}
          </p>

          <form onSubmit={onSubmit}>
            <Field label={t("Email")} className="mb-3">
              <Input
                type="email"
                value={email}
                readOnly
                disabled
                className="text-fg-muted"
                autoComplete="email"
              />
            </Field>
            <Field label={t("Name")} className="mb-3">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("Your name")}
                autoComplete="name"
                required
              />
            </Field>
            <Field label={t("Password")} className="mb-5">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </Field>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? t("Working…") : t("Accept invite")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}