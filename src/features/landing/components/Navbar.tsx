import * as React from "react"
import { ArrowRight, Menu, X } from "lucide-react"
import { PangatLogo } from "@/components/ui/PangatLogo"

interface NavbarProps {
  onOpenPilot: () => void
}

const LINKS = [
  { name: "Experience", href: "#journey" },
  { name: "Operations", href: "#operations" },
  { name: "Impact", href: "#calculator" },
  { name: "Pricing", href: "#pricing" },
]

/**
 * Jump straight to a section (no long smooth scroll through the pinned story).
 * Lands on the section's content, not its decorative top padding, just under the nav.
 */
export function scrollToHash(href: string, offset = 96) {
  const target = document.querySelector<HTMLElement>(href)
  if (!target) return
  const pad = parseFloat(getComputedStyle(target).paddingTop) || 0
  // The story section manages its own top spacing (pinned stage / carousel padding), so land on its very top.
  const nav = target.id === "journey" ? 0 : offset
  const top = target.getBoundingClientRect().top + window.scrollY + pad - nav
  const root = document.documentElement
  const prev = root.style.scrollBehavior
  root.style.scrollBehavior = "auto"
  window.scrollTo({ top: Math.max(0, top), behavior: "auto" })
  root.style.scrollBehavior = prev
}

export function Navbar({ onOpenPilot }: NavbarProps) {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)
  const [active, setActive] = React.useState("")
  const barRef = React.useRef<HTMLSpanElement>(null)

  React.useEffect(() => {
    let raf = 0
    const run = () => {
      raf = 0
      setScrolled(window.scrollY > 24)
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(run)
    }
    run()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Highlight the link whose section is nearest the top third of the viewport
  React.useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(`#${e.target.id}`)
        })
      },
      { rootMargin: "-35% 0px -55% 0px" }
    )
    LINKS.forEach((l) => {
      const el = document.querySelector(l.href)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    setOpen(false)
    // wait a frame so body scroll-lock is released before measuring
    requestAnimationFrame(() => scrollToHash(href))
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-4">
        <header
          className={`pointer-events-auto relative w-full overflow-hidden rounded-full transition-all duration-500 [transition-timing-function:var(--lp-ease)] ${
            scrolled
              ? "max-w-[860px] border border-white/[0.1] bg-black/55 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl backdrop-saturate-150"
              : "max-w-[1120px] border border-transparent bg-transparent"
          }`}
        >
          <div className="flex h-12 items-center justify-between pl-4 pr-1.5 sm:h-[52px] sm:pl-5">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault()
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              className="group flex items-center gap-2.5"
              aria-label="Pangat home"
            >
              <PangatLogo size="sm" className="transition-transform duration-500 group-hover:rotate-[-6deg] group-hover:scale-105" />
              <span className="font-heading text-[17px] font-semibold tracking-tight text-white">Pangat</span>
            </a>

            <nav className="hidden items-center md:flex" aria-label="Primary">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className={`relative px-3.5 py-2 text-[13px] transition-colors duration-300 ${
                    active === l.href ? "text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {l.name}
                  <span
                    className={`absolute inset-x-3.5 -bottom-px h-px origin-center bg-gradient-to-r from-transparent via-emerald-300 to-transparent transition-transform duration-500 ${
                      active === l.href ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-1.5">
              <a href="/login" className="hidden px-3 py-2 text-[13px] text-zinc-400 transition-colors hover:text-white sm:block">
                Sign in
              </a>
              <button
                type="button"
                onClick={onOpenPilot}
                className="lp-btn lp-btn-primary !h-9 !px-4 !text-[13px]"
              >
                <span>Start free</span>
                <ArrowRight className="lp-arrow hidden h-3.5 w-3.5 sm:block" />
              </button>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 md:hidden"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
              >
                {open ? <X className="h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
              </button>
            </div>
          </div>
          <span
            ref={barRef}
            aria-hidden
            className={`absolute inset-x-6 bottom-0 h-px origin-left bg-gradient-to-r from-emerald-400/0 via-emerald-300/80 to-amber-300/0 transition-opacity duration-500 ${
              scrolled ? "opacity-100" : "opacity-0"
            }`}
            style={{ transform: "scaleX(0)" }}
          />
        </header>
      </div>

      {/* Mobile sheet */}
      <div
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-2xl transition-all duration-500 md:hidden ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        onClick={() => setOpen(false)}
      >
        <nav
          className="mx-auto flex h-full max-w-md flex-col justify-center gap-1 px-8 pb-10 pt-24"
          onClick={(e) => e.stopPropagation()}
        >
          {LINKS.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => go(e, l.href)}
              className="font-heading text-[34px] font-semibold tracking-tight text-white transition-all duration-700 [transition-timing-function:var(--lp-ease)]"
              style={{
                transitionDelay: `${open ? 80 + i * 60 : 0}ms`,
                opacity: open ? 1 : 0,
                transform: open ? "none" : "translateY(18px)",
              }}
            >
              {l.name}
            </a>
          ))}
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                onOpenPilot()
              }}
              className="lp-btn lp-btn-primary w-full"
            >
              Start free for 7 days
            </button>
            <a href="/login" className="lp-btn lp-btn-ghost w-full">
              Sign in
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}
