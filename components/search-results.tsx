"use client"

import type React from "react"

import { useEffect, useMemo, useState, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Magnet, Loader2, HelpCircle, ChevronDown, ChevronUp, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useSourceFilters } from "@/hooks/use-source-filters"

type Torrent = {
  name: string
  peers: string
  size: string
  source: string
  trackers: string
  magnet: string
}

type Movie = {
  title: string
  poster: string
  imdb_id: string
  torrents: Torrent[]
}

type Game = {
  name: string
  description: string
  source: string
  version: string
  link: string
  poster: string
}

type SearchPayload = {
  query: string
  movies: Movie[]
  games: Game[]
  tv?: {
    imdb_id: string
    season: string
    episode: string
    torrents: Torrent[]
  } | null
}

export default function SearchResults({ q }: { q: string }) {
  const [data, setData] = useState<SearchPayload | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedMovies, setExpandedMovies] = useState<Record<string, boolean>>({})
  const [focusedItem, setFocusedItem] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const { filters, mode, clearFilters } = useSourceFilters()

  // Fetch search results
  useEffect(() => {
    let active = true
    async function run() {
      if (!q) return
      setLoading(true)
      setError(null)

      if (abortControllerRef.current) abortControllerRef.current.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`Request failed: ${res.status}`)
        const json = (await res.json()) as SearchPayload
        if (active) {
          setData(json)
          const autoExpand: Record<string, boolean> = {}
          json.movies.forEach((movie, idx) => {
            if (movie.torrents.length === 1) autoExpand[`${movie.imdb_id}-${idx}`] = true
          })
          setExpandedMovies(autoExpand)
        }
      } catch (e: any) {
        if (e.name !== "AbortError" && active) setError(e?.message || "Something went wrong")
      } finally {
        if (active) setLoading(false)
      }
    }
    run()
    return () => {
      active = false
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [q])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!resultsRef.current || !data) return
      const target = e.target as HTMLElement
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return

      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        const focusableElements = Array.from(
          resultsRef.current.querySelectorAll('[data-focusable="true"]'),
        ) as HTMLElement[]
        if (!focusableElements.length) return
        const currentIndex = focusedItem ? focusableElements.findIndex((el) => el.dataset.id === focusedItem) : -1
        const nextIndex =
          e.key === "ArrowDown"
            ? currentIndex < focusableElements.length - 1
              ? currentIndex + 1
              : 0
            : currentIndex > 0
              ? currentIndex - 1
              : focusableElements.length - 1
        const nextEl = focusableElements[nextIndex]
        if (nextEl) {
          nextEl.focus()
          setFocusedItem(nextEl.dataset.id || null)
          nextEl.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [data, focusedItem])

  // Filtering helpers
  const normalizedFilters = useMemo(() => filters.map((f) => f.trim().toLowerCase()), [filters])
  const matchSource = (source: string) => {
    if (normalizedFilters.length === 0) return true
    const s = (source || "").trim().toLowerCase()
    const listed = normalizedFilters.includes(s)
    return mode === "include" ? listed : !listed
  }

  // Apply filters to movies/torrents
  const filteredMovies = useMemo(() => {
    if (!data) return []
    return data.movies
      .map((m, idx) => {
        const t = (m.torrents || []).filter((tor) => matchSource(tor.source))
        return { ...m, torrents: t, _key: `${m.imdb_id}-${idx}` }
      })
      .filter((m) => m.torrents.length > 0)
  }, [data, normalizedFilters, mode])

  // Apply filters to games (treat games as from "UnionCrax" provider)
  const filteredGames = useMemo(() => {
    if (!data) return []
    const gameProvider = "unioncrax"
    const gameVisible = matchSource(gameProvider)
    return gameVisible ? data.games : []
  }, [data, normalizedFilters, mode])

  if (!q) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex items-center justify-center rounded-md border border-zinc-800 bg-zinc-900/30 p-8"
      >
        <p className="text-sm text-zinc-400">Type something above to start exploring.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div role="status" aria-live="polite" className="flex items-center justify-center gap-2 text-zinc-400">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p className="text-sm">Searching for "{q}"</p>
      </div>
    )
  }

  if (error) {
    return <div className="rounded-md border border-red-900/60 bg-red-950/30 p-4 text-red-200">Error: {error}</div>
  }

  if (!data) return null

  const hasMovieResults = data.movies.length > 0
  const hasFilteredMovieResults = filteredMovies.length > 0
  const hasGameResults = data.games.length > 0
  const hasFilteredGameResults = filteredGames.length > 0

  return (
    <div className="space-y-10" ref={resultsRef}>
      {/* Movies header with filter summary */}
      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">Movies</h2>
          <div className="flex flex-wrap items-center gap-2">
            {filters.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-300">
                <Filter className="h-3.5 w-3.5" />
                {mode === "include" ? "Including" : "Excluding"} {filters.length} source
                {filters.length !== 1 ? "s" : ""}
                <button
                  onClick={clearFilters}
                  className="rounded border border-zinc-700 px-1 py-0.5 text-[10px] text-zinc-200 hover:bg-zinc-800"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>

        {!hasMovieResults ? (
          <p className="text-sm text-zinc-400">No movies found.</p>
        ) : !hasFilteredMovieResults ? (
          <p className="text-sm text-zinc-400">
            No torrents match your current filters. Try clearing filters or choosing different providers.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredMovies.map((m) => {
              const movieId = (m as any)._key as string
              const isExpanded = !!expandedMovies[movieId]

              return (
                <div
                  key={movieId}
                  className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/60 transition hover:border-zinc-700"
                >
                  <div className="flex gap-4 p-4">
                    <img
                      src={m.poster || "/placeholder.svg"}
                      alt={m.title}
                      loading="lazy"
                      className="h-28 w-20 flex-none rounded-md border border-zinc-800 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-base font-medium text-zinc-100" title={m.title}>
                          {m.title}
                        </h3>
                        {m.imdb_id && (
                          <Badge className="border-zinc-800 bg-zinc-900/60 text-zinc-300" variant="secondary">
                            {m.imdb_id}
                          </Badge>
                        )}
                        <Badge className="border-zinc-800 bg-zinc-900/60 text-zinc-300" variant="secondary">
                          {m.torrents.length} torrents
                        </Badge>
                      </div>

                      {m.torrents.length > 0 ? (
                        <div className="mt-3">
                          <button
                            data-focusable="true"
                            data-id={`movie-${movieId}`}
                            onClick={() =>
                              setExpandedMovies((prev) => ({
                                ...prev,
                                [movieId]: !prev[movieId],
                              }))
                            }
                            className="flex w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-left text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                          >
                            <span>
                              {isExpanded ? "Hide" : "Show"} {m.torrents.length} torrent
                              {m.torrents.length !== 1 ? "s" : ""}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-zinc-400" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-zinc-400" />
                            )}
                          </button>

                          {isExpanded && (
                            <div className="mt-3">
                              <ul className="divide-y divide-zinc-800 rounded-md border border-zinc-800">
                                {m.torrents.map((t, i) => (
                                  <TorrentRow key={i} t={t} movieId={movieId} index={i} />
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-zinc-400">No torrents available.</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Games */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-100">Games</h2>
        {!hasGameResults ? (
          <p className="text-sm text-zinc-400">No games found.</p>
        ) : !hasFilteredGameResults ? (
          <p className="text-sm text-zinc-400">No games match your current filters.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filteredGames.map((g, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950/60 transition hover:border-zinc-700"
              >
                <div className="flex gap-4 p-4">
                  <img
                    src={g.poster || "/placeholder.svg?height=120&width=200&query=game%20cover%20placeholder"}
                    alt={g.name}
                    loading="lazy"
                    className="h-24 w-40 flex-none rounded-md border border-zinc-800 object-cover"
                    onError={(e) => {
                      const t = e.currentTarget
                      if (t.src.indexOf("/placeholder.svg") === -1) {
                        t.src = "/placeholder.svg?height=120&width=200"
                      }
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-base font-medium text-zinc-100" title={g.name}>
                        {g.name}
                      </h3>
                      <Badge className="border-zinc-800 bg-zinc-900/60 text-zinc-300">{g.version}</Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{g.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge className="border-zinc-800 bg-zinc-900/60 text-zinc-300">{g.source}</Badge>
                      <a
                        href={g.link}
                        target="_blank"
                        rel="noreferrer"
                        data-focusable="true"
                        data-id={`game-${i}`}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-100 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open on UnionCrax
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function TorrentRow({ t, movieId, index }: { t: Torrent; movieId: string; index: number }) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const magnet = (t.magnet || "").trim()

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(magnet)
      setCopied(true)
      toast({ title: "Magnet copied", description: "Paste into your torrent client." })
      setTimeout(() => setCopied(false), 1200)
    } catch {
      toast({
        variant: "destructive",
        title: "Copy failed",
        description: "Your browser blocked clipboard access. Select and copy the magnet manually.",
      })
    }
  }

  const handleMagnet = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!magnet) {
      e.preventDefault()
      toast({ variant: "destructive", title: "No magnet available", description: "Missing magnet link." })
      return
    }
    const started = Date.now()
    const timer = setTimeout(() => {
      const stillVisible = document.visibilityState === "visible"
      if (stillVisible && Date.now() - started >= 1200) {
        toast({
          variant: "destructive",
          title: "Could not open magnet link",
          description: "Install a torrent client and enable magnet links. If this persists, contact staff in Discord.",
          action: (
            <a
              href="https://discord.gg/K5rBfCaK59"
              target="_blank"
              rel="noreferrer"
              className="ml-3 inline-flex items-center rounded bg-zinc-800 px-2 py-1 text-xs text-zinc-100 hover:bg-zinc-700"
            >
              Open Discord
            </a>
          ) as any,
        })
        setHelpOpen(true)
      }
    }, 1200)

    try {
      const iframe = document.createElement("iframe")
      iframe.style.display = "none"
      iframe.src = magnet
      document.body.appendChild(iframe)
      setTimeout(() => {
        try {
          document.body.removeChild(iframe)
        } catch {}
      }, 2000)
    } catch {}

    const onHide = () => {
      clearTimeout(timer)
      document.removeEventListener("visibilitychange", onHide)
      window.removeEventListener("pagehide", onHide)
      window.removeEventListener("blur", onHide)
    }
    document.addEventListener("visibilitychange", onHide)
    window.addEventListener("pagehide", onHide)
    window.addEventListener("blur", onHide)
  }

  return (
    <li className="grid gap-2 px-3 py-3 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <p className="truncate text-sm text-zinc-100" title={t.name}>
          {t.name}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5 text-[11px] text-zinc-300">
          <Badge className="border-zinc-800 bg-zinc-900/60">Size: {t.size || "?"}</Badge>
          <Badge className="border-zinc-800 bg-zinc-900/60">Peers: {t.peers || "0"}</Badge>
          <Badge className="border-zinc-800 bg-zinc-900/60">Source: {t.source || "?"}</Badge>
        </div>
      </div>

      <div className="flex flex-none items-center gap-2">
        {magnet && (
          <div className="flex items-center gap-1">
            <a
              href={magnet}
              onClick={handleMagnet}
              data-focusable="true"
              data-id={`torrent-${movieId}-${index}`}
              className="group inline-flex items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900/60 px-2 py-1 text-xs text-zinc-100 transition hover:scale-[1.02] hover:bg-zinc-800 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            >
              <Magnet className="h-3.5 w-3.5 transition group-hover:rotate-6" />
              Magnet
            </a>

            <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
              <DialogTrigger asChild>
                <button
                  className="rounded-full p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
                  aria-label="Magnet link help"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md border-zinc-800 bg-zinc-950 text-zinc-100">
                <DialogHeader>
                  <DialogTitle>Using magnet links</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2 text-sm text-zinc-300">
                  <p>Install a torrent client (qBittorrent, Transmission, etc.) and enable magnet links in your OS.</p>
                  <ul className="list-inside list-disc space-y-1 text-zinc-400">
                    <li>Copy magnet and paste in your client if clicking doesn’t work</li>
                    <li>Allow your browser to open external apps for magnet: links</li>
                    <li>If your ISP blocks traffic, consider a VPN</li>
                  </ul>
                  <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-3">
                    <p className="text-xs">Still stuck? Join our Discord for help.</p>
                    <div className="mt-2">
                      <a
                        href="https://discord.gg/K5rBfCaK59"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-100 transition hover:bg-zinc-700"
                      >
                        Join Discord
                      </a>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          data-focusable="true"
          data-id={`copy-${movieId}-${index}`}
          aria-live="polite"
          className={`inline-flex items-center gap-1 border-zinc-800 bg-transparent text-xs transition-all duration-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-zinc-500`}
        >
          Copy
        </Button>
      </div>
    </li>
  )
}
