import { Badge } from "@/components/ui/badge"
import { PangatLogo } from "@/components/ui/PangatLogo"
import { MapPin, MessageCircle, ArrowUp, Mail } from "lucide-react"

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

  const puneLocalities = [
    "FC Road",
    "Koregaon Park",
    "Baner",
    "Viman Nagar",
    "Kalyani Nagar",
    "Aundh",
    "Kothrud",
    "Hinjawadi",
  ]

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800">
      {/* Pune Cafe Special Banner Callout */}
      <div className="border-b border-zinc-850 bg-gradient-to-r from-emerald-950/40 via-zinc-950 to-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Ground Operations in Pune</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Brewing in Pune or Hinjawadi? Let us drop by today.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              We'll bring our sample acrylic table standee, configure your menu in 15 minutes over chai, and let you test the live kitchen chime in person.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {puneLocalities.map((area) => (
                <span
                  key={area}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full md:w-auto">
            <button
              onClick={onOpenPilot}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
            >
              Book Pune Standee Delivery
            </button>
            <a
              href="https://wa.me/919890000000?text=Hi%20Pangat%20team,%20I'd%20like%20to%20test%20the%20table%20ordering%20pilot%20for%20my%20cafe."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-sm transition-all border border-zinc-700"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info (Span 2) */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <PangatLogo size="sm" />
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-heading">
                  Pangat
                </span>
                <span className="text-xs font-serif text-emerald-400 font-medium">
                  (पंगत)
                </span>
              </div>
              <Badge variant="emerald" className="text-[10px] py-0 px-2 font-semibold">
                Beta
              </Badge>
            </div>

            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
              "Modern dining speed, rooted in timeless hospitality."
            </p>

            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              A zero-hardware, real-time table ordering & kitchen orchestration layer for independent cafes, high-turnover QSRs, and specialty coffee spots.
            </p>

            <div className="pt-2 text-xs text-zinc-400 flex items-center gap-2">
              <span className="text-emerald-400 font-medium">pangat.app</span>
              <span className="text-zinc-600">·</span>
              <span>Made with care in Pune, Maharashtra</span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Product
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <a href="#features" className="hover:text-emerald-400 transition-colors">
                  Zero-Hardware Ordering
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-emerald-400 transition-colors">
                  Web KDS & Audio Chime
                </a>
              </li>
              <li>
                <a href="#calculator" className="hover:text-emerald-400 transition-colors">
                  Turnover ROI Calculator
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-emerald-400 transition-colors">
                  Merchant Pricing (₹699/mo)
                </a>
              </li>
              <li>
                <button
                  onClick={onOpenPilot}
                  className="hover:text-emerald-400 text-left transition-colors cursor-pointer"
                >
                  Claim 7-Day Pilot
                </button>
              </li>
            </ul>
          </div>

          {/* Ideal Outlets */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Designed For
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>Specialty Coffee Roasters</li>
              <li>High-Volume Bakery Cafes</li>
              <li>College & IT Park QSRs</li>
              <li>Artisanal Pizzerias & Toasties</li>
              <li>Breakfast & Brunch Bistros</li>
              <li>Pune Tech Park Cafeterias</li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
              Connect & Legal
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <a
                  href="mailto:hello@pangat.app"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  hello@pangat.app
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Terms of Merchant Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  UPI Settlement Guidelines
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span>© 2026 Pangat. All rights reserved.</span>
            <span>·</span>
            <span>Modern dining speed, rooted in timeless hospitality.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}
