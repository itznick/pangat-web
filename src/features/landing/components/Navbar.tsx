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
        className={`max-w-5xl mx-auto rounded-full pointer-events-auto transition-all duration-300 ${
          scrolled
            ? "bg-black/80 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/90 py-2 sm:py-2.5 px-4 sm:px-6 ring-1 ring-white/[0.05]"
            : "bg-black/50 backdrop-blur-xl border border-white/[0.08] shadow-xl shadow-black/50 py-2.5 sm:py-3 px-4 sm:px-6 ring-1 ring-white/[0.03]"
        }`}
      >
        <div className="flex items-center justify-between">
          {/* Brand Logo with Seated Pangat Icon */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="Pangat Home"
          >
            <PangatLogo size="sm" className="transition-transform group-hover:scale-105" />
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-semibold tracking-tight text-white font-heading">
                Pangat
              </span>
              <span className="text-[11px] font-sans font-medium text-zinc-400 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
                पंगत
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-full px-3 py-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="px-3 py-1 rounded-full text-xs font-normal text-zinc-400 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Button - Apple-style pure white pill */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-white text-zinc-950 hover:bg-zinc-200 transition-all duration-200 active:scale-95 shadow-sm cursor-pointer"
            >
              <span>Sign In</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center gap-2">
            <a
              href="/login"
              className="bg-white text-zinc-950 hover:bg-zinc-200 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all shadow-sm active:scale-95"
            >
              Sign In
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors"
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
        <div className="md:hidden max-w-5xl mx-auto mt-2 rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/[0.12] p-4 shadow-2xl shadow-black/90 pointer-events-auto animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-white/[0.05]">
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="px-3.5 py-2.5 rounded-xl text-sm font-normal text-zinc-300 hover:bg-white/[0.06] hover:text-white transition-colors flex items-center justify-between"
              >
                <span>{link.name}</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </a>
            ))}
            <div className="pt-2 border-t border-white/[0.08] flex flex-col gap-2">
              <a
                href="/login"
                className="block w-full py-2.5 rounded-full bg-white text-center text-xs font-semibold text-zinc-950 hover:bg-zinc-200 transition-colors"
              >
                Sign In
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenPilot()
                }}
                className="w-full bg-white/[0.08] hover:bg-white/[0.12] text-zinc-200 rounded-full py-2.5 font-medium text-xs justify-center border border-white/10 cursor-pointer transition-colors"
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
