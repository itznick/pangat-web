import * as React from "react"

/* ─────────────────────────────────────────────────────────────────────────────
   Motion primitives for the landing page.
   No animation library: IntersectionObserver + one rAF per scroll-linked element,
   writing straight to CSS variables / transforms so React never re-renders on scroll.
   ───────────────────────────────────────────────────────────────────────────── */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Fires once when the element enters the viewport. */
export function useInView<T extends HTMLElement>(threshold = 0.2, rootMargin = "0px 0px -8% 0px") {
  const ref = React.useRef<T>(null)
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === "undefined") {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { threshold, rootMargin }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, rootMargin])

  return [ref, inView] as const
}

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  delay?: number
  variant?: "up" | "scale" | "left" | "right"
}

/** Blur + rise + fade on scroll-in. */
export function Reveal({ as: Tag = "div", delay = 0, variant = "up", style, children, ...rest }: RevealProps) {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      data-reveal={variant === "up" ? "" : variant}
      data-in={inView}
      style={{ ...style, ["--d" as string]: `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

interface SplitProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType
  text: string
  delay?: number
  /** words (by index) to wrap in the accent gradient */
  accent?: number[]
}

/** Headline whose words slide up out of a mask, staggered. */
export function SplitReveal({ as: Tag = "h2", text, delay = 0, accent = [], className = "", style, ...rest }: SplitProps) {
  const [ref, inView] = useInView<HTMLElement>(0.3)
  const words = text.split(" ")
  return (
    <Tag
      ref={ref}
      data-in={inView}
      aria-label={text}
      className={`lp-words ${className}`}
      style={{ ...style, ["--d" as string]: `${delay}ms` }}
      {...rest}
    >
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span className="w" aria-hidden="true">
            <span style={{ ["--i" as string]: i }} className={accent.includes(i) ? "lp-accent-text" : undefined}>
              {w}
            </span>
          </span>
          {i < words.length - 1 ? " " : null}
        </React.Fragment>
      ))}
    </Tag>
  )
}

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n))

/**
 * rAF-throttled scroll listener. `cb` is called on scroll/resize with the element's rect.
 * Skips work while the element is far off-screen.
 */
export function useScrollLinked<T extends HTMLElement>(
  cb: (el: T, rect: DOMRect, vh: number) => void,
  deps: React.DependencyList = []
) {
  const ref = React.useRef<T>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const run = () => {
      raf = 0
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      if (rect.bottom < -vh || rect.top > vh * 2) return
      cb(el, rect, vh)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    run()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return ref
}

/** Progress (0→1) of an element travelling from the viewport bottom to `endAt` (fraction of vh from top). */
export function useEnterProgress<T extends HTMLElement>(endAt = 0.25) {
  return useScrollLinked<T>((el, rect, vh) => {
    const start = vh
    const end = vh * endAt
    el.style.setProperty("--p", clamp((start - rect.top) / (start - end)).toFixed(4))
  })
}

/** Vertical parallax: shifts the element by `speed` × distance from viewport centre. */
export function useParallax<T extends HTMLElement>(speed = 0.1) {
  return useScrollLinked<T>((el, rect, vh) => {
    if (prefersReducedMotion()) return
    const centre = rect.top + rect.height / 2 - vh / 2
    el.style.transform = `translate3d(0, ${(-centre * speed).toFixed(1)}px, 0)`
  })
}

/** Animated count-up once visible. */
export function CountUp({
  to,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1400,
}: {
  to: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
}) {
  const [ref, inView] = useInView<HTMLSpanElement>(0.5)
  const [val, setVal] = React.useState(0)
  React.useEffect(() => {
    if (!inView) return
    if (prefersReducedMotion()) {
      setVal(to)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = clamp((t - t0) / duration)
      setVal(to * (1 - Math.pow(1 - p, 4)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {val.toLocaleString("en-IN", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

/** Cursor-reactive spotlight on glass cards. */
export function Spotlight({ className = "", children }: { className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    el.style.setProperty("--mx", `${e.clientX - r.left}px`)
    el.style.setProperty("--my", `${e.clientY - r.top}px`)
  }
  return (
    <div ref={ref} onPointerMove={onMove} className={`group/spot relative ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.08), transparent 45%)",
        }}
      />
      {children}
    </div>
  )
}
