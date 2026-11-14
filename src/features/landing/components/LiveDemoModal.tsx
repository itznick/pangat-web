import * as React from "react"
import { useModal } from "@/hooks/useModal"
import { PangatLogo } from "@/components/ui/PangatLogo"
import { playKitchenChime } from "@/lib/sound"
import {
  X,
  Volume2,
  BellRing,
  CheckCircle2,
  Clock,
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

  const modalRef = useModal(isOpen, onClose)

  if (!isOpen) return null

  const handlePay = () => {
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
    <div ref={modalRef} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }} role="dialog" aria-modal="true" aria-label="Live demo" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-3xl border border-white/[0.08] bg-zinc-950 text-white p-6 sm:p-9 shadow-2xl max-h-[92dvh] overflow-y-auto space-y-6 ring-1 ring-white/[0.04]">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <PangatLogo size="sm" />
            <div>
              <h3 className="text-lg font-semibold text-white font-heading">
                Interactive Sandbox
              </h3>
              <p className="text-xs text-zinc-400">
                Simulate Diner Table Order → Live Kitchen KDS Chime
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              title="Reset Sandbox"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span>
            Select a milk variant on the left, then click <strong>&quot;Simulate 1-Tap UPI Pay&quot;</strong> to hear the actual kitchen chime and see the live ticket appear.
          </span>
          <span className="px-2.5 py-1 rounded-full bg-white/[0.06] text-zinc-300 text-[11px] shrink-0">
            Interactive Test
          </span>
        </div>

        {/* Dual Simulation View */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Diner Mobile Screen */}
          <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
              <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-zinc-400" />
                Diner View: Table 04
              </span>
              <span className="text-zinc-500 font-mono text-[11px]">pangat.app/t/4</span>
            </div>

            {/* Menu item card */}
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-white/[0.06] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-white text-sm font-heading">
                    Iced Sea Salt Vanilla Latte
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Double shot espresso, Madagascar vanilla, cold foam
                  </p>
                </div>
                <span className="font-semibold text-white text-sm tabular-nums">₹280</span>
              </div>

              {/* Modifiers */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block">
                  Milk Variant:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMilk("oat")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      selectedMilk === "oat"
                        ? "bg-white text-zinc-950 font-semibold shadow-xs"
                        : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
                    }`}
                  >
                    Oat (+₹40)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMilk("almond")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      selectedMilk === "almond"
                        ? "bg-white text-zinc-950 font-semibold shadow-xs"
                        : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
                    }`}
                  >
                    Almond (+₹50)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMilk("dairy")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      selectedMilk === "dairy"
                        ? "bg-white text-zinc-950 font-semibold shadow-xs"
                        : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
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
                className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm py-3.5 rounded-full shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-zinc-950" />
                <span>Simulate 1-Tap UPI Pay (₹{price})</span>
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs space-y-1 text-center">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 font-medium text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>UPI Payment Approved · ₹{price}</span>
                </div>
                <p className="text-xs text-zinc-400">
                  Transferred directly to merchant bank VPA. Sent to kitchen display.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT: Kitchen KDS Screen */}
          <div className="rounded-2xl border border-white/[0.08] bg-black/40 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-xs">
              <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Tablet className="w-3.5 h-3.5 text-zinc-400" />
                Kitchen Display (KDS)
              </span>

              <button
                type="button"
                onClick={handleManualChimeTest}
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full border transition-all cursor-pointer ${
                  chimeActive
                    ? "bg-amber-400/20 border-amber-400/50 text-amber-300"
                    : "bg-white/[0.06] hover:bg-white/[0.1] border-white/10 text-zinc-300"
                }`}
                title="Click to hear the kitchen chime"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{chimeActive ? "Chime Ringing..." : "Test Chime"}</span>
              </button>
            </div>

            {/* KDS Order Ticket */}
            {paid ? (
              <div className="rounded-xl border border-white/[0.12] bg-zinc-900/60 p-4 space-y-3 animate-in slide-in-from-top duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-white/[0.08] text-zinc-200 font-mono text-xs tabular-nums">
                      #T-104
                    </span>
                    <span className="text-sm font-semibold text-white font-heading">Table 04</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-zinc-400 font-mono">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    <span>00:15</span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="font-medium text-zinc-200 text-sm">
                    1x Iced Sea Salt Vanilla Latte
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded text-xs bg-white/[0.06] border border-white/10 text-zinc-300 uppercase font-mono">
                      {selectedMilk} milk
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs bg-white/[0.06] text-zinc-300 font-medium">
                      PAID ₹{price}
                    </span>
                  </div>
                </div>

                {/* Workflow Buttons */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setKdsStatus("preparing")}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                        kdsStatus === "preparing"
                          ? "bg-white text-zinc-950 font-semibold"
                          : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
                      }`}
                    >
                      Preparing
                    </button>
                    <button
                      type="button"
                      onClick={() => setKdsStatus("ready")}
                      className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-all ${
                        kdsStatus === "ready"
                          ? "bg-white text-zinc-950 font-semibold"
                          : "bg-white/[0.06] text-zinc-300 hover:bg-white/[0.1]"
                      }`}
                    >
                      Order Ready ✓
                    </button>
                  </div>
                  <span className="text-xs text-zinc-400 capitalize font-normal">
                    State: {kdsStatus}
                  </span>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center text-xs text-zinc-400 space-y-2">
                <BellRing className="w-5 h-5 mx-auto text-zinc-500" />
                <p className="font-medium text-zinc-300">Waiting for diner order...</p>
                <p className="text-xs text-zinc-500">
                  Click &quot;Simulate 1-Tap UPI Pay&quot; to test the live WebSocket alert
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom CTA */}
        <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              onClose()
              onClaimPilot()
            }}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
          >
            Schedule Free Demo for Your Restaurant
          </button>
        </div>
      </div>
    </div>
  )
}
