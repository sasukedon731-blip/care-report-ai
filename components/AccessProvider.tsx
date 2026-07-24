"use client"

import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useAuth } from "./AuthProvider"

type AccessState = {
  active: boolean
  planId: string | null
  periodEnd: string | null
  usedToday: number
  remainingToday: number
}

type AccessContextValue = AccessState & {
  loading: boolean
  refresh: () => Promise<void>
}

const empty: AccessState = {
  active: false,
  planId: null,
  periodEnd: null,
  usedToday: 0,
  remainingToday: 0,
}

const AccessContext = createContext<AccessContextValue>({
  ...empty,
  loading: true,
  refresh: async () => undefined,
})

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<AccessState>(empty)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!user) {
      setState(empty)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const idToken = await user.getIdToken()
      const response = await fetch("/api/account/status", {
        headers: { Authorization: `Bearer ${idToken}` },
        cache: "no-store",
      })
      if (!response.ok) throw new Error("status")
      setState(await response.json())
    } catch {
      setState(empty)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!authLoading) void refresh()
  }, [authLoading, refresh])

  const value = useMemo(() => ({ ...state, loading, refresh }), [state, loading, refresh])
  return <AccessContext.Provider value={value}>{children}</AccessContext.Provider>
}

export function useAccess() {
  return useContext(AccessContext)
}
