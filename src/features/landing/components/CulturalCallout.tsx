import { PangatLogo } from "@/components/ui/PangatLogo"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { HeartHandshake, Zap, Sparkles } from "lucide-react"

export function CulturalCallout() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="py-20 sm:py-28 bg-transparent text-white relative overflow-hidden border-t border-white/[0.06]">
      <div
        ref={ref}
        className={`max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="relative rounded-3xl border border-white/[0.08] bg-zinc-950/50 backdrop-blur-2xl p-6 sm:p-10 md:p-12 shadow-2xl overflow-hidden ring-1 ring-white/[0.04]">
          <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 lg:gap-12 relative z-10">
            {/* The Cultural Heritage Artifact Plaque (Left Side) */}
            <div className="w-full md:w-64 lg:w-72 shrink-0 rounded-2xl border border-white/[0.08] bg-black/60 p-6 flex flex-col items-center text-center justify-between shadow-xl">
              <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium tracking-widest select-none">
                <span>॥ पंगत ॥</span>
              </div>

              <div className="my-5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-inner flex items-center justify-center">
                <PangatLogo size="lg" />
              </div>

              <div className="space-y-1 mb-4">
                <span className="text-base font-semibold text-white font-heading block">
                  Pangat (पंगत)
                </span>
                <span className="text-xs text-zinc-400 block font-normal">
                  The Seated Feast Tradition
                </span>
              </div>

              {/* Cultural Pillars micro-list */}
              <div className="w-full pt-4 border-t border-white/[0.06] space-y-2 text-xs text-left text-zinc-400 font-sans">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Uninterrupted dining rhythm</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Zero waiter waving required</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>Synchronous hospitality flow</span>
                </div>
              </div>

              <div className="pt-3 text-[11px] text-zinc-500 border-t border-white/[0.06] w-full text-center">
                Atithi Devo Bhava · Est. 17th Century
              </div>
            </div>

            {/* Editorial Content (Right Side) */}
            <div className="space-y-6 text-center md:text-left grow flex flex-col justify-between py-1">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-normal">
                  <Sparkles className="w-3 h-3 text-zinc-400" />
                  <span>Design Philosophy</span>
                </div>

                {/* Callout Quote */}
                <blockquote className="text-2xl sm:text-3xl md:text-3xl font-medium tracking-tight text-white leading-snug font-heading">
                  “Historically, a Pangat is a feast where service is swift, orderly, and attentive. We brought that philosophy into software—eliminating waiter waving and checkout bottlenecks.”
                </blockquote>

                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal max-w-2xl">
                  In Maharashtra’s traditional dining customs, seated guests enjoyed an uninterrupted flow of warm hospitality without having to plead for attention. Pangat brings that seamless rhythm to independent cafes, specialty coffee roasters, and high-turnover QSRs—letting your staff focus on craft and hospitality instead of chasing paper slips.
                </p>
              </div>

              {/* 3 Pillars */}
              <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2.5 text-xs font-normal text-zinc-300 font-sans">
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                  <Zap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>30-Second Ordering Flow</span>
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                  <HeartHandshake className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Attentive Guest Experience</span>
                </span>
                <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300">
                  <span className="text-zinc-400 font-medium font-sans">प</span>
                  <span>Rooted in Timeless Hospitality</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
