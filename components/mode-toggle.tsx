"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

function getInitial() {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem("voyage-light") === "1"
  } catch {
    return false
  }
}

export default function ModeToggle() {
  const [light, setLight] = useState<boolean>(getInitial)

  // Persist preference
  useEffect(() => {
    try {
      localStorage.setItem("voyage-light", light ? "1" : "0")
    } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("voyage:lightmode", { detail: { light } }))
    }
  }, [light])

  // Toggle root class for inversion
  useEffect(() => {
    if (typeof document === "undefined") return
    const root = document.documentElement
    if (light) root.classList.add("voyage-invert")
    else root.classList.remove("voyage-invert")
  }, [light])

  return (
    <button
      onClick={() => setLight((v) => !v)}
      className="fixed bottom-5 left-5 z-50 flex items-center gap-4 rounded-full border border-zinc-800 bg-black/70 px-4 py-3 text-zinc-100 shadow-md transition hover:bg-zinc-900"
      aria-label="Toggle white mode"
      title={light ? "Switch to dark" : "Switch to white"}
    >
      <div className="relative h-7 w-24">
        <div className="absolute inset-0 rounded-full bg-zinc-900/70" />
        <div
          className={`absolute top-1/2 h-7 w-7 -translate-y-1/2 rounded-full bg-zinc-700 transition-[left] ${
            light ? "left-[58px]" : "left-[6px]"
          }`}
        />
        <Sun className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-200" />
        <Moon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-200" />
      </div>
    </button>
  )
}
