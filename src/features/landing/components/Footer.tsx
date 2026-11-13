import { ArrowRight, ArrowUp, Mail, MessageCircle } from "lucide-react"
import { PangatLogo } from "@/components/ui/PangatLogo"
import { Reveal, SplitReveal } from "./motion"
import { scrollToHash } from "./Navbar"

interface FooterProps {
  onOpenPilot: () => void
}

const AREAS = [
  "FC Road & Deccan",
  "Koregaon Park",
  "Baner & Balewadi",
  "Viman Nagar",
  "Kalyani Nagar",
  "Aundh & Westend",
  "Kothrud",
  "Hinjawadi IT Park",
  "Law College Road",
  "SB Road",
]

const WHATSAPP =
  "https://wa.me/919890000000?text=Hi%20Pangat%20team,%20I'd%20like%20to%20test%20the%20table%20ordering%20for%20my%20cafe."

export function Footer({ onOpenPilot }: FooterProps) {
  const anchor = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    scrollToHash(href)
  }

  return (
    <footer className="relative overflow-hidden">
      {/* ── Closing CTA ───────────────────────────────────────────────── */}
      <section className="relative isolate px-5 pb-28 pt-24 text-center sm:px-8 sm:pb-40 sm:pt-36">
        <div className="lp-aurora" aria-hidden>
          <div className="absolute left-1/2 top-[10%] h-[560px] w-[900px] -translate-x-1/2">
            <div className="lp-orb h-full w-full bg-[radial-gradient(closest-side,rgba(16,185,129,0.4),transparent)]" />
          </div>
          <div className="absolute right-[5%] top-[40%] h-[320px] w-[420px]">
            <div className="lp-orb h-full w-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.18),transparent)]" style={{ animationDelay: "-6s" }} />
          </div>
        </div>

        <div className="relative mx-auto max-w-[900px]">
          <SplitReveal
            text="Your next rush, handled."
            className="lp-display lp-grad-text text-[3rem] sm:text-[5.2rem] lg:text-[6.4rem]"
            accent={[3]}
          />
          <Reveal as="p" delay={300} className="mx-auto mt-7 max-w-[32rem] text-[1.05rem] leading-relaxed text-zinc-400 sm:text-xl">
            We&rsquo;ll bring two standees to your cafe in Pune, set up your menu in 15 minutes, and test the chime together.
          </Reveal>
          <Reveal delay={450} className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <button type="button" onClick={onOpenPilot} className="lp-btn lp-btn-primary w-full sm:w-auto sm:!h-[3.25rem] sm:!px-8 sm:!text-base">
              Book your free trial <ArrowRight className="lp-arrow h-4 w-4" />
            </button>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="lp-btn lp-btn-ghost w-full sm:w-auto sm:!h-[3.25rem] sm:!px-7 sm:!text-base">
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </Reveal>
          <Reveal as="p" delay={550} className="mt-5 text-[13px] text-zinc-500">
            Usually replies within 2 hours · No credit card · No hardware to buy
          </Reveal>
        </div>
      </section>

      {/* ── Neighbourhood marquee ─────────────────────────────────────── */}
      <div
        className="relative border-y border-white/[0.06] py-5"
        style={{ maskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, #000 12%, #000 88%, transparent)" }}
        aria-label="Neighbourhoods we serve in Pune"
      >
        <div className="lp-marquee">
          {[0, 1].map((k) => (
            <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
              {AREAS.map((a) => (
                <span key={a + k} className="flex items-center whitespace-nowrap px-6 text-[0.95rem] text-zinc-500 sm:px-9">
                  {a}
                  <span className="ml-6 h-1 w-1 rounded-full bg-zinc-700 sm:ml-9" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Links ─────────────────────────────────────────────────────── */}
      <div className="relative mx-auto max-w-[1180px] px-5 pb-8 pt-16 sm:px-8 sm:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <PangatLogo size="sm" />
              <span className="font-heading text-xl font-semibold tracking-tight text-white">Pangat</span>
              <span className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[11px] text-zinc-400">पंगत</span>
            </div>
            <p className="mt-4 max-w-[19rem] text-[0.95rem] leading-relaxed text-zinc-500">
              Modern dining speed, rooted in timeless hospitality. Table ordering and kitchen orchestration for independent cafes.
            </p>
            <a href="mailto:hello@pangat.app" className="mt-5 inline-flex items-center gap-2 text-[13px] text-zinc-400 transition-colors hover:text-white">
              <Mail className="h-3.5 w-3.5" /> hello@pangat.app
            </a>
          </div>

          <FooterCol title="Product">
            <a href="#journey" onClick={anchor("#journey")}>How it works</a>
            <a href="#operations" onClick={anchor("#operations")}>Owner portal</a>
            <a href="#calculator" onClick={anchor("#calculator")}>Impact calculator</a>
            <a href="#pricing" onClick={anchor("#pricing")}>Pricing</a>
          </FooterCol>

          <FooterCol title="Get started">
            <button type="button" onClick={onOpenPilot}>Book a free trial</button>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
            <a href="/login">Owner sign in</a>
            <a href="/login?tab=pin">Kitchen sign in</a>
          </FooterCol>

          <FooterCol title="Promise">
            <span>0% commission</span>
            <span>No hardware to buy</span>
            <span>Nightly WhatsApp summary</span>
            <span>Direct founder support</span>
          </FooterCol>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.07] pt-6 text-[12px] text-zinc-600 sm:flex-row">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            © 2026 Pangat Technologies · Made in Pune, Maharashtra
          </span>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-zinc-400 transition-colors hover:bg-white/[0.08] hover:text-white"
            aria-label="Back to top"
          >
            Back to top <ArrowUp className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Oversized wordmark */}
      <div aria-hidden className="pointer-events-none relative -mb-[0.16em] select-none overflow-hidden text-center">
        <span
          className="lp-display block text-[24vw] leading-[0.82]"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0) 78%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.06em",
          }}
        >
          Pangat
        </span>
      </div>
    </footer>
  )
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-4 text-[13px] font-medium text-white">{title}</p>
      <div className="flex flex-col items-start gap-3 text-[0.95rem] text-zinc-500 [&>a]:transition-colors [&>a]:hover:text-white [&>button]:cursor-pointer [&>button]:transition-colors [&>button]:hover:text-white">
        {children}
      </div>
    </div>
  )
}
