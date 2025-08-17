import { NextResponse } from "next/server"

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

type TvEpisode = {
  imdb_id: string
  season: string
  episode: string
  torrents: Torrent[]
}

const BASE = "https://71502948493498359440385256505013.netlify.app"

function safeSplit(s: string | undefined, sep: string, i: number) {
  if (!s) return ""
  const parts = s.split(sep)
  return parts[i] ?? ""
}

function parseStreamsToTorrents(streams: any[]): Torrent[] {
  const items: Torrent[] = []
  for (const st of streams ?? []) {
    try {
      const lines = String(st.title ?? "")
        .split("\n")
        .map((x: string) => x.trim())
        .filter(Boolean)

      let trackers = ""
      if (Array.isArray(st.sources)) {
        for (const src of st.sources) {
          const s = String(src)
          if (s.startsWith("tracker:")) trackers += s.replace("tracker:", "&tr=")
          else if (s.startsWith("dht:")) trackers += s.replace("dht:", "&dht=")
        }
      }

      // Figure out which line carries meta (works for movie and TV formats)
      const metaLineIdx = lines[1] && lines[1].includes("⚙️") ? 1 : lines[2] ? 2 : 1
      const name = lines[0] ?? "Unknown"
      const peers = safeSplit(lines[metaLineIdx], " ", 1) || "0"
      const size = `${safeSplit(lines[metaLineIdx], " ", 3)}${safeSplit(lines[metaLineIdx], " ", 4)}`
      const source = safeSplit(lines[metaLineIdx], "⚙️ ", 1) || "unknown"
      const infoHash = String(st.infoHash ?? "").trim()
      const magnet = infoHash ? `magnet:?xt=urn:btih:${infoHash}${trackers}` : ""

      items.push({ name, peers, size, source, trackers, magnet })
    } catch {
      // skip malformed entry
    }
  }
  return items
}

function steamHeaderFromStore(url?: string) {
  if (!url) return ""
  const m = url.match(/\/app\/(\d+)/)
  return m ? `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${m[1]}/header.jpg` : ""
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get("q") || "").trim()

  // Optional TV episode parameters
  const tvImdb = (searchParams.get("imdb") || "").trim()
  const season = (searchParams.get("season") || "").trim()
  const episode = (searchParams.get("episode") || "").trim()
  const wantsTv = !!(tvImdb && season && episode)

  try {
    // Movies
    let movies: Movie[] = []
    if (q) {
      const searchRes = await fetch(`${BASE}/torrents_proxy_scraper_search/movie/${encodeURIComponent(q)}`, {
        cache: "no-store",
      })
      const searchJson = await searchRes.json()
      const rawResults: any[] = Array.isArray(searchJson?.results) ? searchJson.results : []

      movies = await Promise.all(
        rawResults.map(async (item: any) => {
          try {
            const extRes = await fetch(`${BASE}/torrents_proxy_scraper_external_id/movie/${item.id}`, {
              cache: "no-store",
            })
            const extJson = await extRes.json()
            const imdb = String(extJson?.imdb_id ?? "").trim()

            let torrents: Torrent[] = []
            if (imdb) {
              const tRes = await fetch(`${BASE}/torrents_proxy_scraper/${imdb}.json`, { cache: "no-store" })
              const tJson = await tRes.json()
              torrents = parseStreamsToTorrents(Array.isArray(tJson?.streams) ? tJson.streams : [])
            }

            return {
              title: String(item.title ?? "Untitled"),
              poster: `https://image.tmdb.org/t/p/w500${item.poster_path ?? ""}`,
              imdb_id: imdb,
              torrents,
            }
          } catch {
            return {
              title: String(item.title ?? "Untitled"),
              poster: `https://image.tmdb.org/t/p/w500${item.poster_path ?? ""}`,
              imdb_id: "",
              torrents: [],
            }
          }
        }),
      )
    }

    // Games
    let games: Game[] = []
    if (q) {
      const gamesRes = await fetch("https://be-antwerp-po-db.pages.dev/db.json", { cache: "no-store" })
      const gamesJson = await gamesRes.json()
      games = (Array.isArray(gamesJson) ? gamesJson : [])
        .filter((g: any) =>
          String(g?.name ?? "")
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
        .map((g: any) => {
          const appid = String(g?.appid ?? "").trim()
          const poster =
            String(g?.image ?? "") ||
            String(g?.splash ?? "") ||
            (Array.isArray(g?.screenshots) && g.screenshots[0] ? String(g.screenshots[0]) : "") ||
            steamHeaderFromStore(String(g?.store ?? "")) ||
            ""
          return {
            name: String(g.name ?? "Unknown"),
            description: String(g.description ?? ""),
            source: `UnionCrax - ${String(g.source ?? "unknown")}`,
            version: String(g.version ?? ""),
            link: appid ? `https://union-crax.xyz/game/${appid}` : String(g.link ?? "#"),
            poster,
          }
        })
    }

    // TV episode
    let tv: TvEpisode | null = null
    if (wantsTv) {
      try {
        const tvRes = await fetch(`${BASE}/torrents_proxy_scraper/${tvImdb}:${season}:${episode}.json`, {
          cache: "no-store",
        })
        if (tvRes.ok) {
          const tvJson = await tvRes.json()
          const torrents = parseStreamsToTorrents(Array.isArray(tvJson?.streams) ? tvJson.streams : [])
          tv = {
            imdb_id: tvImdb,
            season,
            episode,
            torrents,
          }
        } else {
          tv = { imdb_id: tvImdb, season, episode, torrents: [] }
        }
      } catch {
        tv = { imdb_id: tvImdb, season, episode, torrents: [] }
      }
    }

    return NextResponse.json(
      { query: q, movies, games, tv },
      {
        headers: { "Cache-Control": "no-store" },
      },
    )
  } catch (e) {
    return NextResponse.json({ query: q, movies: [], games: [], tv: null, error: "search_failed" }, { status: 500 })
  }
}
