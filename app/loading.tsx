export default function Loading() {
  // Ensure we never flash a white screen during route transitions
  return <div className="min-h-screen w-full bg-black text-zinc-100" />
}
