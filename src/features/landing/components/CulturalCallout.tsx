import { PangatLogo } from "@/components/ui/PangatLogo"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { Sparkles, HeartHandshake, Zap } from "lucide-react"

export function CulturalCallout() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="py-10 sm:py-16 md:py-20 bg-transparent text-white relative overflow-hidden border-y border-white/5">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_70%)] pointer-events-none"
        aria-hidden="true"
      />

      <div
        ref={ref}
        className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="relative rounded-3xl border border-white/10 bg-zinc-900/60 backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-2xl overflow-hidden">
          {/* Subtle Devanagari calligraphy watermark - hidden on small mobile to reduce clutter */}
          <div
            className="hidden sm:block absolute -right-6 -bottom-10 text-8xl sm:text-9xl font-serif font-black text-white/5 select-none pointer-events-none tracking-tighter"
            aria-hidden="true"
          >
            पंगत
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-6 sm:gap-8 md:gap-10 relative z-10">
            {/* The Cultural Heritage Artifact Plaque (Left Side) */}
            <div className="w-full md:w-72 shrink-0 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-zinc-900/95 via-zinc-950 to-zinc-950 p-5 sm:p-6 flex flex-col items-center text-center justify-between shadow-2xl relative overflow-hidden">
              {/* Subtle top inscription */}
              <div className="flex items-center gap-2 text-xs font-serif text-amber-300 font-bold tracking-widest select-none">
                <span>॥</span>
                <span className="text-sm">पंगत</span>
                <span>॥</span>
              </div>

              {/* Elevated Logo Pedestal */}
              <div className="relative group my-2 sm:my-3">
                <div className="absolute -inset-2.5 rounded-3xl bg-gradient-to-r from-emerald-500/35 to-amber-500/25 blur-md opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="relative p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-emerald-500/40 shadow-xl flex items-center justify-center">
                  <PangatLogo size="lg" />
                </div>
              </div>

              <div className="space-y-0.5 mb-2">
                <span className="text-base sm:text-lg font-bold text-white font-heading block">
                  Pangat (पंगत)
                </span>
                <span className="text-xs text-emerald-400 font-sans font-medium block">
                  The Seated Feast Tradition
                </span>
              </div>

              {/* Cultural Pillars micro-list */}
              <div className="w-full pt-3 border-t border-white/10 space-y-1.5 text-xs text-left text-zinc-300 font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Uninterrupted dining rhythm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>No waiter waving required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Attentive prompt hospitality</span>
                </div>
              </div>

              <div className="pt-2.5 text-[11px] text-zinc-400 font-serif border-t border-white/5 w-full text-center">
                Atithi Devo Bhava • Est. 17th Century
              </div>
            </div>

            {/* Editorial Content (Right Side) */}
            <div className="space-y-5 text-center md:text-left grow flex flex-col justify-between py-1">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-sans font-medium tracking-wide">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>The Hospitality Heritage</span>
                </div>

                {/* The Callout Quote with comfortable responsive sizing */}
                <blockquote className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-zinc-100 leading-snug font-heading">
                  “Historically, a <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Pangat</span> is a feast where service is swift, orderly, and attentive. We brought that philosophy into the digital era—no awkward waiter waving, no checkout bottlenecks.”
                </blockquote>

                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal max-w-2xl">
                  In Maharashtra’s traditional dining customs, seated guests enjoyed an uninterrupted flow of warm hospitality without having to plead for attention. Pangat brings that seamless rhythm to independent cafes, specialty coffee roasters, and high-turnover QSRs—letting your staff focus on great craft and warm smiles instead of running paper slips.
                </p>
              </div>

              {/* 3 Pillars - Uniform font-sans for all chips */}
              <div className="pt-3 flex flex-wrap justify-center md:justify-start gap-2.5 sm:gap-3 text-xs sm:text-sm font-medium text-zinc-300 font-sans">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-950/80 border border-white/10 text-zinc-200">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Synchronous 30s Flow</span>
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-950/80 border border-white/10 text-zinc-200">
                  <HeartHandshake className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Dignified Attentive Service</span>
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-zinc-950/80 border border-white/10 text-zinc-200">
                  <span className="text-emerald-400 font-bold font-serif">प</span>
                  <span>Timeless Craft Hospitality</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
