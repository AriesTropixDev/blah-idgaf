import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import type { Metadata } from "next"
import InvertStyles from "@/components/invert-styles"

export const metadata: Metadata = {
  title: "Disclaimer — Voyage",
  description: "Legal disclaimer and terms of use for Voyage.",
}

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen bg-black text-zinc-100">
      <InvertStyles />
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-sm text-zinc-100 transition hover:bg-zinc-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-6">
          <h1 className="mb-6 text-2xl font-bold">Disclaimer</h1>

          <div className="space-y-4 text-sm text-zinc-300">
            <p>
              Voyage is a search interface that aggregates results from various third-party sources. We do not host,
              store, or distribute any content. All search results are provided by external services.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-zinc-100">Terms of Use</h2>
            <p>
              By using Voyage, you agree to use it responsibly and in accordance with all applicable laws in your
              jurisdiction. Users are solely responsible for ensuring their actions comply with local copyright and
              intellectual property laws.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-zinc-100">No Liability</h2>
            <p>
              Voyage and its creators accept no liability for how users interact with search results or external
              services. We make no warranties regarding the accuracy, legality, or safety of content found through
              search results.
            </p>

            <h2 className="mt-6 text-lg font-semibold text-zinc-100">Copyright</h2>
            <p>
              If you believe your copyrighted work is accessible through Voyage in a way that constitutes copyright
              infringement, please contact us through our Discord server with details of the alleged infringement.
            </p>

            <div className="mt-8 rounded-md border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-center text-xs text-zinc-400">
                This disclaimer was last updated on August 9, 2025.
                <br />
                For questions or concerns, please{" "}
                <a
                  href="https://discord.gg/K5rBfCaK59"
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-300 underline hover:text-zinc-100"
                >
                  join our Discord
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
