"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  CalendarDays,
  Command,
  Languages,
  LayoutDashboard,
  LogOut,
  Moon,
  Plus,
  Route,
  Search,
  Settings2,
  Sun,
  Users,
  Wallet,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useTheme } from "./ThemeProvider"
import { useLocale } from "./LocaleProvider"
import { cn } from "@/lib/cn"
import { Button } from "./ui/Button"

export function Shell({
  role,
  children,
}: {
  role: "admin" | "member"
  children: React.ReactNode
}) {
  const [userName, setUserName] = useState("")
  const { theme, toggle, mounted } = useTheme()
  const { t, locale, toggle: toggleLocale } = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => {
    if (role === "member" && pathname !== "/me") router.replace("/me")
    if (role === "admin" && pathname === "/me") router.replace("/")
  }, [role, pathname, router])

  useEffect(() => {
    authClient
      .getSession()
      .then((res) => setUserName(res.data?.user?.name ?? ""))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (role !== "admin") return
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault()
        router.push("/gigs/new")
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [role, router])

  const signOut = useCallback(async () => {
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }, [router])

  const NAV =
    role === "member"
      ? [{ href: "/me", label: t("My Payouts"), icon: Wallet }]
      : [
          { href: "/", label: t("Dashboard"), icon: LayoutDashboard },
          { href: "/gigs", label: t("Gigs"), icon: CalendarDays },
          { href: "/itinerary", label: t("Itinerary"), icon: Route },
          { href: "/masters", label: t("Masters"), icon: Users },
          { href: "/settings", label: t("Settings"), icon: Settings2 },
        ]

  return (
    <div className="flex min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 flex-col border-r border-line bg-surface px-3 py-4 md:flex">
        <Link href={role === "member" ? "/me" : "/"} className="block px-2 py-1">
          <span className="logo-oblique text-xl font-bold tracking-tight text-fg">magicpie</span>
        </Link>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-accent-soft text-accent"
                    : "text-fg-muted hover:bg-muted hover:text-fg",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold text-fg-muted">
              {userName.slice(0, 1).toUpperCase() || "?"}
            </span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-fg-muted">
              {userName}
            </span>
            <button
              onClick={signOut}
              className="focus-ring rounded-md p-1.5 text-fg-subtle hover:text-fg"
              title={t("Sign out")}
              aria-label={t("Sign out")}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col md:pl-56">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-line bg-bg/80 px-4 backdrop-blur-md md:px-6">
          <div className="flex min-w-0 items-center gap-2 md:hidden">
            <Link href={role === "member" ? "/me" : "/"} className="flex flex-shrink-0 items-center">
              <span className="logo-oblique text-lg font-bold tracking-tight text-fg">magicpie</span>
            </Link>
            <nav className="flex min-w-0 items-center gap-0.5 overflow-x-auto whitespace-nowrap">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex-shrink-0 rounded-md px-2 py-1 text-[13px] font-medium",
                    pathname === href || (href !== "/" && pathname.startsWith(href))
                      ? "text-accent"
                      : "text-fg-muted",
                  )}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {role === "admin" ? (
            <button
              onClick={() => setPaletteOpen(true)}
              className="focus-ring flex h-8 w-full max-w-xs items-center gap-2 rounded-lg border border-line bg-elevated px-2.5 text-[13px] text-fg-subtle transition-colors hover:border-line-strong sm:w-64"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t("Quick actions…")}</span>
              <span className="ml-auto hidden items-center gap-0.5 rounded border border-line px-1 text-[11px] text-fg-subtle sm:inline-flex">
                <Command className="h-2.5 w-2.5" />K
              </span>
            </button>
          ) : (
            <div className="hidden w-full max-w-xs sm:block" />
          )}

          <div className="flex items-center gap-2">
            {role === "admin" ? (
              <Button
                size="sm"
                className="hidden sm:inline-flex"
                onClick={() => router.push("/gigs/new")}
              >
                <Plus className="h-3.5 w-3.5" />
                {t("New Gig")}
              </Button>
            ) : null}
            <button
              onClick={toggleLocale}
              className="focus-ring rounded-lg p-2 text-fg-muted hover:bg-muted hover:text-fg"
              aria-label={locale === "en" ? "Bahasa Indonesia" : "English"}
              title={locale === "en" ? "Bahasa Indonesia" : "English"}
            >
              <Languages className="h-4 w-4" />
            </button>
            <button
              onClick={toggle}
              className="focus-ring rounded-lg p-2 text-fg-muted hover:bg-muted hover:text-fg"
              aria-label={t("Toggle theme")}
            >
              {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : null}
              {mounted && theme !== "dark" ? <Moon className="h-4 w-4" /> : null}
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-6 md:py-8">
          {role === "member" && pathname !== "/me" ? <div className="h-40" /> : children}
        </main>
      </div>

      {paletteOpen ? (
        <CommandPalette onClose={() => setPaletteOpen(false)} />
      ) : null}

      {role === "admin" && pathname !== "/gigs/new" ? (
        <Button
          size="icon"
          onClick={() => router.push("/gigs/new")}
          className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full shadow-lg sm:hidden"
          aria-label={t("New Gig")}
          title={t("New Gig")}
        >
          <Plus className="h-6 w-6" />
        </Button>
      ) : null}
    </div>
  )
}

function CommandPalette({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const { t } = useLocale()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])

  const items = useMemo(() => {
    const base = [
      { label: t("New Gig"), hint: "⌘N", run: () => router.push("/gigs/new") },
      { label: t("Dashboard"), run: () => router.push("/") },
      { label: t("Gigs"), run: () => router.push("/gigs") },
      { label: t("Itinerary"), run: () => router.push("/itinerary") },
      { label: t("Masters"), run: () => router.push("/masters") },
      { label: t("Settings"), run: () => router.push("/settings") },
      {
        label: theme === "dark" ? t("Switch to light mode") : t("Switch to dark mode"),
        run: () => toggle(),
      },
    ]
    if (!query) return base
    const q = query.toLowerCase()
    return base.filter((i) => i.label.toLowerCase().includes(q))
  }, [query, router, theme, toggle, t])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[15vh] backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="animate-scale-in card w-full max-w-md p-0 shadow-lg">
        <div className="flex items-center gap-2 border-b border-line px-3">
          <Search className="h-4 w-4 text-fg-subtle" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && items[0]) {
                items[0].run()
                onClose()
              }
            }}
            placeholder={t("Jump to a page or run a command…")}
            className="h-11 flex-1 bg-transparent text-sm text-fg placeholder:text-fg-subtle focus-ring outline-none"
          />
        </div>
        <div className="max-h-72 overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-fg-subtle">
              {t("No results for “{query}”", { query })}
            </p>
          ) : (
            items.map((item, i) => (
              <button
                key={item.label}
                onClick={() => {
                  item.run()
                  onClose()
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  i === 0 ? "bg-accent-soft text-fg" : "text-fg-muted hover:bg-muted hover:text-fg",
                )}
              >
                <span>{item.label}</span>
                {item.hint ? (
                  <span className="text-xs text-fg-subtle">{item.hint}</span>
                ) : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}