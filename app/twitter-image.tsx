import { ImageResponse } from "next/og"

// Force Edge runtime to avoid Node.js URL resolution issues
export const runtime = "edge"

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
        fontSize: 64,
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
      }}
    >
      <div
        style={{
          padding: "40px 56px",
          borderRadius: 24,
          background: "rgb(24 24 27 / 0.7)",
          border: "1px solid rgb(39 39 42)",
          display: "flex",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 16,
            background: "linear-gradient(180deg, #3f3f46, #18181b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#d4d4d8",
            fontSize: 60,
          }}
        >
          ⛵
        </div>
        <div>
          <div style={{ fontWeight: 700, letterSpacing: -1 }}>Voyage</div>
          <div style={{ fontSize: 26, color: "#a1a1aa", marginTop: 6 }}>Explore anything</div>
        </div>
      </div>
    </div>,
    { ...size },
  )
}
