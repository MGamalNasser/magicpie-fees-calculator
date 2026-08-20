"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/Button"
import { Field, Input } from "@/components/ui/Input"
import { useLocale } from "@/components/LocaleProvider"

export function AuthCard({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter()
  const { t } = useLocale()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const run = async (fn: () => Promise<{ error: { message?: string } | null }>) => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fn()
      if (res.error) {
        setError(res.error.message ?? t("Authentication failed"))
        return
      }
      router.push("/")
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
          <p className="text-sm text-fg-muted">
            {mode === "login"
              ? t("Sign in to manage gig settlements")
              : t("Create an account to get started")}
          </p>
        </div>

        <div className="card p-6 shadow-md">
          {error ? (
            <div className="mb-4 rounded-lg bg-red-soft px-3 py-2 text-[13px] text-red">
              {error}
            </div>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault()
              run(() =>
                mode === "login"
                  ? authClient.signIn.email({ email, password })
                  : authClient.signUp.email({ email, password, name: name || email.split("@")[0] }),
              )
            }}
          >
            {mode === "signup" ? (
              <Field label={t("Name")} className="mb-3">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("Your name")}
                  autoComplete="name"
                />
              </Field>
            ) : null}
            <Field label={t("Email")} className="mb-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </Field>
            <Field label={t("Password")} className="mb-5">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </Field>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting
                ? t("Working…")
                : mode === "login"
                  ? t("Sign in")
                  : t("Create account")}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-[13px] text-fg-muted">
          {mode === "login" ? (
            <>
              {t("Don't have an account?")}{" "}
              <a href="/signup" className="font-medium text-accent hover:underline">
                {t("Sign up")}
              </a>
            </>
          ) : (
            <>
              {t("Already have an account?")}{" "}
              <a href="/login" className="font-medium text-accent hover:underline">
                {t("Sign in")}
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}