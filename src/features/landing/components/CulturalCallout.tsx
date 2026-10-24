import { Sparkles, HeartHandshake, Zap } from "lucide-react"
import { PangatLogo } from "@/components/ui/PangatLogo"

export function CulturalCallout() {
  return (
    <section className="relative py-14 lg:py-20 bg-zinc-900 text-white overflow-hidden border-y border-zinc-800">
      {/* Subtle background ambient mesh */}
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,oklch(0.527_0.154_150.069/0.12),transparent_60%)] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 left-0 w-96 h-96 bg-amber-500/5 blur-[100px] pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 sm:p-10 md:p-12 shadow-2xl backdrop-blur-sm relative overflow-hidden">
          {/* Subtle watermark Devanagari calligraphy */}
          <div
            className="absolute -right-8 -bottom-10 text-9xl font-serif font-black text-zinc-900 select-none pointer-events-none opacity-40 dark:opacity-30"
            aria-hidden="true"
          >
            पंगत
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-10">
            {/* Left Cultural Emblem Icon: The Seated Pangat */}
            <div className="shrink-0">
              <div className="p-2.5 rounded-2xl bg-zinc-900 border border-emerald-500/30 shadow-lg shadow-emerald-950/50 flex items-center justify-center">
                <PangatLogo size="lg" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>The Hospitality Heritage</span>
              </div>

              {/* The Callout Quote */}
              <blockquote className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-zinc-100 leading-snug font-heading">
                “Historically, a <span className="text-emerald-400 font-semibold underline decoration-emerald-500/40 underline-offset-4">Pangat</span> is a feast where service is swift, orderly, and attentive. We brought that philosophy into the digital era—no awkward waiter waving, no checkout bottlenecks.”
              </blockquote>

              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                In Maharashtra’s traditional dining customs, guests sat together in rows where food flowed harmoniously without a diner ever having to ask or plead. We engineered Pangat to restore that effortless grace to modern independent cafes, specialty coffee bars, and busy QSRs—letting your staff focus on genuine warmth and food craft rather than running paper receipts.
              </p>

              {/* Cultural Pillars */}
              <div className="pt-2 flex flex-wrap gap-3 sm:gap-4 text-xs font-medium text-zinc-300">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Swift, Continuous Flow
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" />
                  Dignified Guest Attention
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 font-serif">
                  <span className="text-emerald-400">प</span> Timeless Indian Hospitality
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
