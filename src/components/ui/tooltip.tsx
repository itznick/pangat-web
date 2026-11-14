import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface TooltipProps {
  label: React.ReactNode
  /** Small secondary text such as a keyboard shortcut */
  hint?: string
  side?: "top" | "bottom" | "right"
  disabled?: boolean
  className?: string
  children: React.ReactNode
}

/**
 * Hover / keyboard-focus tooltip rendered in a portal, so it is never clipped by an
 * `overflow-hidden` parent (e.g. the collapsed sidebar). Ignored for touch (no hover on phones).
 * Dismisses on Escape, on scroll and on pointer leave.
 */
export function Tooltip({ label, hint, side = "bottom", disabled, className, children }: TooltipProps) {
  const [pos, setPos] = React.useState<{ x: number; y: number } | null>(null)
  const ref = React.useRef<HTMLSpanElement>(null)
  const timer = React.useRef(0)
  const id = React.useId()

  const show = React.useCallback(
    (delay: number) => {
      if (disabled) return
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        const r = ref.current?.getBoundingClientRect()
        if (!r) return
        setPos(
          side === "right"
            ? { x: r.right + 10, y: r.top + r.height / 2 }
            : side === "top"
              ? { x: r.left + r.width / 2, y: r.top - 8 }
              : { x: r.left + r.width / 2, y: r.bottom + 8 }
        )
      }, delay)
    },
    [disabled, side]
  )
  const hide = React.useCallback(() => {
    window.clearTimeout(timer.current)
    setPos(null)
  }, [])

  React.useEffect(() => {
    if (!pos) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && hide()
    window.addEventListener("keydown", onKey)
    window.addEventListener("scroll", hide, true)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("scroll", hide, true)
    }
  }, [pos, hide])
  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  return (
    <span
      ref={ref}
      className={cn("inline-flex", className)}
      aria-describedby={pos ? id : undefined}
      onPointerEnter={(e) => e.pointerType === "mouse" && show(350)}
      onPointerLeave={hide}
      onPointerDown={hide}
      onFocus={(e) => (e.target as HTMLElement).matches?.(":focus-visible") && show(0)}
      onBlur={hide}
    >
      {children}
      {pos &&
        createPortal(
          <span
            id={id}
            role="tooltip"
            style={{ left: pos.x, top: pos.y }}
            className={cn(
              "pointer-events-none fixed z-[100] flex items-center gap-2 whitespace-nowrap rounded-lg border border-white/10 bg-zinc-900 px-2.5 py-1.5 text-xs font-medium text-zinc-100 shadow-xl animate-in fade-in duration-100",
              side === "right" ? "-translate-y-1/2" : "-translate-x-1/2",
              side === "top" && "-translate-y-full"
            )}
          >
            {label}
            {hint && <kbd className="rounded border border-white/10 px-1 text-[10px] text-zinc-400">{hint}</kbd>}
          </span>,
          document.body
        )}
    </span>
  )
}
