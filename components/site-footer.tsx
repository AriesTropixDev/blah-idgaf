"use client"

import Image from "next/image"
import { useLightMode } from "@/hooks/use-light-mode"

export default function SiteFooter() {
  const light = useLightMode()
  const mascotSrc = light ? "/images/whitemode.png" : "/images/darkmode.png"

  return (
    <footer className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center">
      <div className="pointer-events-auto flex flex-col items-center gap-2">
        {/* Mascot above the pill, no box/border */}
        <Image
          src={mascotSrc || "/placeholder.svg"}
          alt="Voyage mascot"
          width={88}
          height={88}
          className="h-[88px] w-[88px] select-none"
          priority
        />

        {/* Signature pill */}
        <div className="rounded-full bg-zinc-950/70 px-3 py-1 text-xs text-zinc-400">
          designed with {"\u{1F90D}"} by Lou
        </div>
      </div>
    </footer>
  )
}
