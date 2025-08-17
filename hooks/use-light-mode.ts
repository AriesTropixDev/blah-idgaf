"use client"

import { useEffect, useState } from "react"

/**
 * Returns true when light mode is active.
 * Syncs across:
 * - localStorage("voyage-light")
 * - documentElement class "voyage-invert"
 * - custom event "voyage:lightmode"
 */
export function useLightMode(): boolean {
  const [light, setLight] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    try {
      return localStorage.getItem("voyage-light") === "1"
    } catch {
      return false
    }
  })

  useEffect(() => {
    const updateFromDom = () => {
      if (typeof document === "undefined") return
      const isLight = document.documentElement.classList.contains("voyage-invert")
      setLight(isLight)
    }

    // Initial sync with DOM class
    updateFromDom()

    // Cross-tab storage sync
    const onStorage = (e: StorageEvent) => {
      if (e.key === "voyage-light") {
        setLight(e.newValue === "1")
      }
    }

    // Custom event from ModeToggle
    const onCustom = (e: Event) => {
      const ce = e as CustomEvent<{ light: boolean }>
      if (ce?.detail && typeof ce.detail.light === "boolean") {
        setLight(ce.detail.light)
      } else {
        updateFromDom()
      }
    }

    // Observe root class changes as a fallback
    const mo = new MutationObserver(updateFromDom)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    window.addEventListener("storage", onStorage)
    window.addEventListener("voyage:lightmode", onCustom as EventListener)

    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("voyage:lightmode", onCustom as EventListener)
      mo.disconnect()
    }
  }, [])

  return light
}
