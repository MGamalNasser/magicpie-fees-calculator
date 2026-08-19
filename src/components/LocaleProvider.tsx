"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import {
  type Locale,
  formatDateLocal,
  getActiveLocale,
  setActiveLocale,
  translate,
} from "@/lib/i18n"
import { InlineScript } from "@/components/ui/InlineScript"

const STORAGE_KEY = "mp-locale"

interface LocaleContextValue {
  locale: Locale
  setLocale: (l: Locale) => void
  toggle: () => void
  t: (key: string, params?: Record<string, string | number>) => string
  td: (iso: string) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

const langScript = `try{document.documentElement.lang=localStorage.getItem("mp-locale")==="id"?"id":"en"}catch(e){}`

export function LocaleScript() {
  return <InlineScript html={langScript} />
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en"
    return getActiveLocale()
  })

  useEffect(() => {
    setActiveLocale(locale)
    document.documentElement.lang = locale
    localStorage.setItem(STORAGE_KEY, locale)
  }, [locale])

  const setLocale = useCallback((l: Locale) => setLocaleState(l), [])
  const toggle = useCallback(() => setLocaleState((p) => (p === "en" ? "id" : "en")), [])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      toggle,
      t: (key, params) => translate(key, locale, params),
      td: (iso) => formatDateLocal(iso, locale),
    }),
    [locale, setLocale, toggle],
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider")
  return ctx
}