import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PangatLogo } from "@/components/ui/PangatLogo"
import { playKitchenChime } from "@/lib/sound"
import {
  X,
  Volume2,
  BellRing,
  CheckCircle2,
  Clock,
  Sparkles,
  Smartphone,
  Tablet,
  ShieldCheck,
  RotateCcw
} from "lucide-react"

interface LiveDemoModalProps {
  isOpen: boolean
  onClose: () => void
  onClaimPilot: () => void
}

export function LiveDemoModal({ isOpen, onClose, onClaimPilot }: LiveDemoModalProps) {
  // Demo interactive states
  const [selectedMilk, setSelectedMilk] = React.useState<"oat" | "almond" | "dairy">("oat")
  const [paid, setPaid] = React.useState(false)
  const [chimeActive, setChimeActive] = React.useState(false)
  const [kdsStatus, setKdsStatus] = React.useState<"new" | "preparing" | "ready">("new")

  if (!isOpen) return null

  const handlePay = () => {
    // Play authentic kitchen chime audio
    playKitchenChime()
    setPaid(true)
    setChimeActive(true)
    setKdsStatus("new")
    setTimeout(() => {
      setChimeActive(false)
    }, 2500)
  }

  const handleManualChimeTest = () => {
    playKitchenChime()
    setChimeActive(true)
    setTimeout(() => {
      setChimeActive(false)
    }, 2500)
  }

  const handleReset = () => {
    setPaid(false)
    setChimeActive(false)
    setKdsStatus("new")
    setSelectedMilk("oat")
  }

  const price = 240 + (selectedMilk === "oat" ? 40 : selectedMilk === "almond" ? 50 : 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-950 text-white p-6 sm:p-9 shadow-2xl max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <PangatLogo size="sm" />
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Live Interactive Sandbox
              </h3>
              <p className="text-xs text-zinc-400 font-sans">
                Simulate Diner Table Order → Live Kitchen KDS Chime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              title="Reset Sandbox"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline font-sans">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Try it:</strong> Select your milk option on the left, then click <strong>&quot;Simulate 1-Tap UPI Pay&quot;</strong> to hear the actual kitchen chime and see the live ticket appear!
            </span>
          </div>
          <Badge variant="outline" className="text-xs border-amber-500/40 text-amber-300 font-sans shrink-0">
            Interactive Test
          </Badge>
        </div>

        {/* Dual Simulation View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Diner Mobile Screen */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 font-heading">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                Diner View: Table 04
              </span>
              <span className="text-zinc-500 font-sans text-xs">pangat.app/t/4</span>
            </div>

            {/* Menu item card */}
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-white text-sm font-heading">
                    Iced Sea Salt Vanilla Latte
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Double shot espresso, Madagascar vanilla, cold foam
                  </p>
                </div>
                <span className="font-bold text-emerald-400 text-sm tabular-nums">₹280</span>
              </div>

              {/* Modifiers */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-850">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block font-sans">
                  Choose Milk Variant:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMilk("oat")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-sans ${
                      selectedMilk === "oat"
                        ? "bg-emerald-600 text-white font-semibold shadow-xs"
                        : "bg-zinc-850 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    Oat (+₹40)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMilk("almond")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-sans ${
                      selectedMilk === "almond"
                        ? "bg-emerald-600 text-white font-semibold shadow-xs"
                        : "bg-zinc-850 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    Almond (+₹50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMilk("dairy")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer font-sans ${
                      selectedMilk === "dairy"
                        ? "bg-emerald-600 text-white font-semibold shadow-xs"
                        : "bg-zinc-850 text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    Whole Milk
                  </button>
                </div>
              </div>
            </div>

            {/* Order Action Button */}
            {!paid ? (
              <button
                type="button"
                onClick={handlePay}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm py-3.5 rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                <span>Simulate 1-Tap UPI Pay (₹{price})</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs space-y-1 text-center font-sans">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>UPI Payment Approved · ₹{price}</span>
                </div>
                <p className="text-xs text-zinc-300">
                  Transferred directly to merchant bank VPA. Sent to kitchen!
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Kitchen KDS Screen */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 font-heading">
                <Tablet className="w-4 h-4 text-emerald-400" />
                Kitchen Display (KDS)
              </span>

              {/* Clickable Sound Test Pill */}
              <button
                type="button"
                onClick={handleManualChimeTest}
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  chimeActive
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 animate-bounce"
                    : "bg-zinc-800 hover:bg-zinc-750 border-zinc-700 text-zinc-300 hover:border-emerald-500/40"
                }`}
                title="Click to hear the kitchen chime"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{chimeActive ? "🔔 CHIME RINGING!" : "Test Audio Chime"}</span>
              </button>
            </div>

            {/* KDS Order Ticket */}
            {paid ? (
              <div className="rounded-xl border-2 border-emerald-500 bg-zinc-950 p-4 space-y-3 animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-200 text-xs font-bold tabular-nums">
                      #T-104
                    </span>
                    <span className="text-sm font-bold text-white font-heading">Table 04</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-amber-400 font-sans tabular-nums font-medium">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>00:15</span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 font-sans">
                  <div className="font-semibold text-zinc-200 text-sm">
                    1x Iced Sea Salt Vanilla Latte
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-emerald-950 border border-emerald-700 text-emerald-300 uppercase font-bold">
                      {selectedMilk} milk
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-300 font-semibold">
                      PAID ₹{price}
                    </span>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setKdsStatus("preparing")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        kdsStatus === "preparing"
                          ? "bg-amber-600 text-white"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-750"
                      }`}
                    >
                      Preparing
                    </button>
                    <button
                      type="button"
                      onClick={() => setKdsStatus("ready")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        kdsStatus === "ready"
                          ? "bg-emerald-600 text-white"
                          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-750"
                      }`}
                    >
                      Order Ready ✓
                    </button>
                  </div>
                  <span className="text-xs text-emerald-400 capitalize font-medium font-sans">
                    {kdsStatus}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-400 space-y-2">
                <BellRing className="w-6 h-6 mx-auto text-zinc-500" />
                <p className="font-sans font-medium text-zinc-300">Waiting for diner to order on the left...</p>
                <p className="text-xs text-zinc-500 font-sans">
                  Click &quot;Simulate 1-Tap UPI Pay&quot; on Table 04 to hear the audio chime and see ticket arrival
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom CTA */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-zinc-500 font-medium">Open Fullscreen:</span>
            <a
              href="/admin/dashboard"
              className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-900/50 font-semibold transition-colors"
            >
              📊 Admin Portal ↗
            </a>
            <a
              href="/kds/pangat"
              className="px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-400 hover:bg-amber-900/50 font-semibold transition-colors"
            >
              👨‍🍳 Kitchen KDS ↗
            </a>
            <a
              href="/r/pangat/t/04"
              className="px-2.5 py-1 rounded-md bg-blue-950/60 border border-blue-500/30 text-blue-400 hover:bg-blue-900/50 font-semibold transition-colors"
            >
              📱 Diner Menu ↗
            </a>
          </div>
          <Button
            onClick={() => {
              onClose()
              onClaimPilot()
            }}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-6 py-3 font-semibold cursor-pointer shadow-lg shadow-emerald-950/60"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Start Free 7-Day Trial for Your Cafe</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
