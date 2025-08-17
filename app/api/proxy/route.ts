import { NextResponse } from "next/server"

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"])
const PASSTHROUGH_HEADERS = [
  "content-type",
  "content-length",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
  "cache-control",
]

function inferContentType(url: string): string {
  const u = url.toLowerCase()
  if (u.endsWith(".mp4")) return "video/mp4"
  if (u.endsWith(".webm")) return "video/webm"
  if (u.endsWith(".m4v")) return "video/x-m4v"
  if (u.endsWith(".mp3")) return "audio/mpeg"
  if (u.endsWith(".aac")) return "audio/aac"
  if (u.endsWith(".ogg") || u.endsWith(".oga")) return "audio/ogg"
  return "application/octet-stream"
}

function getClientIp(req: Request) {
  const xf = req.headers.get("x-forwarded-for") || ""
  return xf.split(",")[0].trim() || "unknown"
}

async function proxy(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get("url") || ""
  if (!url) {
    return NextResponse.json({ error: "missing_url" }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 })
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return NextResponse.json({ error: "unsupported_protocol" }, { status: 400 })
  }

  // Forward range and user-agent for better compatibility
  const range = req.headers.get("range") || undefined
  const ua = req.headers.get("user-agent") || "Mozilla/5.0 (compatible; VoyageProxy/1.0; +https://example.com)"

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout

  try {
    const upstream = await fetch(url, {
      method: "GET",
      headers: {
        ...(range ? { Range: range } : {}),
        "User-Agent": ua,
      },
      redirect: "follow",
      signal: controller.signal,
    })

    const headers = new Headers()
    const contentType = upstream.headers.get("content-type") || inferContentType(url)
    headers.set("Content-Type", contentType)
    for (const h of PASSTHROUGH_HEADERS) {
      const v = upstream.headers.get(h)
      if (v) headers.set(h, v)
    }

    // CORS: allow GET for media playback
    headers.set("Access-Control-Allow-Origin", "*")
    headers.set("Accept-Ranges", upstream.headers.get("accept-ranges") || "bytes")

    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers,
    })
  } catch (e: any) {
    const ip = getClientIp(req)
    const detail = e?.name === "AbortError" ? "upstream_timeout" : "upstream_fetch_failed"
    return NextResponse.json(
      {
        error: "proxy_error",
        detail,
        message:
          detail === "upstream_timeout" ? "Upstream timed out. Try again later." : "Failed to fetch upstream content.",
        ip,
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET(req: Request) {
  return proxy(req)
}

export async function HEAD(req: Request) {
  // Perform a HEAD-like behavior by issuing GET but discarding body:
  const res = await proxy(req)
  return new Response(null, { status: res.status, headers: res.headers })
}
