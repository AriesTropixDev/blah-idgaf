import Image from "next/image"
import Link from "next/link"
import SourcesPopover from "@/components/sources-popover"
import SearchBar from "@/components/search-bar"
import ModeToggle from "@/components/mode-toggle"
import SiteFooter from "@/components/site-footer"
import InvertStyles from "@/components/invert-styles"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Voyage — Explore anything",
  description: "A minimal, fast, search interface for movies and games. Press / or ⌘K to focus the search.",
  openGraph: {
    title: "Voyage — Explore anything",
    description: "A minimal, fast, search interface for movies and games.",
    url: "https://fisher.voyage", // optional placeholder
    siteName: "Voyage",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voyage — Explore anything",
    description: "A minimal, fast, search interface for movies and games.",
  },
}

export default function Page() {
  return (
    <main className="relative min-h-screen bg-black text-zinc-100">
      {/* White-mode inversion styles */}
      <InvertStyles />

      {/* Fixed header with responsive layout */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-900/60 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
        <div className="container mx-auto max-w-5xl px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="shrink-0">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-black/60 px-2.5 py-1.5 text-sm text-zinc-100 transition hover:bg-zinc-900"
              >
                <Image src="/logo.png" alt="Voyage home" width={20} height={20} className="invert" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex justify-center">
                <SourcesPopover />
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Link
                href="/disclaimer"
                className="rounded-md border border-zinc-800 bg-black/60 px-2.5 py-1.5 text-sm text-zinc-100 transition hover:bg-zinc-900"
              >
                <span className="hidden sm:inline">Disclaimer</span>
                <span className="sm:hidden">Disc.</span>
              </Link>
              <Link
                href="https://discord.gg/K5rBfCaK59"
                className="rounded-md border border-zinc-800 bg-black/60 px-2.5 py-1.5 text-sm text-zinc-100 transition hover:bg-zinc-900"
              >
                <span className="hidden sm:inline">Discord</span>
                <span className="sm:hidden">Disc.</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Background accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-28 h-64 w-64 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
      </div>

      {/* Hero search */}
      <section className="container mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4">
        <div className="mt-24 mb-8">
          <Image src="/logo.png" alt="Voyage logo" width={200} height={200} className="invert" priority />
        </div>

        <SearchBar variant="hero" />

        <p className="mt-4 text-center text-xs text-zinc-400">
          Press Enter to search • Press / or ⌘K to focus • Stay safe and comply with your local laws.
        </p>
      </section>

      <SiteFooter />
      <ModeToggle />
    </main>
  )
}
