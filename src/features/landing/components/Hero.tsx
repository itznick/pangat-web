import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Play,
  Volume2,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  BellRing,
  Smartphone,
  Tablet,
  Check
} from "lucide-react"

interface HeroProps {
  onOpenPilot: () => void
  onOpenDemo: () => void
}

export function Hero({ onOpenPilot, onOpenDemo }: HeroProps) {
  // Interactive Hero Mockup state
  const [activeTab, setActiveTab] = React.useState<"dual" | "guest" | "kitchen">("dual")
  const [orderStatus, setOrderStatus] = React.useState<"new" | "preparing" | "ready">("new")
  const [audioChimeTriggered, setAudioChimeTriggered] = React.useState(false)
  const [selectedModifier, setSelectedModifier] = React.useState<"oat" | "almond" | "dairy">("oat")
  const [iceLevel, setIceLevel] = React.useState<"regular" | "less">("less")

  const handleSimulateChime = () => {
    setAudioChimeTriggered(true)
    setTimeout(() => setAudioChimeTriggered(false), 2400)
  }

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-emerald-50/40 via-white to-zinc-50/60 dark:from-zinc-950 dark:via-zinc-900/40 dark:to-zinc-950">
      {/* Background decorative glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[800px] h-[400px] bg-emerald-200/30 blur-[130px] rounded-full pointer-events-none dark:bg-emerald-950/20"
        aria-hidden="true"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Micro-Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200/80 bg-white/80 shadow-xs backdrop-blur-sm dark:bg-zinc-900/80 dark:border-emerald-800/80 mb-6 group hover:border-emerald-400 transition-colors">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
              Zero-Hardware Dining & Kitchen Orchestration
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
              30s Table-to-Kitchen Sync
            </span>
          </div>

          {/* H1 Headline */}
          <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.12]">
            Turn tables faster.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-700 dark:from-emerald-400 dark:to-teal-300">
              Zero billing queues.
            </span>{" "}
            Zero hardware.
          </h1>

          {/* Subheadline */}
          <p className="mt-5 max-w-2xl text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
            Pangat connects your diner's table to your kitchen in 30 seconds.
            Instant UPI payments, zero thermal printers, and live kitchen tracking on any existing phone or tablet.
          </p>

          {/* Primary & Secondary CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
            <Button
              onClick={onOpenPilot}
              size="lg"
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base px-8 h-12 shadow-lg shadow-emerald-700/25 gap-2 cursor-pointer transition-all hover:translate-y-[-1px]"
            >
              <Sparkles className="w-5 h-5 text-emerald-200" />
              Launch a 7-Day Pilot (Free)
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <Button
              onClick={onOpenDemo}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 font-medium text-base px-6 h-12 gap-2 shadow-xs dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-850 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-zinc-800 dark:fill-zinc-200" />
              Try Live Table Demo
            </Button>
          </div>

          {/* Micro Proof Points */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-500 dark:text-zinc-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>No app download needed for guests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Works in Safari & Chrome</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Flat ₹699/mo · Zero commission cut</span>
            </div>
          </div>
        </div>

        {/* HERO MOCKUP PREVIEW: Dual-View Interface Card */}
        <div className="mt-12 lg:mt-16">
          {/* Mockup Header Navigation Toggles for Mobile vs Desktop */}
          <div className="flex items-center justify-between pb-3 max-w-5xl mx-auto px-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:inline-block">
                Interactive Preview:
              </span>
              <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setActiveTab("dual")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    activeTab === "dual"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
                  }`}
                >
                  Dual View (Diner + KDS)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("guest")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all sm:hidden ${
                    activeTab === "guest"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Diner Mobile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("kitchen")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all sm:hidden ${
                    activeTab === "kitchen"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-zinc-600 hover:text-zinc-900"
                  }`}
                >
                  Kitchen Tablet
                </button>
              </div>
            </div>

            {/* Quick Chime Simulation Trigger */}
            <button
              onClick={handleSimulateChime}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-all cursor-pointer ${
                audioChimeTriggered
                  ? "bg-amber-100 border-amber-300 text-amber-900 ring-2 ring-amber-400/50"
                  : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
              }`}
            >
              <Volume2 className={`w-3.5 h-3.5 ${audioChimeTriggered ? "text-amber-600 animate-bounce" : "text-zinc-500"}`} />
              <span>{audioChimeTriggered ? "🔔 Chime Ringing!" : "Test Kitchen Sound"}</span>
            </button>
          </div>

          {/* The Outer Device Showcase Container */}
          <div className="relative max-w-5xl mx-auto rounded-3xl border border-zinc-200/90 bg-zinc-950 p-3 sm:p-5 shadow-2xl shadow-zinc-900/20 dark:border-zinc-800">
            {/* Top Bar for the frame */}
            <div className="flex items-center justify-between pb-3 px-2 border-b border-zinc-800/80 mb-4 text-xs text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500 inline-block opacity-80" />
                <span className="h-3 w-3 rounded-full bg-amber-500 inline-block opacity-80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block opacity-80" />
                <span className="ml-2 text-zinc-400 font-sans font-medium text-xs hidden sm:inline">
                  pangat.app · Live Sync Network
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  <Zap className="w-3 h-3" />
                  WebSocket: &lt;18ms latency
                </span>
              </div>
            </div>

            {/* Grid Layout: Left Mobile + Right Tablet */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* LEFT VIEW: Mobile Diner Order Interface (Span 5 on LG) */}
              <div
                className={`lg:col-span-5 ${
                  activeTab === "kitchen" ? "hidden lg:block" : "block"
                }`}
              >
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg text-zinc-100">
                  {/* Smartphone Top Notch & Header */}
                  <div className="bg-zinc-950 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-semibold tracking-wide text-zinc-200">
                        Table 04
                      </span>
                    </div>
                    <Badge variant="emerald" className="text-[10px] py-0 px-2">
                      Direct UPI Order
                    </Badge>
                  </div>

                  {/* Diner Mobile Content */}
                  <div className="p-4 space-y-3.5 bg-gradient-to-b from-zinc-900 to-zinc-950">
                    {/* Cafe Branding in App */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">
                          Roast & Toast Cafe
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Pune · FC Road Branch
                        </p>
                      </div>
                      <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md font-mono">
                        No App Req
                      </span>
                    </div>

                    {/* Item 1: Artisanal Cold Brew with Modifiers */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 hover:border-zinc-700 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <h5 className="text-xs font-bold text-zinc-100">
                              Artisanal Cold Brew (16hr)
                            </h5>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Single origin Chikmagalur arabica
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          ₹240
                        </span>
                      </div>

                      {/* Interactive Modifiers preview */}
                      <div className="mt-2.5 pt-2 border-t border-zinc-800 text-[10px] space-y-1.5">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Milk Option:</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setSelectedModifier("oat")}
                              className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                                selectedModifier === "oat"
                                  ? "bg-emerald-600 text-white font-semibold"
                                  : "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              Oat (+₹40)
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedModifier("dairy")}
                              className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                                selectedModifier === "dairy"
                                  ? "bg-emerald-600 text-white font-semibold"
                                  : "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              Standard
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Ice Preference:</span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setIceLevel("less")}
                              className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                                iceLevel === "less"
                                  ? "bg-emerald-600 text-white font-semibold"
                                  : "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              Less Ice
                            </button>
                            <button
                              type="button"
                              onClick={() => setIceLevel("regular")}
                              className={`px-1.5 py-0.5 rounded text-[10px] cursor-pointer ${
                                iceLevel === "regular"
                                  ? "bg-emerald-600 text-white font-semibold"
                                  : "bg-zinc-800 text-zinc-300"
                              }`}
                            >
                              Regular
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Item 2: Bombay Sourdough Toastie */}
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" />
                            <h5 className="text-xs font-bold text-zinc-100">
                              Bombay Sourdough Toastie
                            </h5>
                          </div>
                          <p className="text-[11px] text-zinc-400 mt-0.5">
                            Herb butter, paneer, mint chutney
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          ₹280
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-amber-400">
                        <span className="bg-amber-950/60 border border-amber-800 px-1.5 py-0.5 rounded">
                          Mod: Extra Crispy
                        </span>
                      </div>
                    </div>

                    {/* 1-Tap UPI Checkout Button */}
                    <div className="pt-2">
                      <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 space-y-2">
                        <div className="flex items-center justify-between text-xs text-zinc-300">
                          <span>Table 04 Total (2 items)</span>
                          <span className="font-bold text-white font-mono">
                            ₹{240 + (selectedModifier === "oat" ? 40 : 0) + 280}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleSimulateChime}
                          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-2.5 px-3 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-emerald-200" />
                          <span>1-Tap UPI Pay (GPay / PhonePe)</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT VIEW: Pangat Kitchen Display System (KDS) (Span 7 on LG) */}
              <div
                className={`lg:col-span-7 ${
                  activeTab === "guest" ? "hidden lg:block" : "block"
                }`}
              >
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-lg text-zinc-100">
                  {/* Tablet Frame Header */}
                  <div className="bg-zinc-950 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Tablet className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold tracking-tight text-white">
                        PANGAT KDS · Barista & Kitchen Station
                      </span>
                    </div>

                    {/* Live Audio Alert Pill */}
                    <div
                      className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border transition-all ${
                        audioChimeTriggered
                          ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 animate-pulse"
                          : "bg-emerald-950/70 border-emerald-700/80 text-emerald-300"
                      }`}
                    >
                      <BellRing
                        className={`w-3.5 h-3.5 ${
                          audioChimeTriggered ? "text-amber-300 animate-spin" : "text-emerald-400"
                        }`}
                      />
                      <span className="font-medium">
                        {audioChimeTriggered ? "AUDIO CHIME ACTIVE!" : "Audio Alert: Active"}
                      </span>
                    </div>
                  </div>

                  {/* KDS Dashboard View */}
                  <div className="p-4 space-y-3.5 bg-zinc-900/90">
                    {/* Real-time Order Card for Table 4 */}
                    <div className="rounded-xl border-2 border-emerald-600/70 bg-zinc-950 p-4 relative shadow-md">
                      {/* Live Ticket Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-800">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-xs font-mono">
                            #T-104
                          </span>
                          <span className="text-sm font-bold text-white">
                            Table 04
                          </span>
                          <span className="text-xs text-zinc-400">
                            (2 items · Dine-In)
                          </span>
                        </div>

                        {/* Elapsed Timer with Dynamic Color */}
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 font-mono text-xs">
                          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                          <span>01:42</span>
                        </div>
                      </div>

                      {/* Items with visual modifier callouts */}
                      <div className="py-3 space-y-2 text-xs">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-zinc-100">
                              1x Artisanal Cold Brew (16hr)
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 font-medium">
                                {selectedModifier === "oat" ? "Oat Milk (+₹40)" : "Standard Milk"}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">
                                {iceLevel === "less" ? "Less Ice" : "Regular Ice"}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            UPI Paid ✓
                          </span>
                        </div>

                        <div className="flex items-start justify-between pt-1 border-t border-zinc-850">
                          <div>
                            <span className="font-bold text-zinc-100">
                              1x Bombay Sourdough Toastie
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/80 border border-amber-700 text-amber-300 font-medium">
                                Extra Crispy
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400">
                                Mint Chutney on Side
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded">
                            UPI Paid ✓
                          </span>
                        </div>
                      </div>

                      {/* Kitchen Interactive Action Controls */}
                      <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setOrderStatus("preparing")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              orderStatus === "preparing"
                                ? "bg-amber-600 text-white shadow-xs"
                                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            }`}
                          >
                            Preparing
                          </button>
                          <button
                            type="button"
                            onClick={() => setOrderStatus("ready")}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              orderStatus === "ready"
                                ? "bg-emerald-600 text-white shadow-xs"
                                : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                            }`}
                          >
                            Mark Ready
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-zinc-400">
                            Status:{" "}
                            <strong className="text-emerald-400 capitalize">
                              {orderStatus}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Secondary Incoming Ticket in queue to show real-time stream */}
                    <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 opacity-75 hover:opacity-100 transition-opacity flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[11px]">
                          #T-105
                        </span>
                        <div>
                          <p className="font-semibold text-zinc-200">
                            Table 08 · 1x Espresso Macchiato + 1x Cinnamon Swirl
                          </p>
                          <p className="text-[10px] text-zinc-500">
                            Incoming 12s ago · Upfront UPI Paid
                          </p>
                        </div>
                      </div>
                      <span className="text-zinc-400 font-mono text-[11px]">
                        00:12
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Proof Note */}
            <div className="mt-4 pt-3 border-t border-zinc-850 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 px-2">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                Zero thermal printers to jam. No paper rolls. Kitchen audio chimes directly on staff phones.
              </span>
              <span className="text-zinc-500 text-[11px]">
                Runs on any Android tablet, iPad, or smartphone via web browser
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
