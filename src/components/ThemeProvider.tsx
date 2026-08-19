"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react"

const STORAGE_KEY = "mp-theme"

type Theme = "light" | "dark"

const subscribe = () => () => {}

const ThemeContext = createContext<{ theme: Theme; toggle: () => void; mounted: boolean }>({
  theme: "light",
  toggle: () => {},
  mounted: false,
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light"
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
  })
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
    localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"))
  }, [])

  const value = useMemo(() => ({ theme, toggle, mounted }), [theme, toggle, mounted])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
