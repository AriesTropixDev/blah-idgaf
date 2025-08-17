import Image from "next/image"
import Link from "next/link"
import SourcesPopover from "@/components/sources-popover"
import SearchBar from "@/components/search-bar"
import ModeToggle from "@/components/mode-toggle"
import SearchResults from "@/components/search-results"
import SiteFooter from "@/components/site-footer"
import InvertStyles from "@/components/invert-styles"
import type { Metadata } from "next"

export function generateMetadata({ searchParams }: { searchParams: { q?: string } }): Metadata {
  const q = (searchParams?.q ?? "").toString().trim()
  const baseTitle = "Voyage"
  const title = q ? `Search: ${q} — ${baseTitle}` : baseTitle
  const description = q ? `Results for "${q}" on Voyage.` : "Search movies and games on Voyage."
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description, card: "summary_large_image" },
  }
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string }
}) {
  const q = (searchParams?.q ?? "").toString()

  return (
    <main className="relative min-h-screen bg-black text-zinc-100">
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

            <div className="shrink-0">
              <Link
                href="https://discord.gg/K5rBfCaK59"
                className="inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-black/60 px-2.5 py-1.5 text-sm text-zinc-100 transition hover:bg-zinc-900"
              >
                <span className="hidden sm:inline">Discord</span>
                <span className="sm:hidden">Disc.</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto max-w-5xl px-4 pt-28">
        <div className="mt-2">
          <SearchBar variant="compact" initialQuery={q} />
        </div>

        <div className="mx-auto mt-8 max-w-4xl">
          <SearchResults q={q} />
        </div>
      </section>

      <div className="mt-16 pb-20">
        <SiteFooter />
      </div>
      <ModeToggle />
    </main>
  )
}
