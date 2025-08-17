import { ImageResponse } from "next/og"

// Force Edge runtime to avoid Node.js URL resolution issues
export const runtime = "edge"

// Image metadata for the whole app route (root)
export const alt = "Voyage — Explore anything"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "black",
        color: "white",
        fontSize: 72,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 28,
          padding: "48px 64px",
          borderRadius: 24,
          background: "rgb(24 24 27 / 0.7)",
          border: "1px solid rgb(39 39 42)",
        }}
      >
        {/* Simple ship glyph substitute */}
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 16,
            background: "linear-gradient(180deg, #3f3f46, #18181b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#d4d4d8",
            fontSize: 72,
          }}
        >
          ⛵
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: 700, letterSpacing: -1 }}>Voyage</div>
          <div style={{ fontSize: 28, color: "#a1a1aa", marginTop: 6 }}>Explore anything</div>
        </div>
      </div>
    </div>,
    { ...size },
  )
}
