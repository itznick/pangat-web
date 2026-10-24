import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PangatLogo } from "@/components/ui/PangatLogo"
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
    setPaid(true)
    setChimeActive(true)
    setKdsStatus("new")
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-zinc-200 bg-zinc-950 text-white p-5 sm:p-7 shadow-2xl dark:border-zinc-800 max-h-[92vh] overflow-y-auto">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <PangatLogo size="sm" />
            <div>
              <h3 className="text-base font-bold text-white">
                Live Interactive Sandbox
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Simulate Diner Table Order → Live Kitchen KDS Chime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-850 text-xs flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="my-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between text-xs text-zinc-300">
          <span>
            👉 <strong>Try it:</strong> Select your milk option on the left, then click <strong>"Simulate 1-Tap UPI Pay"</strong> to hear and see the kitchen chime in real time!
          </span>
          <Badge variant="emerald" className="shrink-0 ml-2">
            Interactive Test
          </Badge>
        </div>

        {/* Dual Simulation View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* LEFT: Diner Mobile Screen */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                Diner View: Table 04
              </span>
              <span className="font-mono text-zinc-400 text-[11px]">
                pangat.app/t/4
              </span>
            </div>

            {/* Menu Item */}
            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-white">
                    Iced Sea Salt Vanilla Latte
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Double shot espresso, Madagascar vanilla, cold foam
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-400 font-mono">
                  ₹{price}
                </span>
              </div>

              {/* Milk Customizer */}
              <div className="pt-2 border-t border-zinc-850 text-xs space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                  Choose Milk Variant:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedMilk("oat")}
                    className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                      selectedMilk === "oat"
                        ? "bg-emerald-600 text-white font-semibold"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    Oat (+₹40)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMilk("almond")}
                    className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                      selectedMilk === "almond"
                        ? "bg-emerald-600 text-white font-semibold"
                        : "bg-zinc-800 text-zinc-300"
                    }`}
                  >
                    Almond (+₹50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMilk("dairy")}
                    className={`px-2 py-1 rounded text-xs transition-all cursor-pointer ${
                      selectedMilk === "dairy"
                        ? "bg-emerald-600 text-white font-semibold"
                        : "bg-zinc-800 text-zinc-300"
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
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-200" />
                Simulate 1-Tap UPI Pay (₹{price})
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-700 text-xs space-y-1 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>UPI Payment Approved · ₹{price}</span>
                </div>
                <p className="text-[11px] text-zinc-300">
                  Transferred directly to merchant bank VPA. Sent to kitchen!
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Kitchen KDS Screen */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5">
                <Tablet className="w-3.5 h-3.5 text-emerald-400" />
                Kitchen Display (KDS)
              </span>
              <div
                className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border ${
                  chimeActive
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 animate-bounce"
                    : "bg-zinc-800 border-zinc-700 text-zinc-400"
                }`}
              >
                <Volume2 className="w-3 h-3" />
                <span>{chimeActive ? "🔔 CHIME RINGING!" : "Audio Ready"}</span>
              </div>
            </div>

            {/* KDS Order Ticket */}
            {paid ? (
              <div className="rounded-xl border-2 border-emerald-500 bg-zinc-950 p-3.5 space-y-2.5 animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-900 text-emerald-200 font-mono text-[11px] font-bold">
                      #T-104
                    </span>
                    <span className="text-xs font-bold text-white">Table 04</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-amber-400 font-mono">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>00:15</span>
                  </div>
                </div>

                <div className="text-xs space-y-1">
                  <div className="font-semibold text-zinc-200">
                    1x Iced Sea Salt Vanilla Latte
                  </div>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 border border-emerald-700 text-emerald-300 uppercase font-bold">
                      {selectedMilk} milk
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-300">
                      PAID ₹{price}
                    </span>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="pt-2 border-t border-zinc-850 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setKdsStatus("preparing")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      kdsStatus === "preparing"
                        ? "bg-amber-600 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    Preparing
                  </button>
                  <button
                    type="button"
                    onClick={() => setKdsStatus("ready")}
                    className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                      kdsStatus === "ready"
                        ? "bg-emerald-600 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    Order Ready ✓
                  </button>
                  <span className="text-[11px] text-emerald-400 font-mono capitalize">
                    {kdsStatus}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-xs text-zinc-500 space-y-2">
                <BellRing className="w-6 h-6 mx-auto text-zinc-600" />
                <p>Waiting for diner to order on the left...</p>
                <p className="text-[11px] text-zinc-600">
                  Click "Simulate 1-Tap UPI Pay" on Table 04 to trigger ticket arrival
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom CTA */}
        <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-zinc-400 text-center sm:text-left">
            <span>Runs in browser on any staff phone or tablet · </span>
            <strong className="text-emerald-400">Flat ₹699/month</strong>
          </div>
          <Button
            onClick={() => {
              onClose()
              onClaimPilot()
            }}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-6 py-2.5 font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            Claim 7-Day Free Pilot for Your Cafe
          </Button>
        </div>
      </div>
    </div>
  )
}
