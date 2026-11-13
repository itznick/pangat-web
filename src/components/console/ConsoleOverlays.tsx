import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { CommandPalette } from "./CommandPalette"
import { CHANGELOG } from "./changelog"
import { useConsoleUi } from "./useConsoleUi"
import type { CommandItem } from "./types"

const isTyping = (t: EventTarget | null) => {
  const el = t as HTMLElement | null
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable)
}

/**
 * Mounts the command palette, shortcut sheet and changelog, and listens for:
 *   Ctrl/⌘ K  palette      ?  shortcuts      G then <key>  go-to shortcuts
 */
export function ConsoleOverlays({
  items,
  goTo,
  shortcutRows,
}: {
  items: CommandItem[]
  goTo: Record<string, () => void>
  shortcutRows: { keys: string; label: string }[]
}) {
  const { palette, shortcuts, changelog, setPalette, setShortcuts, setChangelog } = useConsoleUi()

  React.useEffect(() => {
    let armed = false
    let timer = 0
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setPalette(!useConsoleUi.getState().palette)
        return
      }
      if (e.ctrlKey || e.metaKey || e.altKey || isTyping(e.target)) return
      if (e.key === "?") {
        setShortcuts(true)
        return
      }
      const k = e.key.toLowerCase()
      if (armed) {
        armed = false
        clearTimeout(timer)
        const fn = goTo[k]
        if (fn) {
          e.preventDefault()
          fn()
        }
        return
      }
      if (k === "g") {
        armed = true
        timer = window.setTimeout(() => (armed = false), 1200)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("keydown", onKey)
      clearTimeout(timer)
    }
  }, [goTo, setPalette, setShortcuts])

  return (
    <>
      <CommandPalette open={palette} onClose={() => setPalette(false)} items={items} />

      <Dialog open={shortcuts} onOpenChange={setShortcuts}>
        <DialogContent className="!max-w-md">
          <DialogHeader>
            <DialogTitle>Keyboard shortcuts</DialogTitle>
            <DialogDescription>Move around without lifting your hands.</DialogDescription>
          </DialogHeader>
          <ul className="divide-y divide-white/[0.06]">
            {shortcutRows.map((r) => (
              <li key={r.label} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-zinc-300">{r.label}</span>
                <span className="flex gap-1">
                  {r.keys.split(" ").map((k, i) => (
                    <kbd key={i} className="min-w-6 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-center text-xs text-zinc-300">
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </DialogContent>
      </Dialog>

      <Dialog open={changelog} onOpenChange={setChangelog}>
        <DialogContent className="!max-w-lg">
          <DialogHeader>
            <DialogTitle>What’s new</DialogTitle>
            <DialogDescription>Recent improvements to Pangat.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {CHANGELOG.map((c) => (
              <section key={c.date}>
                <p className="text-xs text-emerald-300">{c.date}</p>
                <h3 className="mt-1 font-heading text-base font-semibold text-white">{c.title}</h3>
                <ul className="mt-2 space-y-1.5">
                  {c.items.map((i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-zinc-400">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                      {i}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
