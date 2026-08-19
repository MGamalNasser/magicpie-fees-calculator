"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import * as actions from "@/lib/actions"
import type { AppData, Gig, Member, CrewMember, ItineraryTemplate, Settings } from "@/lib/types"

interface DataContextValue {
  data: AppData | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  saveGig: (gig: Gig, source?: "manual" | "import") => Promise<void>
  deleteGig: (id: string) => Promise<void>
  saveItineraryTemplate: (tpl: ItineraryTemplate) => Promise<void>
  deleteItineraryTemplate: (id: string) => Promise<void>
  setGigStatus: (id: string, status: Gig["status"]) => Promise<void>
  setMemberPayment: (
    gigId: string,
    rowId: string,
    status: "pending" | "paid",
    paymentDate?: string,
    paymentMethod?: string,
  ) => Promise<void>
  setCrewPayment: (
    gigId: string,
    rowId: string,
    status: "pending" | "paid",
    paymentDate?: string,
    paymentMethod?: string,
  ) => Promise<void>
  saveMember: (m: Member) => Promise<void>
  deleteMember: (id: string) => Promise<void>
  saveCrew: (c: CrewMember) => Promise<void>
  deleteCrew: (id: string) => Promise<void>
  saveSettings: (s: Settings) => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mounted = useRef(false)

  const refresh = useCallback(async () => {
    try {
      const d = await actions.getDataAction()
      setData(d)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data")
    }
  }, [])

  useEffect(() => {
    if (mounted.current) return
    mounted.current = true
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const value = useMemo<DataContextValue>(
    () => ({
      data,
      loading,
      error,
      refresh,
      saveGig: async (gig, source) => {
        await actions.saveGigAction(gig, { source })
        await refresh()
      },
      deleteGig: async (id) => {
        await actions.deleteGigAction(id)
        await refresh()
      },
      saveItineraryTemplate: async (tpl) => {
        await actions.saveItineraryTemplateAction(tpl)
        await refresh()
      },
      deleteItineraryTemplate: async (id) => {
        await actions.deleteItineraryTemplateAction(id)
        await refresh()
      },
      setGigStatus: async (id, status) => {
        await actions.setGigStatusAction(id, status)
        await refresh()
      },
      setMemberPayment: async (gigId, rowId, status, paymentDate, paymentMethod) => {
        await actions.setMemberPaymentAction(gigId, rowId, status, paymentDate, paymentMethod)
        await refresh()
      },
      setCrewPayment: async (gigId, rowId, status, paymentDate, paymentMethod) => {
        await actions.setCrewPaymentAction(gigId, rowId, status, paymentDate, paymentMethod)
        await refresh()
      },
      saveMember: async (m) => {
        await actions.saveMemberAction({
          id: m.id,
          name: m.name,
          role: m.role,
          defaultSplit: m.defaultSplit,
          active: m.active,
          account: m.account,
        })
        await refresh()
      },
      deleteMember: async (id) => {
        await actions.deleteMemberAction(id)
        await refresh()
      },
      saveCrew: async (c) => {
        await actions.saveCrewAction({
          id: c.id,
          name: c.name,
          role: c.role,
          roleType: c.roleType,
          defaultFee: c.defaultFee,
          minFee: c.minFee,
          maxFee: c.maxFee,
          mealEligible: c.mealEligible,
          active: c.active,
        })
        await refresh()
      },
      deleteCrew: async (id) => {
        await actions.deleteCrewAction(id)
        await refresh()
      },
      saveSettings: async (s) => {
        await actions.saveSettingsAction(s)
        await refresh()
      },
    }),
    [data, loading, error, refresh],
  )

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}
