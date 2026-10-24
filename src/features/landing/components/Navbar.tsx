import * as React from "react"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { PangatLogo } from "@/components/ui/PangatLogo"
import {
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  LayoutDashboard,
  MonitorSpeaker,
  Smartphone,
  Sparkles,
} from "lucide-react"

interface NavbarProps {
  onOpenPilot: () => void
}

export function Navbar({ onOpenPilot }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [appsDropdownOpen, setAppsDropdownOpen] = React.useState(false)
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

            <span className="w-px h-3.5 bg-white/10 mx-1" />

            {/* Try Live Apps Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setAppsDropdownOpen(true)}
              onMouseLeave={() => setAppsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setAppsDropdownOpen(!appsDropdownOpen)}
                className="px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Try App</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${
                    appsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {appsDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-zinc-950/95 border border-white/15 rounded-2xl p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <a
                    href="/admin/dashboard"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                        Admin Portal
                      </p>
                      <p className="text-[10px] text-zinc-400">Live revenue & table heatmap</p>
                    </div>
                  </a>

                  <a
                    href="/kds/pangat"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                      <MonitorSpeaker className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">
                        Kitchen Display (KDS)
                      </p>
                      <p className="text-[10px] text-zinc-400">Tablet ticket prep station</p>
                    </div>
                  </a>

                  <a
                    href="/r/pangat/t/04"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        Table 04 Diner View
                      </p>
                      <p className="text-[10px] text-zinc-400">Mobile menu & 1-tap UPI pay</p>
                    </div>
                  </a>
                </div>
              )}
            </div>
          </nav>

          {/* Right Action Button with ShimmerButton */}
          <div className="hidden sm:flex items-center gap-3">
            <ShimmerButton
              onClick={onOpenPilot}
              shimmerColor="#a7f3d0"
              shimmerDuration="2.5s"
              background="rgba(5, 150, 105, 1)"
              borderRadius="100px"
              className="text-xs sm:text-sm font-semibold h-9 sm:h-10 px-5 shadow-lg shadow-emerald-950/50"
            >
              <span>Try Free for 7 Days</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 opacity-80" />
            </ShimmerButton>
          </div>

          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={onOpenPilot}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-semibold transition-all cursor-pointer shadow-sm"
            >
              Try Free
            </button>
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
            <div className="pt-2 border-t border-white/10 grid grid-cols-3 gap-2">
              <a
                href="/admin/dashboard"
                className="px-2 py-2 rounded-lg bg-zinc-800 text-center text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-zinc-700"
              >
                📊 Admin
              </a>
              <a
                href="/kds/pangat"
                className="px-2 py-2 rounded-lg bg-zinc-800 text-center text-xs font-semibold text-amber-400 border border-amber-500/20 hover:bg-zinc-700"
              >
                👨‍🍳 KDS
              </a>
              <a
                href="/r/pangat/t/04"
                className="px-2 py-2 rounded-lg bg-zinc-800 text-center text-xs font-semibold text-blue-400 border border-blue-500/20 hover:bg-zinc-700"
              >
                📱 Diner
              </a>
            </div>
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenPilot()
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 font-semibold text-sm justify-center shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                Try Free for 7 Days (No Card Needed)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
