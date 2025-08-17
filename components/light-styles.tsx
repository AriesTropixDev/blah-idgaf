"use client"

export default function LightStyles() {
  // Global CSS overrides for white mode. Uses !important to beat utility classes.
  const css = `
  .voyage-light body { background-color: #ffffff; color: #0a0a0a; color-scheme: light; }

  /* Keep images/logos normal in light mode (neutralize Tailwind's invert utility) */
  .voyage-light .invert { filter: none !important; }

  /* Accent blobs that use bg-white/5 on dark */
  .voyage-light .bg-white\/5 { background-color: rgba(0,0,0,0.04) !important; }

  /* Common dark bg classes remapped to light surfaces */
  .voyage-light .bg-black { background-color: #ffffff !important; }
  .voyage-light .bg-black\/60 { background-color: rgba(255,255,255,0.7) !important; }

  .voyage-light .bg-zinc-950 { background-color: #f9fafb !important; }
  .voyage-light .bg-zinc-950\/60 { background-color: rgba(249,250,251,0.7) !important; }
  .voyage-light .bg-zinc-900 { background-color: #f4f4f5 !important; }
  .voyage-light .bg-zinc-900\/60 { background-color: rgba(244,244,245,0.7) !important; }
  .voyage-light .bg-zinc-900\/50 { background-color: rgba(244,244,245,0.5) !important; }
  .voyage-light .bg-zinc-900\/40 { background-color: rgba(244,244,245,0.4) !important; }
  .voyage-light .bg-zinc-800 { background-color: #e5e7eb !important; }
  .voyage-light .bg-zinc-800\/50 { background-color: rgba(229,231,235,0.5) !important; }
  .voyage-light .bg-zinc-700 { background-color: #d4d4d8 !important; }

  /* Hover states on light */
  .voyage-light .hover\:bg-zinc-900:hover { background-color: #ececee !important; }
  .voyage-light .hover\:bg-zinc-800:hover { background-color: #eceff3 !important; }
  .voyage-light .hover\:bg-zinc-700:hover { background-color: #e2e3e7 !important; }

  /* Borders & dividers visible on white */
  .voyage-light .border-zinc-900\/60 { border-color: rgba(228,228,231,0.7) !important; }
  .voyage-light .border-zinc-900 { border-color: #e5e7eb !important; }
  .voyage-light .border-zinc-800 { border-color: #e5e7eb !important; }
  .voyage-light .border-zinc-700 { border-color: #d1d5db !important; }
  .voyage-light .border-zinc-600 { border-color: #cbd5e1 !important; }
  .voyage-light .divide-zinc-800 > :not([hidden]) ~ :not([hidden]) { border-color: #e5e7eb !important; }

  /* Text colors tuned for contrast on white */
  .voyage-light .text-zinc-100 { color: #0a0a0a !important; }   /* primary text */
  .voyage-light .text-zinc-200 { color: #111827 !important; }
  .voyage-light .text-zinc-300 { color: #1f2937 !important; }
  .voyage-light .text-zinc-400 { color: #374151 !important; }   /* secondary */
  .voyage-light .text-zinc-500 { color: #4b5563 !important; }
  .voyage-light .text-zinc-600 { color: #6b7280 !important; }   /* muted */

  /* Inputs: ensure white surface, visible border, readable placeholder */
  .voyage-light input.bg-zinc-900\/40,
  .voyage-light .bg-zinc-900\/40 input {
    background-color: #ffffff !important;
    color: #0a0a0a !important;
  }
  .voyage-light input::placeholder { color: #6b7280 !important; }
  .voyage-light .focus-visible\:ring-zinc-700:focus-visible { --tw-ring-color: #94a3b8 !important; }

  /* Buttons used as dark pills -> light pills, readable text */
  .voyage-light .bg-zinc-800.text-zinc-100 { color: #0a0a0a !important; }
  .voyage-light .bg-zinc-800.text-zinc-100:hover { background-color: #e9ecef !important; }

  /* Popovers/dialogs/cards should stay light with subtle borders */
  .voyage-light .shadow, 
  .voyage-light .shadow-sm, 
  .voyage-light .shadow-md, 
  .voyage-light .shadow-lg {
    box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 1px 1px rgba(0,0,0,.04) !important;
  }

  /* Error panels: keep readable on white */
  .voyage-light .bg-red-950\/30 { background-color: rgba(254,226,226,0.75) !important; }
  .voyage-light .border-red-900\/60 { border-color: rgba(248,113,113,0.6) !important; }
  .voyage-light .text-red-200 { color: #7f1d1d !important; }
  `
  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
