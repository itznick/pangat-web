import { PangatLogo } from "@/components/ui/PangatLogo"
import { Marquee } from "@/components/magicui/marquee"
import {
  MapPin,
  MessageCircle,
  ArrowUp,
  Mail,
  Coffee,
  CheckCircle2,
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
    { name: "Baner & Balewadi", tag: "Bustling Dining" },
    { name: "Viman Nagar", tag: "Fast QSRs" },
    { name: "Kalyani Nagar", tag: "Artisan Bakeries" },
    { name: "Aundh & Westend", tag: "Family Eateries" },
    { name: "Kothrud", tag: "Traditional Spots" },
    { name: "Hinjawadi IT Park", tag: "High-Volume Lunch" },
    { name: "Law College Road", tag: "Chai & Conversations" },
    { name: "SB Road", tag: "Urban Diners" },
  ]

  return (
    <footer className="bg-black text-zinc-300 border-t border-white/[0.08] relative overflow-hidden">
      {/* 1. Neighborhood Delivery Strip */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20">
        <div className="relative rounded-3xl border border-white/[0.08] bg-zinc-950/60 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl overflow-hidden ring-1 ring-white/[0.04]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 sm:mb-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-normal">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>On-Site Across Pune</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight font-heading">
                Active Neighborhood Standee Deliveries
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-400 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] shrink-0 font-normal">
              <span>Free 15-minute live audio chime test</span>
            </div>
          </div>

          {/* Marquee Strip with Apple-style glass pills */}
          <div className="relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-2">
            <Marquee pauseOnHover className="[--duration:40s]">
              {puneNeighborhoods.map((area) => (
                <div
                  key={area.name}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-colors text-xs text-zinc-200 cursor-default"
                >
                  <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-300 shrink-0">
                    <Coffee className="w-3 h-3" />
                  </div>
                  <div>
                    <span className="font-medium text-white text-xs block leading-tight">{area.name}</span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      {area.tag}
                    </span>
                  </div>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>

      {/* 2. Pre-Footer Spotlight Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="relative rounded-3xl border border-white/[0.08] bg-zinc-950/70 p-6 sm:p-10 md:p-12 overflow-hidden shadow-2xl backdrop-blur-xl ring-1 ring-white/[0.04]">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left Content */}
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-normal">
                <span>Pune Cafe Partnership</span>
                <span className="text-zinc-600">·</span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Zap className="w-3 h-3" /> 15-Min Setup
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight font-heading leading-tight">
                Brewing in Pune?
                <span className="block text-zinc-400 font-medium mt-1">Let&apos;s grab a chai.</span>
              </h3>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                We&apos;ll drop by your cafe with 2 sample acrylic QR standees, configure your menu live in 15 minutes, and test the audio chime alert together. No credit card, no hardware purchase, no pressure.
              </p>

              {/* Trust Checkmarks */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-zinc-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <span>Free 7-day in-person trial</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <span>Works on any existing tablet or phone</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <span>Zero POS lock-in · Keep your counter UPI</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <span>Same-day setup anywhere in Pune</span>
                </div>
              </div>
            </div>

            {/* Right CTAs - Apple Style */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto lg:min-w-[240px]">
              <button
                type="button"
                onClick={onOpenPilot}
                className="w-full py-3.5 px-6 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-sm transition-all duration-200 active:scale-[0.98] shadow-lg shadow-white/5 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Schedule Free Demo</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://wa.me/919890000000?text=Hi%20Pangat%20team,%20I'd%20like%20to%20test%20the%20table%20ordering%20for%20my%20cafe."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white font-medium text-sm border border-white/10 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-4 h-4 text-zinc-300" />
                <span>Chat on WhatsApp</span>
              </a>

              <p className="text-[11px] text-zinc-500 text-center pt-1 font-normal">
                Direct founder line · Usually responds within 2 hours
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Architectural 4-Column Footer */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/[0.08]">
          {/* Column 1: Brand & Philosophy */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <PangatLogo size="sm" />
              <span className="text-xl font-bold tracking-tight text-white font-heading">
                Pangat
              </span>
              <span className="text-xs font-normal text-zinc-400 px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10">
                पंगत
              </span>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-sm font-normal">
              Modern dining speed, rooted in timeless hospitality. Zero-hardware table ordering and kitchen orchestration for independent cafes and specialty coffee spots.
            </p>

            {/* Operational Status */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-normal">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <span>All Systems Operational</span>
              </div>

              <a
                href="mailto:hello@pangat.app"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-zinc-500" />
                <span>hello@pangat.app</span>
              </a>
            </div>
          </div>

          {/* Column 2: Product */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400 font-normal">
              <li>
                <button
                  type="button"
                  onClick={onOpenPilot}
                  className="hover:text-white transition-colors text-white font-medium flex items-center gap-1 cursor-pointer"
                >
                  <span>Book Free Demo</span>
                  <ArrowRight className="w-3 h-3 text-zinc-400" />
                </button>
              </li>
              <li>
                <a
                  href="#direct-ordering"
                  onClick={(e) => scrollToSection(e, "#direct-ordering")}
                  className="hover:text-white transition-colors"
                >
                  Table Ordering
                </a>
              </li>
              <li>
                <a
                  href="#kds-station"
                  onClick={(e) => scrollToSection(e, "#kds-station")}
                  className="hover:text-white transition-colors"
                >
                  Kitchen KDS
                </a>
              </li>
              <li>
                <a
                  href="#zero-hardware"
                  onClick={(e) => scrollToSection(e, "#zero-hardware")}
                  className="hover:text-white transition-colors"
                >
                  Zero Hardware
                </a>
              </li>
              <li>
                <a
                  href="#calculator"
                  onClick={(e) => scrollToSection(e, "#calculator")}
                  className="hover:text-white transition-colors"
                >
                  Turnover Calculator
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  onClick={(e) => scrollToSection(e, "#pricing")}
                  className="hover:text-white transition-colors"
                >
                  Pricing (₹699/mo)
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Pune Hubs */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Pune Hubs
            </h4>
            <ul className="grid grid-cols-2 gap-x-2 gap-y-2 text-xs text-zinc-400">
              <li>FC Road & Deccan</li>
              <li>Koregaon Park</li>
              <li>Baner & Balewadi</li>
              <li>Viman Nagar</li>
              <li>Hinjawadi</li>
              <li>Kothrud</li>
              <li>Aundh</li>
              <li>Kalyani Nagar</li>
            </ul>
          </div>

          {/* Column 4: Guarantees */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500">
              Guarantees
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>0% commission cuts</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>Zero thermal roll costs</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>Nightly WhatsApp summary</span>
              </li>
              <li className="flex items-start gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>Direct founder support</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 4. Bottom Legal & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1">
            <span>© 2026 Pangat Technologies · Pune, Maharashtra.</span>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenPilot}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={onOpenPilot}
              className="hover:text-zinc-300 transition-colors cursor-pointer"
            >
              Terms of Service
            </button>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
            aria-label="Scroll to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </footer>
  )
}
