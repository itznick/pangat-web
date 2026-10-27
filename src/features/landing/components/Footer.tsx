import { PangatLogo } from "@/components/ui/PangatLogo"
import { Marquee } from "@/components/magicui/marquee"
import { BorderBeam } from "@/components/magicui/border-beam"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import {
  MapPin,
  MessageCircle,
  ArrowUp,
  Mail,
  Coffee,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react"

interface FooterProps {
  onOpenPilot: () => void
}

export function Footer({ onOpenPilot }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    const target = document.querySelector(href)
    if (target) {
      const topOffset = 90
      const elementPosition = target.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - topOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const puneNeighborhoods = [
    { name: "FC Road & Deccan", tag: "Student & Cafe Hub" },
    { name: "Koregaon Park", tag: "Specialty Coffee" },
    { name: "Baner & Balewadi High St.", tag: "Bustling Dining" },
    { name: "Viman Nagar", tag: "Fast QSRs" },
    { name: "Kalyani Nagar", tag: "Artisan Bakeries" },
    { name: "Aundh & Westend", tag: "Family Eateries" },
    { name: "Kothrud & Karve Road", tag: "Traditional Spots" },
    { name: "Hinjawadi IT Park", tag: "High-Volume Lunch" },
    { name: "Law College Road", tag: "Chai & Conversations" },
    { name: "Senapati Bapat Road", tag: "Urban Diners" },
  ]

  return (
    <footer className="bg-[#090807]/95 text-zinc-300 border-t border-white/10 relative overflow-hidden">
      {/* 1. Elevated Taller Showcase Card for Pune Cafe Hotspots (Card-like & prominent) */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-900/95 via-zinc-900/70 to-zinc-950 p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Subtle Ambient Background Light */}
          <div className="absolute top-0 right-1/4 w-96 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header Row */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-8">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-sans font-semibold tracking-wide uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <MapPin className="w-3.5 h-3.5" />
                <span>Now Setting Up Across Pune Cafes</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-heading">
                Active Neighborhood Standee Deliveries
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-zinc-300 font-sans px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-950/80 border border-white/10 shrink-0">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Free 15-minute in-person table & audio chime test</span>
            </div>
          </div>

          {/* Taller, Richer Marquee Strip with Elevated Glass Pills */}
          <div className="relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-2">
            <Marquee pauseOnHover className="[--duration:40s]">
              {puneNeighborhoods.map((area) => (
                <div
                  key={area.name}
                  className="group flex items-center gap-3.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-zinc-950/90 hover:bg-zinc-850 border border-white/10 hover:border-emerald-500/40 transition-all text-xs text-zinc-200 cursor-default shadow-md font-sans"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shrink-0">
                    <Coffee className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white text-sm block leading-tight">{area.name}</span>
                    <span className="text-[11px] text-zinc-400 font-medium">
                      {area.tag}
                    </span>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>

      {/* 2. Pre-Footer Spotlight Card: "Brewing in Pune? Let's grab a chai." */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-900 via-zinc-900/80 to-zinc-950 p-6 sm:p-10 md:p-14 overflow-hidden shadow-2xl shadow-emerald-950/20 backdrop-blur-xl">
          {/* Subtle rotating laser beam around the luxury card */}
          <BorderBeam
            size={300}
            duration={16}
            borderWidth={1.5}
            colorFrom="#10b981"
            colorTo="#f59e0b"
          />

          {/* Ambient warm chai & emerald glow orbs */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            {/* Left Content */}
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-sans font-medium tracking-wide">
                <span>☕</span>
                <span>PUNE CAFE PARTNERSHIP</span>
                <span className="text-zinc-600">|</span>
                <span className="text-emerald-400 flex items-center gap-1 font-sans">
                  <Zap className="w-3 h-3" /> 15-Min Setup
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-heading leading-tight">
                Brewing in Pune?{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-emerald-300 to-teal-200">
                  Let&apos;s grab a chai.
                </span>
              </h3>

              <p className="text-base text-zinc-300 leading-relaxed font-sans">
                We&apos;ll drop by your cafe with 2 sample acrylic QR standees,
                configure your menu live in 15 minutes, and let you hear the kitchen
                audio alert in person. No credit card, no hardware purchase, no pressure.
              </p>

              {/* Trust Checkmarks */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-300 font-sans">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free 7-day in-person trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Works on your existing phone or tablet</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Keep your counter UPI & staff flow</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Same-day setup anywhere in Pune</span>
                </div>
              </div>
            </div>

            {/* Right CTAs */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
              <ShimmerButton
                onClick={onOpenPilot}
                background="linear-gradient(135deg, #059669 0%, #047857 100%)"
                className="w-full sm:w-auto px-7 py-3.5 font-semibold text-sm shadow-xl shadow-emerald-950/60 font-sans"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Schedule Free On-Site Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </ShimmerButton>

              <a
                href="https://wa.me/919890000000?text=Hi%20Pangat%20team,%20I'd%20like%20to%20test%20the%20table%20ordering%20for%20my%20cafe."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white font-medium text-sm border border-emerald-500/20 hover:border-emerald-500/40 transition-all hover:shadow-lg shadow-black/40 group font-sans"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Chat with Founder on WhatsApp</span>
              </a>

              <p className="text-[11px] text-zinc-400 text-center font-sans pt-1">
                ⚡ Rapid response • Usually within 2 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Architectural 4-Column Footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          {/* Column 1: Brand & Philosophy (span 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <PangatLogo size="sm" />
              <span className="text-2xl font-bold tracking-tight text-white font-heading">
                Pangat
              </span>
              <div className="inline-flex items-center px-2 py-0.5 rounded-md bg-gradient-to-r from-emerald-950/80 via-zinc-900 to-amber-950/40 border border-emerald-500/30 shadow-xs">
                <span className="text-xs font-serif font-bold text-amber-200 tracking-wide select-none">
                  पंगत
                </span>
              </div>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed max-w-sm font-sans">
              Modern dining speed, rooted in timeless hospitality. Zero-hardware
              table ordering and kitchen orchestration for independent cafes,
              high-turnover QSRs, and specialty coffee spots.
            </p>

            {/* Live Operational Status & Direct Email */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-emerald-500/30 text-emerald-400 text-xs font-sans font-medium">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>All Systems Operational</span>
              </div>

              <a
                href="mailto:hello@pangat.app"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 font-sans transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>hello@pangat.app</span>
              </a>
            </div>
          </div>

          {/* Column 2: Product & Architecture (span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-zinc-400">
              Product Information
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-300 font-sans">
              <li>
                <button
                  type="button"
                  onClick={onOpenPilot}
                  className="hover:text-emerald-300 transition-colors font-semibold text-emerald-400 flex items-center gap-1 cursor-pointer"
                >
                  <span>Book a Free Demo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </li>
              <li>
                <a
                  href="#direct-ordering"
                  onClick={(e) => scrollToSection(e, "#direct-ordering")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Direct Table Ordering
                </a>
              </li>
              <li>
                <a
                  href="#kds-station"
                  onClick={(e) => scrollToSection(e, "#kds-station")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Kitchen Display (KDS)
                </a>
              </li>
              <li>
                <a
                  href="#zero-hardware"
                  onClick={(e) => scrollToSection(e, "#zero-hardware")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Zero-Hardware POS
                </a>
              </li>
              <li>
                <a
                  href="#calculator"
                  onClick={(e) => scrollToSection(e, "#calculator")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Turnover ROI Calculator
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => scrollToSection(e, "#pricing")}
                  className="hover:text-emerald-400 transition-colors"
                >
                  Flat ₹699/mo Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Pune Cafe Hubs (span 3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-zinc-400">
              Pune Neighborhoods
            </h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-zinc-300 font-sans">
              <li className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>FC Road</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Koregaon Park</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Baner & Balewadi</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Viman Nagar</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Hinjawadi IT Park</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Kothrud</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Aundh</span>
              </li>
              <li className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-default">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Kalyani Nagar</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Hospitality Guarantees (span 2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-sans font-semibold uppercase tracking-wider text-zinc-400">
              Cafe Guarantees
            </h4>
            <ul className="space-y-2 text-xs text-zinc-300 font-sans">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Zero commission cuts on food sales</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>No POS lock-in or thermal roll costs</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Daily WhatsApp business digest</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Founder direct support line</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 4. Bottom Legal and Back to Top Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-zinc-400">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-center sm:text-left">
            <span>
              © 2026 Pangat Technologies. Built with pride in Pune, Maharashtra.
            </span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <span className="text-emerald-400 font-semibold">
              Powered by Pangat
            </span>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <button
              type="button"
              onClick={onOpenPilot}
              className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span className="hidden sm:inline text-zinc-700">•</span>
            <button
              type="button"
              onClick={onOpenPilot}
              className="text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/10 hover:border-emerald-500/40 text-xs transition-all cursor-pointer shadow-sm"
              aria-label="Scroll back to top"
            >
              <span>Back to top</span>
              <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform text-emerald-400" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
