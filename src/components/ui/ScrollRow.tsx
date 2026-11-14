import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Horizontally scrollable row (tabs, chips) that fades its clipped edge(s) so people can tell there is more,
 * and keeps the active child ([aria-selected=true] / [aria-pressed=true] / [aria-current]) in view.
 */
export function ScrollRow({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [edge, setEdge] = React.useState({ l: false, r: false })

  const update = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    const l = el.scrollLeft > 4
    const r = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
    setEdge((p) => (p.l === l && p.r === r ? p : { l, r }))
  }, [])

  React.useLayoutEffect(() => {
    update()
    const el = ref.current
    if (!el || typeof ResizeObserver === "undefined") return
    const ro = new ResizeObserver(update)
    ro.observe(el)
    Array.from(el.children).forEach((c) => ro.observe(c))
    return () => ro.disconnect()
  }, [update, children])

  // Scroll only when the active item actually changes, so manual scrolling is never fought
  const lastActive = React.useRef<Element | null>(null)
  React.useEffect(() => {
    const active = ref.current?.querySelector<HTMLElement>('[aria-selected="true"],[aria-pressed="true"],[aria-current]') ?? null
    const box = ref.current
    if (box && active && active !== lastActive.current) {
      // horizontal only: scrollIntoView() could also scroll the whole page vertically
      const a = active.getBoundingClientRect()
      const b = box.getBoundingClientRect()
      if (a.left < b.left || a.right > b.right) box.scrollTo({ left: box.scrollLeft + (a.left - b.left) - (b.width - a.width) / 2 })
    }
    lastActive.current = active
  })

  return (
    <div
      ref={ref}
      onScroll={update}
      data-fade-l={edge.l || undefined}
      data-fade-r={edge.r || undefined}
      className={cn("scroll-row overflow-x-auto overscroll-x-contain", className)}
      {...props}
    >
      {children}
    </div>
  )
}
