import { create } from "zustand"
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

type Kind = "success" | "error" | "info"
interface ToastItem {
  id: number
  kind: Kind
  message: string
}

interface ToastStore {
  items: ToastItem[]
  push: (kind: Kind, message: string) => void
  dismiss: (id: number) => void
}

let nextId = 1
const useToastStore = create<ToastStore>((set, get) => ({
  items: [],
  push: (kind, message) => {
    const id = nextId++
    // identical message already on screen: don't stack duplicates
    if (get().items.some((t) => t.message === message && t.kind === kind)) return
    set((s) => ({ items: [...s.items.slice(-3), { id, kind, message }] }))
    window.setTimeout(() => get().dismiss(id), kind === "error" ? 7000 : 4000)
  },
  dismiss: (id) => set((s) => ({ items: s.items.filter((t) => t.id !== id) })),
}))

/** Non-blocking notifications (replaces window.alert). */
export const toast = {
  success: (m: string) => useToastStore.getState().push("success", m),
  error: (m: string) => useToastStore.getState().push("error", m),
  info: (m: string) => useToastStore.getState().push("info", m),
}

const ICON = { success: CheckCircle2, error: AlertCircle, info: Info } as const
const TONE: Record<Kind, string> = {
  success: "border-emerald-400/30 bg-emerald-950/90 text-emerald-100",
  error: "border-rose-400/30 bg-rose-950/90 text-rose-100",
  info: "border-sky-400/30 bg-zinc-900/95 text-zinc-100",
}

/** Mount once near the app root. Announced politely to screen readers; sits above bottom bars on phones. */
export function Toaster() {
  const items = useToastStore((s) => s.items)
  const dismiss = useToastStore((s) => s.dismiss)
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[200] flex flex-col items-center gap-2 px-3 sm:items-end sm:px-5"
    >
      {items.map((t) => {
        const Icon = ICON[t.kind]
        return (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 text-[13.5px] shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 fade-in duration-200",
              TONE[t.kind]
            )}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="min-w-0 flex-1 leading-snug">{t.message}</p>
            <button type="button" onClick={() => dismiss(t.id)} aria-label="Dismiss" className="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md opacity-70 hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
