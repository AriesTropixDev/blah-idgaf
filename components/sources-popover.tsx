"use client"

import { useState, useEffect } from "react"
import { Plus, Check } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { cn } from "@/lib/utils"

const SOURCES = [
  "YTS",
  "EZTV",
  "RARBG",
  "1337x",
  "ThePirateBay",
  "KickassTorrents",
  "TorrentGalaxy",
  "MagnetDL",
  "HorribleSubs",
  "NyaaSi",
  "TokyoTosho",
  "AniDex",
  "Rutor",
  "Rutracker",
  "Comando",
  "BluDV",
  "Torrent9",
  "ilCorSaRoNeRo",
  "MejorTorrent",
  "Wolfmax4k",
  "Cinecalidad",
  "BestTorrents",
  "UnionCrax",
  "FitGirl Repacks",
  "Dodi-Repacks",
  "PiratesGameLibrary",
]

function emitFiltersChanged(filters: string[], mode: "include" | "exclude") {
  try {
    window.dispatchEvent(new CustomEvent("voyage:filters-changed", { detail: { filters, mode } }))
  } catch {}
}

export default function SourcesPopover() {
  const [open, setOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useLocalStorage<string[]>("voyage-active-filters", [])
  const [filterMode, setFilterMode] = useLocalStorage<"include" | "exclude">("voyage-filter-mode", "include")

  useEffect(() => {
    emitFiltersChanged(activeFilters, filterMode)
  }, [activeFilters, filterMode])

  const toggleFilter = (source: string) => {
    setActiveFilters((prev) => {
      const next = prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
      return next
    })
  }

  const toggleFilterMode = () => {
    setFilterMode((prev) => (prev === "include" ? "exclude" : "include"))
  }

  const clearFilters = () => {
    setActiveFilters([])
  }

  const activeCount = activeFilters.length

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-2 rounded-full border-zinc-800 bg-black/60 px-3 py-1.5 text-xs text-zinc-100 hover:bg-zinc-900"
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">our sources</span>
          <span className="xs:hidden">sources</span>
          {activeCount > 0 && (
            <Badge
              variant="secondary"
              className="ml-1 rounded-full border-0 bg-zinc-800 px-1.5 py-0 text-[10px] text-zinc-300"
            >
              {activeCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      {/* Clamp popover width on small screens to avoid overflow */}
      <PopoverContent
        align="center"
        side="bottom"
        className="w-[min(420px,92vw)] border-zinc-800 bg-zinc-950 text-zinc-200"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFilterMode}
              className="h-7 border-zinc-800 bg-zinc-900/50 px-2 text-xs text-zinc-300 hover:bg-zinc-800"
            >
              {filterMode === "include" ? "Include selected" : "Exclude selected"}
            </Button>
            {activeCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 text-xs text-zinc-400 hover:text-zinc-200"
              >
                Clear
              </Button>
            )}
          </div>
          <Badge variant="outline" className="border-zinc-800 text-[10px] text-zinc-400">
            {activeCount} selected
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SOURCES.map((s) => {
            const isActive = activeFilters.includes(s)
            return (
              <button
                key={s}
                onClick={() => toggleFilter(s)}
                className={cn(
                  "group flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] transition",
                  isActive
                    ? "border-zinc-600 bg-zinc-800/80 text-zinc-100"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50 hover:text-zinc-200",
                )}
              >
                <span
                  className={cn(
                    "flex h-3 w-3 items-center justify-center rounded-sm border transition",
                    isActive
                      ? "border-zinc-500 bg-zinc-700 text-zinc-100"
                      : "border-zinc-700 bg-zinc-800 text-transparent group-hover:border-zinc-600",
                  )}
                >
                  {isActive && <Check className="h-2 w-2" />}
                </span>
                {s}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-zinc-400">
          Voyage is not affiliated with any of the services listed above.
        </p>
      </PopoverContent>
    </Popover>
  )
}
