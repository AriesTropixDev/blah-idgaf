import { NextResponse } from "next/server"

// Simple in-memory rate limiter (per session/container)
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const RATE_LIMIT_MAX = 20 // requests per window
const ipHits = new Map<string, number[]>()

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for") || ""
  return xf.split(",")[0].trim() || "unknown"
}

function allowRate(req: Request) {
  const ip = getClientIp(req)
  const now = Date.now()
  const arr = ipHits.get(ip) || []
  const filtered = arr.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (filtered.length >= RATE_LIMIT_MAX) {
    return { ok: false, ip }
  }
  filtered.push(now)
  ipHits.set(ip, filtered)
  return { ok: true, ip }
}

function extractYouTubeId(urlOrId: string): string | null {
  // Accept raw ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId
  try {
    const u = new URL(urlOrId)
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v")
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.split("/").filter(Boolean)[0]
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id
    }
    return null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  const rate = allowRate(req)
  if (!rate.ok) {
    return NextResponse.json(
      { error: "rate_limited", message: "Too many requests. Try again later." },
      { status: 429, headers: { "Retry-After": "120" } },
    )
  }

  const { searchParams } = new URL(req.url)
  const provider = (searchParams.get("provider") || "invidious").toLowerCase()
  const idOrUrl = searchParams.get("id") || searchParams.get("url") || ""
  if (!idOrUrl) {
    return NextResponse.json({ error: "missing_id_or_url" }, { status: 400 })
  }

  const videoId = extractYouTubeId(idOrUrl)
  if (!videoId) {
    return NextResponse.json({ error: "invalid_youtube_id_or_url" }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10s

  try {
    if (provider === "cobalt") {
      // Forward to Cobalt-like API expecting JSON body { url: "https://youtube.com/watch?v=..." }
      const upstream = await fetch("https://voyage-api-cobalt.slidemovies.org", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` }),
        signal: controller.signal,
      })
      const text = await upstream.text()
      return new Response(text, {
        status: upstream.status,
        headers: {
          "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
          "Cache-Control": "no-store",
        },
      })
    }

    // Default: Invidious JSON
    const inv = await fetch(`https://invidious.nikkosphere.com/api/v1/videos/${videoId}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    })
    if (!inv.ok) {
      return NextResponse.json({ error: "upstream_error", status: inv.status }, { status: 502 })
    }
    const data = await inv.json()

    const muxed = (data?.formatStreams || []).map((s: any) => ({
      type: "muxed",
      url: s?.url || "",
      itag: s?.itag,
      qualityLabel: s?.qualityLabel || s?.label,
      mimeType: s?.type || s?.mimeType,
      bitrate: s?.bitrate,
      size: s?.size,
    }))
    const video = (data?.adaptiveFormats || [])
      .filter((s: any) => (s?.type || s?.mimeType || "").startsWith("video/"))
      .map((s: any) => ({
        type: "video",
        url: s?.url || "",
        itag: s?.itag,
        qualityLabel: s?.qualityLabel || s?.label,
        mimeType: s?.type || s?.mimeType,
        bitrate: s?.bitrate,
        size: s?.size,
      }))
    const audio = (data?.adaptiveFormats || [])
      .filter((s: any) => (s?.type || s?.mimeType || "").startsWith("audio/"))
      .map((s: any) => ({
        type: "audio",
        url: s?.url || "",
        itag: s?.itag,
        mimeType: s?.type || s?.mimeType,
        bitrate: s?.bitrate,
        size: s?.size,
      }))

    return NextResponse.json(
      {
        provider: "invidious",
        id: videoId,
        title: data?.title || null,
        author: data?.author || null,
        lengthSeconds: data?.lengthSeconds || null,
        streams: [...muxed, ...video, ...audio],
      },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (e: any) {
    const detail = e?.name === "AbortError" ? "timeout" : "upstream_failed"
    return NextResponse.json({ error: "ytdl_error", detail }, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}
