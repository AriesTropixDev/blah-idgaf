import { ImageResponse } from "next/og"

// Force Edge runtime to avoid Node.js URL resolution issues
export const runtime = "edge"

// Image metadata
export const alt = "Voyage Search Results"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams?.q || "Explore anything"

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "black",
        color: "white",
        fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: 40,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            background: "linear-gradient(180deg, #3f3f46, #18181b)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#d4d4d8",
            fontSize: 48,
          }}
        >
          ⛵
        </div>
        <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: -1 }}>Voyage</div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 32px",
          background: "rgb(24 24 27 / 0.7)",
          borderRadius: 16,
          border: "1px solid rgb(39 39 42)",
          maxWidth: "80%",
        }}
      >
        <div style={{ fontSize: 32, fontWeight: 500, textAlign: "center" }}>"{query}"</div>
      </div>
    </div>,
    { ...size },
  )
}
