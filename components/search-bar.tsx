"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import Image from "next/image"
import { Search, Clock, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"

type Variant = "hero" | "compact"
const MAX_RECENT_SEARCHES = 5

export default function SearchBar(props: { variant?: Variant; initialQuery?: string }) {
  const { variant = "hero", initialQuery = "" } = props
  const [q, setQ] = useState(initialQuery)
  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>("voyage-recent-searches", [])
  const [showRecent, setShowRecent] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const recentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => setQ(initialQuery), [initialQuery])

  // Global shortcuts and recent list keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isModK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"
      const isSlash = !e.ctrlKey && !e.metaKey && e.key === "/"
      if ((isModK || isSlash) && document.activeElement !== inputRef.current) {
        e.preventDefault()
        inputRef.current?.focus()
        return
      }
      if (showRecent) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setSelectedIndex((prev) => Math.min(prev + 1, recentSearches.length - 1))
        } else if (e.key === "ArrowUp") {
          e.preventDefault()
          setSelectedIndex((prev) => Math.max(prev - 1, -1))
        } else if (e.key === "Enter" && selectedIndex >= 0) {
          e.preventDefault()
          const selected = recentSearches[selectedIndex]
          if (selected) {
            setQ(selected)
            submitSearch(selected)
            setShowRecent(false)
          }
        } else if (e.key === "Escape") {
          e.preventDefault()
          setShowRecent(false)
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [showRecent, recentSearches, selectedIndex])

  // Close recent on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        recentRef.current &&
        !recentRef.current.contains(e.target as Node) &&
        inputRef.current !== e.target &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setShowRecent(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const submitSearch = useCallback(
    (query: string = q) => {
      const trimmed = query.trim()
      if (!trimmed) return
      setRecentSearches((prev) => {
        const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())
        return [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES)
      })
      setShowRecent(false)
      setSelectedIndex(-1)
      router.push(`/search?q=${encodeURIComponent(trimmed)}`)
    },
    [q, router, setRecentSearches],
  )

  const layoutClasses = useMemo(() => (variant === "hero" ? "w-full" : "flex items-center gap-3"), [variant])

  return (
    <div className={layoutClasses}>
      {variant === "compact" && <Image src="/logo.png" alt="Voyage logo" width={40} height={40} className="invert" />}
      <form
        className="relative w-full"
        onSubmit={(e) => {
          e.preventDefault()
          submitSearch()
        }}
      >
        <Input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setShowRecent(true)}
          placeholder="Explore anything..."
          className="w-full border-zinc-800 bg-zinc-900/40 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
        />
        <Button
          type="submit"
          size="sm"
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
        >
          <Search className="mr-1.5 h-4 w-4" />
          Search
        </Button>

        {showRecent && recentSearches.length > 0 && (
          <div
            ref={recentRef}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded-md border border-zinc-800 bg-zinc-950 py-1 shadow-lg"
          >
            <div className="flex items-center justify-between px-3 py-1.5 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Recent searches
              </span>
              <button
                onClick={() => {
                  setRecentSearches([])
                  setShowRecent(false)
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300"
                aria-label="Clear recent searches"
              >
                Clear all
              </button>
            </div>
            <ul>
              {recentSearches.map((search, index) => (
                <li
                  key={index}
                  data-index={index}
                  className={`group flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
                    selectedIndex === index ? "bg-zinc-800 text-zinc-100" : "text-zinc-300 hover:bg-zinc-900"
                  }`}
                  onClick={() => {
                    setQ(search)
                    submitSearch(search)
                    setShowRecent(false)
                  }}
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-3.5 w-3.5 text-zinc-500" />
                    {search}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setRecentSearches(recentSearches.filter((_, i) => i !== index))
                    }}
                    className="opacity-0 transition group-hover:opacity-100"
                    aria-label={`Remove ${search} from recent searches`}
                  >
                    <X className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>
    </div>
  )
}
