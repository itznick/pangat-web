import { WarliPangatMural } from "@/components/traditional/WarliArt"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { Sparkles, UtensilsCrossed, Users, BellRing, HeartHandshake } from "lucide-react"

export function WarliArtSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="w-full bg-[#040404] text-white py-20 sm:py-28 relative overflow-hidden border-y border-white/10">
      {/* Background subtle radial lighting */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-amber-500/[0.04] blur-[160px] rounded-full pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-0 right-1/4 w-[500px] h-[300px] bg-emerald-500/[0.04] blur-[140px] rounded-full pointer-events-none"
        aria-hidden="true"
      />

      <div
        ref={ref}
        className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-sans font-semibold tracking-wider uppercase">
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            <span>वारली चित्रकला • Maharashtrian Heritage Art</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white font-heading leading-tight">
            The Sacred Rhythm of the{" "}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-emerald-300">
              Seated Pangat
            </span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
            Centuries before QR menus and POS terminals, Maharashtra perfected the art of synchronous dining. In a traditional Pangat, seated guests never had to wave for a waiter, plead for water, or wait for a bill. Service flowed like an attentive melody—a timeless philosophy we have translated into code.
          </p>
        </div>

        {/* Full-Width Panoramic Painting Exhibition Frame */}
        <div className="rounded-3xl border border-white/15 bg-[#090807]/90 p-4 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle frame corner accents - desktop & tablet */}
          <div className="hidden sm:block absolute top-4 left-4 text-xs font-serif text-amber-400/50 select-none">॥ श्री ॥</div>
          <div className="hidden sm:block absolute top-4 right-4 text-xs font-serif text-amber-400/50 select-none">॥ शुभम् ॥</div>

          {/* Subheader banner inside frame */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 sm:pb-6 border-b border-white/10 mb-4 sm:mb-6 text-xs font-sans">
            <div className="flex items-center gap-2 text-zinc-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Chalk-White Rice Paste Art on Deccan Basalt Stone</span>
            </div>
            <span className="text-amber-300 font-serif text-xs">
              वारली संस्कृती • सह्याद्रीच्या कुशीतील आतिथ्य परंपरा
            </span>
          </div>

          {/* Mobile swipe hint */}
          <div className="sm:hidden flex items-center justify-end text-[11px] text-zinc-400 gap-1.5 pb-2 font-sans">
            <span>Swipe mural horizontally</span>
            <span className="text-emerald-400">→</span>
          </div>

          {/* The Panoramic Warli Mural SVG */}
          <div className="overflow-x-auto py-2 sm:py-4 -mx-1 px-1">
            <div className="min-w-[760px] sm:min-w-[900px] lg:min-w-full">
              <WarliPangatMural className="opacity-95 hover:opacity-100 transition-opacity" color="#ffffff" />
            </div>
          </div>

          {/* Guided Cultural Legend: 4 Highlights below painting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 sm:pt-8 mt-5 sm:mt-6 border-t border-white/10 text-xs font-sans">
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Users className="w-4 h-4" />
                <span>01. Seated Guests (अतिथी)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                Diners seated cross-legged in a single line on floor mats with brass thalis, enjoying an uninterrupted communal feast.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <HeartHandshake className="w-4 h-4" />
                <span>02. Attentive Server (वाढपी)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                The gracious host serves hot food continuously with vessels and ladles—no guest ever has to wave or plead for attention.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-teal-400 font-semibold">
                <BellRing className="w-4 h-4" />
                <span>03. The Royal Tutari (तुतारी)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed">
                The iconic curved brass horn of Maharashtra heralds the auspicious start of the feast, honoring every arriving guest.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-white/5 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-300 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>04. Timeless Blessing</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-serif">
                &ldquo;अतिथि देवो भव • अन्न हे पूर्णब्रह्म&rdquo; — The guest is honored as divine; food shared in harmony nourishes the soul.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
