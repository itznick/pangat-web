import * as React from "react"
import { PangatLogo } from "@/components/ui/PangatLogo"
import {
  Menu,
  X,
  ArrowRight,
} from "lucide-react"

interface NavbarProps {
  onOpenPilot: () => void
}

export function Navbar({ onOpenPilot }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { name: "How It Works", href: "#how-it-works" },
    { name: "Features", href: "#features" },
    { name: "Turnover Calculator", href: "#calculator" },
    { name: "Pricing", href: "#pricing" },
  ]

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const target = document.querySelector(href)
    if (target) {
      const topOffset = 100
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - topOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-6 pointer-events-none">
      <header
        className={`max-w-5xl mx-auto rounded-full pointer-events-auto transition-[background-color,border-color,box-shadow,padding] duration-300 ${
          scrolled
            ? "glass-panel bg-zinc-950/90 border-white/15 shadow-2xl shadow-black/80 py-2 sm:py-2.5 px-4 sm:px-6"
            : "glass-panel bg-zinc-950/75 border-white/10 shadow-xl shadow-black/40 py-2.5 sm:py-3 px-4 sm:px-6"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo with Seated Pangat Icon */}
          <a
            href="#"
            className="flex items-center gap-2 sm:gap-3 group focus:outline-none"
            aria-label="Pangat Home"
          >
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-emerald-500/30 blur-xs opacity-75 group-hover:opacity-100 transition-opacity" />
              <PangatLogo size="sm" className="relative" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <span className="text-lg sm:text-xl font-bold tracking-tight text-white font-heading">
                Pangat
              </span>
              <div className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-amber-950/40 border border-emerald-500/30 shadow-xs">
                <span className="text-[11px] sm:text-xs font-serif font-bold text-amber-200 tracking-wide select-none">
                  पंगत
                </span>
              </div>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-zinc-900/60 border border-white/5 rounded-full px-4 py-1.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="px-3.5 py-1 rounded-full text-xs font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Button - Retain only Sign In button targeting /login */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href="/login"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shadow-sm"
            >
              Sign In
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Dropdown Menu: clean floating card separate from pill */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-5xl mx-auto mt-2 rounded-2xl glass-panel bg-zinc-950/95 border border-white/15 p-4 shadow-2xl shadow-black/90 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="px-3 py-2 rounded-xl text-base font-medium text-zinc-200 hover:bg-white/5 hover:text-white transition-colors flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </a>
            ))}
            <div className="pt-2 border-t border-white/10">
              <a
                href="/login"
                className="block w-full px-3 py-2.5 rounded-xl bg-emerald-600 text-center text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Sign In
              </a>
            </div>
            <div className="pt-1">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenPilot()
                }}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl py-3 font-semibold text-xs justify-center border border-white/10 cursor-pointer"
              >
                Book a Free Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
