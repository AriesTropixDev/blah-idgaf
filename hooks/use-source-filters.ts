"use client"

import { useCallback, useEffect, useState } from "react"

export type FilterMode = "include" | "exclude"

export function useSourceFilters() {
  const [filters, setFilters] = useState<string[]>([])
  const [mode, setMode] = useState<FilterMode>("include")

  // Load once
  useEffect(() => {
    try {
      const f = JSON.parse(localStorage.getItem("voyage-active-filters") || "[]")
      const m = (localStorage.getItem("voyage-filter-mode") as FilterMode) || "include"
      setFilters(Array.isArray(f) ? f : [])
      setMode(m === "exclude" ? "exclude" : "include")
    } catch {}
  }, [])

  // Listen to changes from SourcesPopover or other tabs
  useEffect(() => {
    const onCustom = (e: Event) => {
      try {
        const ce = e as CustomEvent
        if (ce?.detail) {
          if (Array.isArray(ce.detail.filters)) setFilters(ce.detail.filters)
          if (ce.detail.mode === "include" || ce.detail.mode === "exclude") setMode(ce.detail.mode)
        }
      } catch {}
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === "voyage-active-filters" || e.key === "voyage-filter-mode") {
        try {
          const f = JSON.parse(localStorage.getItem("voyage-active-filters") || "[]")
          const m = (localStorage.getItem("voyage-filter-mode") as FilterMode) || "include"
          setFilters(Array.isArray(f) ? f : [])
          setMode(m === "exclude" ? "exclude" : "include")
        } catch {}
      }
    }
    window.addEventListener("voyage:filters-changed", onCustom as EventListener)
    window.addEventListener("storage", onStorage)
    return () => {
      window.removeEventListener("voyage:filters-changed", onCustom as EventListener)
      window.removeEventListener("storage", onStorage)
    }
  }, [])

  const clearFilters = useCallback(() => {
    try {
      localStorage.setItem("voyage-active-filters", JSON.stringify([]))
      const ev = new CustomEvent("voyage:filters-changed", { detail: { filters: [], mode } })
      window.dispatchEvent(ev)
      setFilters([])
    } catch {}
  }, [mode])

  return { filters, mode, clearFilters }
}
