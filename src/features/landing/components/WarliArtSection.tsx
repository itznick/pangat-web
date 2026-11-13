import { WarliPangatMural } from "@/components/traditional/WarliArt"
import { useScrollReveal } from "@/hooks/useScrollReveal"
import { UtensilsCrossed, Users, BellRing, HeartHandshake, Sparkles } from "lucide-react"

export function WarliArtSection() {
  const { ref, isVisible } = useScrollReveal()

  return (
    <section className="w-full bg-[#050505] text-white py-20 sm:py-28 relative overflow-hidden border-t border-white/[0.06]">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-normal">
            <UtensilsCrossed className="w-3.5 h-3.5 text-zinc-400" />
            <span>वारली चित्रकला · Heritage Art Exhibition</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white font-heading leading-tight">
            Centuries before QR menus.
            <span className="block text-zinc-400 font-medium mt-1">Maharashtra perfected synchronous dining.</span>
          </h2>

          <p className="text-base sm:text-lg text-zinc-400 leading-relaxed font-normal max-w-2xl mx-auto">
            In a traditional Pangat, seated guests never had to wave for a waiter, plead for water, or wait for a bill. Service flowed like an attentive melody—a timeless philosophy translated into code.
          </p>
        </div>

        {/* Full-Width Panoramic Painting Exhibition Frame */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#080808] p-5 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden ring-1 ring-white/[0.04]">
          {/* Subheader banner inside frame */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-5 border-b border-white/[0.06] mb-6 text-xs">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-medium text-zinc-200">Chalk-White Rice Paste on Deccan Basalt Stone</span>
            </div>
            <span className="text-zinc-400 text-xs">
              वारली संस्कृती · सह्याद्रीच्या कुशीतील आतिथ्य परंपरा
            </span>
          </div>

          {/* Mobile swipe hint */}
          <div className="sm:hidden flex items-center justify-end text-[11px] text-zinc-500 gap-1.5 pb-2">
            <span>Swipe mural</span>
            <span>→</span>
          </div>

          {/* The Panoramic Warli Mural SVG */}
          <div className="overflow-x-auto py-3 -mx-1 px-1">
            <div className="min-w-[760px] sm:min-w-[900px] lg:min-w-full">
              <WarliPangatMural className="opacity-90 hover:opacity-100 transition-opacity" color="#ffffff" />
            </div>
          </div>

          {/* Guided Cultural Legend: 4 Highlights below painting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 sm:pt-8 mt-6 border-t border-white/[0.06] text-xs">
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-200 font-medium">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>01. Seated Guests (अतिथी)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                Diners seated in a synchronized row, receiving courses simultaneously without interruption.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-200 font-medium">
                <HeartHandshake className="w-3.5 h-3.5 text-zinc-400" />
                <span>02. Attentive Server (वाढपी)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                Servers anticipate dining rhythm beforehand so diners never need to plead for service.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-200 font-medium">
                <BellRing className="w-3.5 h-3.5 text-zinc-400" />
                <span>03. The Royal Tutari (तुतारी)</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                The curved brass horn heralds each course with distinction—echoed in our instant kitchen chime.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-1.5">
              <div className="flex items-center gap-2 text-zinc-200 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>04. Feast in Harmony</span>
              </div>
              <p className="text-zinc-400 leading-relaxed font-normal">
                अन्न हे पूर्णब्रह्म — Dining is elevated from a transactional chore to an experience of communal flow.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
