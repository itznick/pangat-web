import * as React from "react"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { playKitchenChime } from "@/lib/sound"
import {
  ArrowRight,
  Play,
  Tablet,
  CheckCircle2,
  BellRing,
  Clock,
  Zap,
  QrCode,
  ShieldCheck,
  Volume2
} from "lucide-react"

interface HeroProps {
  onOpenPilot: () => void
  onOpenDemo: () => void
}

export function Hero({ onOpenPilot, onOpenDemo }: HeroProps) {
  const [audioChimeActive, setAudioChimeActive] = React.useState(false)
  const [ticketStatus, setTicketStatus] = React.useState<"new" | "preparing" | "ready">("new")
  const [mobileTab, setMobileTab] = React.useState<"diner" | "kitchen">("diner")

  const handleTestChime = () => {
    playKitchenChime()
    setAudioChimeActive(true)
    setTimeout(() => setAudioChimeActive(false), 2400)
  }

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-28 bg-transparent text-white">
      {/* Subtle Apple-style spotlight glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[1100px] h-[550px] pointer-events-none opacity-40"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.08) 0%, rgba(16, 185, 129, 0.04) 35%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.04] backdrop-blur-xl mb-6 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-normal tracking-wide text-zinc-300">
              Zero hardware · Table ordering & live KDS
            </span>
          </div>

          {/* Headline - Apple typography */}
          <h1 className="max-w-4xl text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-bold tracking-tight text-white leading-[1.08] font-heading">
            Turn tables faster.
            <span className="block text-zinc-400 font-medium mt-1">Without rushing your guests.</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 max-w-2xl text-base sm:text-xl text-zinc-400 leading-relaxed font-normal">
            No app downloads for diners. No thermal paper jams during peak rush. Just instant 30-second UPI table ordering, and a live kitchen display on any phone or tablet.
          </p>

          {/* CTAs - Apple Style Pills */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenPilot}
              className="w-full sm:w-auto px-8 h-12 sm:h-13 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold text-sm sm:text-base transition-all duration-200 active:scale-[0.98] shadow-lg shadow-white/5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Try Free for 7 Days</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-7 h-12 sm:h-13 rounded-full bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/10 font-medium text-sm sm:text-base backdrop-blur-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Live Table Demo</span>
            </button>
          </div>

          {/* Reassurances */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-xs sm:text-sm text-zinc-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
              <span>Runs in Safari & Chrome</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
              <span>Flat ₹699/month · Zero commissions</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
              <span>No credit card required</span>
            </div>
          </div>
        </div>

        {/* HERO SHOWCASE STAGE */}
        <div className="mt-14 sm:mt-20 lg:mt-24 relative">
          <div className="relative rounded-3xl border border-white/[0.08] bg-zinc-950/70 backdrop-blur-2xl p-5 sm:p-8 md:p-10 shadow-2xl overflow-hidden ring-1 ring-white/[0.04]">
            {/* Top Frame Bar */}
            <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-white/[0.08] mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="h-2.5 w-2.5 rounded-full bg-zinc-700" />
                <span className="ml-2 text-xs font-normal text-zinc-400 hidden sm:inline">
                  Pangat Dining Network · Table 04 to Barista Station
                </span>
                <span className="ml-1 text-[11px] font-normal text-zinc-400 sm:hidden">
                  Live Dining Network
                </span>
              </div>

              {/* Sound Test Button */}
              <button
                type="button"
                onClick={handleTestChime}
                className={`inline-flex items-center gap-1.5 sm:gap-2 text-xs font-medium px-3 sm:px-4 py-1.5 rounded-full border transition-all cursor-pointer ${
                  audioChimeActive
                    ? "bg-amber-400/20 border-amber-400/50 text-amber-300 ring-1 ring-amber-400/30"
                    : "bg-white/[0.06] border-white/10 text-zinc-300 hover:bg-white/[0.1] hover:text-white"
                }`}
              >
                <Volume2 className={`w-3.5 h-3.5 ${audioChimeActive ? "animate-pulse text-amber-300" : "text-zinc-400"}`} />
                <span>{audioChimeActive ? "Kitchen Chime Playing" : "Test Audio Chime"}</span>
              </button>
            </div>

            {/* Mobile / Tablet Segmented Switcher */}
            <div className="flex lg:hidden items-center justify-center p-1 bg-black/60 rounded-full border border-white/[0.08] mb-6">
              <button
                type="button"
                onClick={() => setMobileTab("diner")}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mobileTab === "diner"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>1. Diner View</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("kitchen")}
                className={`flex-1 py-1.5 px-3 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  mobileTab === "kitchen"
                    ? "bg-white text-zinc-950 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Tablet className="w-3.5 h-3.5" />
                <span>2. Kitchen KDS</span>
              </button>
            </div>

            {/* Stage Grid: Diner Table Standee + Sync Bridge + Kitchen Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              {/* Left: Diner Table View (Span 5) */}
              <div
                className={`${
                  mobileTab === "diner" ? "flex" : "hidden"
                } lg:flex lg:col-span-5 rounded-2xl border border-white/[0.08] bg-black/40 p-5 sm:p-7 flex-col justify-between space-y-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-200">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-normal">Acrylic Standee</span>
                      <h3 className="text-sm sm:text-base font-semibold text-white leading-tight font-heading">
                        Table 04 · Seated Diner
                      </h3>
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-full font-normal">
                    Instant Web View
                  </span>
                </div>

                {/* Simulated Diner Mobile Screen */}
                <div className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4 sm:p-5 space-y-4 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-white text-sm">Artisanal Cold Brew (16hr)</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Oat Milk · Less Ice</p>
                    </div>
                    <span className="font-semibold text-zinc-100 text-sm tabular-nums">₹280</span>
                  </div>

                  <div className="flex justify-between items-start pt-3 border-t border-white/[0.06]">
                    <div>
                      <p className="font-semibold text-white text-sm">Smoked Sourdough Toastie</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Extra Crispy · Herb Butter</p>
                    </div>
                    <span className="font-semibold text-zinc-100 text-sm tabular-nums">₹240</span>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Total: ₹520</span>
                    <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Paid via UPI</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Zap className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
                  <span>Diner ordered and settled in 28 seconds</span>
                </div>
              </div>

              {/* Center: Sync Connection (Span 2) */}
              <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-center space-y-3 py-6">
                <div className="w-10 h-10 rounded-full border border-white/10 bg-white/[0.04] flex items-center justify-center text-zinc-200">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest">
                  &lt;18ms Sync
                </span>
                <AnimatedBeam duration={2.5} />
                <span className="text-xs text-zinc-400 text-center leading-relaxed">
                  Zero thermal rolls.<br />Instant kitchen alert.
                </span>
              </div>

              {/* Right: Kitchen KDS Station (Span 5) */}
              <div
                className={`${
                  mobileTab === "kitchen" ? "flex" : "hidden"
                } lg:flex lg:col-span-5 rounded-2xl border border-white/[0.08] bg-black/40 p-5 sm:p-7 flex-col justify-between space-y-5`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center text-zinc-200">
                      <Tablet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] text-zinc-400 block font-normal">Prep Station</span>
                      <h3 className="text-sm sm:text-base font-semibold text-white leading-tight font-heading">
                        Kitchen Display System
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all ${
                      audioChimeActive
                        ? "bg-amber-400/20 border-amber-400/50 text-amber-300"
                        : "bg-white/[0.04] border-white/[0.08] text-zinc-300"
                    }`}
                  >
                    <BellRing className={`w-3 h-3 ${audioChimeActive ? "animate-spin text-amber-300" : "text-emerald-400"}`} />
                    <span className="font-normal">
                      {audioChimeActive ? "Ringing..." : "Live Active"}
                    </span>
                  </div>
                </div>

                {/* KDS Order Card */}
                <div className="rounded-xl border border-white/[0.08] bg-zinc-900/40 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-white/[0.08] border border-white/10 text-zinc-200 font-mono text-xs">
                        #T-104
                      </span>
                      <span className="text-sm font-semibold text-white font-heading">Table 04</span>
                      <span className="text-xs text-zinc-400">(2 items)</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-zinc-300 bg-white/[0.04] border border-white/[0.08] px-2.5 py-0.5 rounded-full font-mono">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>01:14</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex items-baseline justify-between text-zinc-200">
                      <span>1x Artisanal Cold Brew <span className="text-zinc-400">[Oat Milk]</span></span>
                      <span className="text-xs text-emerald-400 font-medium">PAID ✓</span>
                    </div>
                    <div className="flex items-baseline justify-between text-zinc-200">
                      <span>1x Smoked Sourdough Toastie <span className="text-zinc-400">[Extra Crispy]</span></span>
                      <span className="text-xs text-emerald-400 font-medium">PAID ✓</span>
                    </div>
                  </div>

                  {/* Interactive Status Controls */}
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTicketStatus("preparing")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          ticketStatus === "preparing"
                            ? "bg-white text-zinc-950 font-semibold"
                            : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
                        }`}
                      >
                        Preparing
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketStatus("ready")}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                          ticketStatus === "ready"
                            ? "bg-white text-zinc-950 font-semibold"
                            : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
                        }`}
                      >
                        Mark Ready ✓
                      </button>
                    </div>

                    <span className="text-xs text-zinc-400 capitalize font-normal">
                      State: {ticketStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>Runs in browser on existing iPad or phone</span>
                  <span className="text-zinc-200 font-medium">Zero Hardware</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
