import * as React from "react"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { BorderBeam } from "@/components/magicui/border-beam"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import { Meteors } from "@/components/magicui/meteors"
import { SanskarBharatiMandala } from "@/components/traditional/WarliArt"
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
  ShieldCheck
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
    <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-24 bg-transparent text-white">
      {/* Background Magic UI Meteors */}
      <Meteors number={14} />

      {/* Traditional Maharashtrian Sanskar Bharati Rangoli Background Aura - Kept on Big Screens, Hidden on Mobile/Tablet to keep headline ultra-sharp */}
      <div className="hidden lg:block absolute top-10 left-1/2 -translate-x-1/2 -z-10 opacity-[0.06] pointer-events-none select-none">
        <SanskarBharatiMandala size={640} color="#ffffff" />
      </div>

      {/* Radial atmosphere & dot-grid texture */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[1000px] h-[550px] pointer-events-none opacity-60"
        style={{
          background: "radial-gradient(ellipse at 50% 10%, rgba(16, 185, 129, 0.22), rgba(5, 150, 105, 0.08) 45%, transparent 75%)",
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" aria-hidden="true" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center">
          {/* Conversational Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 backdrop-blur-md mb-5 sm:mb-6 shadow-lg shadow-emerald-950/60">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] sm:text-sm font-medium tracking-wide text-emerald-300">
              Zero hardware table ordering & kitchen tracking
            </span>
          </div>

          {/* Headline with editorial balance - fully responsive across mobile, tablet & desktop */}
          <h1 className="max-w-4xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15] sm:leading-[1.1] font-heading">
            Turn tables{" "}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              faster
            </span>
            , without rushing your guests.
          </h1>

          {/* Conversational Subheadline with generous readable font */}
          <p className="mt-4 sm:mt-5 max-w-2xl text-sm sm:text-lg md:text-xl text-zinc-300 leading-relaxed font-normal px-1">
            No app downloads for diners. No thermal printers jamming on a busy Friday evening.
            Just quick 30-second UPI table ordering, and a kitchen display that runs on any existing phone or tablet.
          </p>

          {/* CTAs: Natural, not pushy */}
          <div className="mt-7 sm:mt-9 flex flex-col sm:flex-row items-center gap-3.5 sm:gap-4 w-full sm:w-auto">
            <ShimmerButton
              onClick={onOpenPilot}
              shimmerColor="#6ee7b7"
              shimmerDuration="3s"
              background="rgba(5, 150, 105, 1)"
              borderRadius="14px"
              className="w-full sm:w-auto text-sm sm:text-base font-bold px-8 h-12 sm:h-13 shadow-xl shadow-emerald-950/80 cursor-pointer"
            >
              <span>Try Free for 7 Days</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </ShimmerButton>

            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-6 h-12 sm:h-13 rounded-xl border border-white/10 hover:border-white/20 bg-zinc-900/60 text-zinc-200 hover:text-white font-medium text-sm sm:text-base transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              <span>Try Live Table Demo</span>
            </button>
          </div>

          {/* Natural reassurances */}
          <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Works directly in Safari & Chrome</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Flat ₹699/month · Zero commission cut</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No credit card needed to test</span>
            </div>
          </div>
        </div>

        {/* HERO SHOWCASE CARD: With Magic UI BorderBeam & AnimatedBeam */}
        <div className="mt-12 sm:mt-20 lg:mt-24 relative">
          <div className="relative rounded-3xl border border-white/10 bg-zinc-900/80 backdrop-blur-2xl p-4 sm:p-8 lg:p-12 shadow-2xl overflow-hidden">
            {/* Magic UI BorderBeam traveling around the hero stage */}
            <BorderBeam size={280} duration={14} borderWidth={2} colorFrom="#10b981" colorTo="#f59e0b" />

            {/* Top Frame Bar */}
            <div className="flex items-center justify-between pb-4 sm:pb-5 border-b border-white/10 mb-5 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-rose-500/80" />
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm font-sans font-medium text-zinc-300 tracking-normal hidden sm:inline">
                  Pangat Live Network · Table 04 to Barista Station
                </span>
                <span className="ml-1 text-[11px] font-sans font-medium text-zinc-400 sm:hidden">
                  Live Network
                </span>
              </div>

              {/* Sound Test Button with Audible Chime */}
              <button
                type="button"
                onClick={handleTestChime}
                className={`inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-sans font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-all cursor-pointer shadow-sm ${
                  audioChimeActive
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40"
                    : "bg-zinc-800/90 border-white/10 text-zinc-200 hover:bg-zinc-800 hover:border-emerald-500/40"
                }`}
              >
                <div className="flex items-end gap-0.5 h-3 sm:h-3.5">
                  <span className={`w-0.5 rounded-full bg-current transition-all ${audioChimeActive ? "h-3 sm:h-3.5 animate-bounce" : "h-1.5"}`} />
                  <span className={`w-0.5 rounded-full bg-current transition-all ${audioChimeActive ? "h-2 sm:h-2.5 animate-pulse" : "h-2"}`} />
                  <span className={`w-0.5 rounded-full bg-current transition-all ${audioChimeActive ? "h-3 sm:h-3.5 animate-bounce delay-75" : "h-2.5"}`} />
                  <span className={`w-0.5 rounded-full bg-current transition-all ${audioChimeActive ? "h-2 animate-pulse" : "h-1.5"}`} />
                  <span className={`w-0.5 rounded-full bg-current transition-all ${audioChimeActive ? "h-2.5 sm:h-3 animate-bounce delay-150" : "h-2"}`} />
                </div>
                <span>{audioChimeActive ? "🔔 Chime!" : "Test Chime"}</span>
              </button>
            </div>

            {/* Mobile / Tablet Segmented Switcher (Visible on < lg, hidden on big screens) */}
            <div className="flex lg:hidden items-center justify-center p-1 bg-zinc-950/90 rounded-xl border border-white/10 mb-5 sm:mb-6">
              <button
                type="button"
                onClick={() => setMobileTab("diner")}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  mobileTab === "diner"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Diner Table View</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileTab("kitchen")}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
                  mobileTab === "kitchen"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Tablet className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Kitchen Live KDS</span>
              </button>
            </div>

            {/* Stage Grid: Table Standee + Animated Beam + Kitchen Display */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
              {/* Left: Diner Table View (Span 5) - Full width on mobile when selected, Col 5 on Desktop */}
              <div
                className={`${
                  mobileTab === "diner" ? "flex" : "hidden"
                } lg:flex lg:col-span-5 rounded-2xl border border-white/10 bg-zinc-950/80 p-5 sm:p-7 flex-col justify-between space-y-5 shadow-inner`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-sans text-zinc-400 block">Acrylic Standee</span>
                      <h3 className="text-base font-bold text-white leading-tight font-heading">Table 04 · Seated Diner</h3>
                    </div>
                  </div>
                  <span className="text-xs font-sans text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1 rounded-full font-medium">
                    No App Needed
                  </span>
                </div>

                {/* Simulated Diner Mobile Screen */}
                <div className="rounded-xl border border-white/10 bg-zinc-900/90 p-4 sm:p-5 space-y-4 text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-white text-sm sm:text-base">Artisanal Cold Brew (16hr)</p>
                      <p className="text-xs text-zinc-400 mt-1">Oat Milk · Less Ice</p>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm sm:text-base tabular-nums">₹280</span>
                  </div>

                  <div className="flex justify-between items-start pt-3 border-t border-white/5">
                    <div>
                      <p className="font-bold text-white text-sm sm:text-base">Smoked Sourdough Toastie</p>
                      <p className="text-xs text-zinc-400 mt-1">Extra Crispy · Herb Butter</p>
                    </div>
                    <span className="font-bold text-emerald-400 text-sm sm:text-base tabular-nums">₹240</span>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-xs text-zinc-400">Total: ₹520</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2.5 sm:px-3 py-1.5 rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                      <span>UPI Paid (Google Pay)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-zinc-300 font-sans">
                  <Zap className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Diner customized and paid in 28 seconds</span>
                </div>
              </div>

              {/* Center: Magic UI AnimatedBeam Connection (Span 2) - Desktop Only */}
              <div className="lg:col-span-2 hidden lg:flex flex-col items-center justify-center space-y-3 py-6">
                <div className="w-12 h-12 rounded-full border border-emerald-500/30 bg-emerald-950/80 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-950">
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <span className="text-xs font-sans font-bold text-emerald-400 uppercase tracking-widest">
                  &lt;18ms Sync
                </span>
                <AnimatedBeam duration={2} />
                <span className="text-xs text-zinc-300 text-center leading-relaxed">
                  Zero paper rolls.<br />Instant live chime.
                </span>
              </div>

              {/* Right: Kitchen KDS Station (Span 5) - Full width on mobile when selected, Col 5 on Desktop */}
              <div
                className={`${
                  mobileTab === "kitchen" ? "flex" : "hidden"
                } lg:flex lg:col-span-5 rounded-2xl border border-emerald-500/30 bg-zinc-950/90 p-5 sm:p-7 flex-col justify-between space-y-5 shadow-xl`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <Tablet className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-sans text-zinc-400 block">Station 1</span>
                      <h3 className="text-base font-bold text-white leading-tight font-heading">Kitchen Display System</h3>
                    </div>
                  </div>

                  <div
                    className={`flex items-center gap-1.5 text-xs px-3 sm:px-3.5 py-1.5 rounded-full border transition-all ${
                      audioChimeActive
                        ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40"
                        : "bg-emerald-950/70 border-emerald-700 text-emerald-300"
                    }`}
                  >
                    <BellRing className={`w-3.5 h-3.5 ${audioChimeActive ? "animate-spin text-amber-300" : "text-emerald-400"}`} />
                    <span className="font-sans font-medium">
                      {audioChimeActive ? "CHIME RINGING" : "Audio Active"}
                    </span>
                  </div>
                </div>

                {/* KDS Order Card with larger readable typography */}
                <div className="rounded-xl border border-emerald-500/40 bg-zinc-900/90 p-4 sm:p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-950 border border-emerald-600 text-emerald-200 font-bold text-xs tabular-nums">
                        #T-104
                      </span>
                      <span className="text-base font-bold text-white font-heading">Table 04</span>
                      <span className="text-xs text-zinc-400 font-sans">(2 items)</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2.5 sm:px-3 py-1 rounded-full font-medium tabular-nums">
                      <Clock className="w-3.5 h-3.5 animate-spin" />
                      <span>01:14</span>
                    </div>
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-sm">
                    <div className="flex items-baseline justify-between text-zinc-200">
                      <span>1x Artisanal Cold Brew <strong className="text-amber-400">[OAT MILK]</strong></span>
                      <span className="text-xs text-emerald-400 font-semibold">PAID ✓</span>
                    </div>
                    <div className="flex items-baseline justify-between text-zinc-200">
                      <span>1x Smoked Sourdough Toastie <strong className="text-amber-400">[CRISPY]</strong></span>
                      <span className="text-xs text-emerald-400 font-semibold">PAID ✓</span>
                    </div>
                  </div>

                  {/* Interactive Status Controls */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTicketStatus("preparing")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          ticketStatus === "preparing"
                            ? "bg-amber-500 text-zinc-950 font-bold"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        Preparing
                      </button>
                      <button
                        type="button"
                        onClick={() => setTicketStatus("ready")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          ticketStatus === "ready"
                            ? "bg-emerald-500 text-zinc-950 font-bold"
                            : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                        }`}
                      >
                        Mark Ready ✓
                      </button>
                    </div>

                    <span className="text-xs font-sans text-emerald-400 capitalize font-medium">
                      State: {ticketStatus}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-300 font-sans">
                  <span>Runs in browser on any existing tablet or phone</span>
                  <span className="text-emerald-400 font-semibold">Zero Hardware</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
