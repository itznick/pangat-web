import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PangatLogo } from "@/components/ui/PangatLogo"
import { Menu, X, ArrowRight, Sparkles, MapPin } from "lucide-react"

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
    { name: "Features", href: "#features" },
    { name: "How It Works", href: "#how-it-works" },
    { name: "Savings Calculator", href: "#calculator" },
    { name: "Pricing", href: "#pricing" },
  ]

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    const target = document.querySelector(href)
    if (target) {
      const topOffset = 80
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - topOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  return (
    <>
      {/* Top Pune Pilot Banner */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 text-center font-medium border-b border-emerald-900/60 hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="flex items-center gap-1 text-emerald-300">
            <MapPin className="w-3 h-3 text-emerald-400" />
            Pune On-Site Pilot:
          </span>
          <span>We set up your acrylic table standees in person across FC Road, Koregaon Park & Baner.</span>
          <button
            onClick={onOpenPilot}
            className="underline underline-offset-2 hover:text-white font-semibold ml-1 cursor-pointer"
          >
            Claim Free Trial →
          </button>
        </div>
      </div>

      {/* Main Sticky Navigation */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md shadow-xs border-b border-zinc-200/80 dark:bg-zinc-950/90 dark:border-zinc-800"
            : "bg-white/80 backdrop-blur-xs border-b border-zinc-100 dark:bg-zinc-950/80 dark:border-zinc-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Logo with Seated Pangat Icon & Beta badge */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none"
            aria-label="Pangat Home"
          >
            <PangatLogo size="sm" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white font-heading">
                Pangat
              </span>
              <span className="text-xs font-serif text-emerald-700/80 dark:text-emerald-400/80 font-medium">
                (पंगत)
              </span>
            </div>
            <Badge
              variant="emerald"
              className="ml-1 text-[10px] tracking-wide uppercase px-2 py-0 font-semibold"
            >
              Beta
            </Badge>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => scrollToSection(e, link.href)}
                className="text-sm font-medium text-zinc-600 hover:text-zinc-950 transition-colors dark:text-zinc-300 dark:hover:text-white"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Right Action Button */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              onClick={onOpenPilot}
              variant="default"
              size="default"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md shadow-emerald-700/20 gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              Claim 7-Day Pilot
              <ArrowRight className="w-3.5 h-3.5 ml-0.5 opacity-80" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              onClick={onOpenPilot}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 h-8 font-medium"
            >
              Pilot
            </Button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-zinc-900 dark:text-white" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-200 bg-white/98 backdrop-blur-lg px-4 pt-3 pb-6 space-y-3 dark:bg-zinc-950/98 dark:border-zinc-800 animate-in slide-in-from-top duration-200 shadow-xl">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => scrollToSection(e, link.href)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false)
                  onOpenPilot()
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white justify-center shadow-md py-5"
              >
                Claim 7-Day Free Pilot
              </Button>
              <p className="text-center text-xs text-zinc-500 mt-2 font-mono">
                Zero hardware required · Instant UPI dining
              </p>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
