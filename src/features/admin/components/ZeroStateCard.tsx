// ─────────────────────────────────────────────────────────────────────────────
// ZeroStateCard – Guided Empty State for Accounts Without Outlets
// Welcomes new super owners and provides a 1-click wizard to setup their first branch.
// ─────────────────────────────────────────────────────────────────────────────

import { useNavigate } from 'react-router'
import { Store, Sparkles, Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ZeroStateCardProps {
  onAddOutlet?: () => void
}

export function ZeroStateCard({ onAddOutlet }: ZeroStateCardProps) {
  const navigate = useNavigate()

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-xl w-full rounded-3xl border border-white/10 bg-gradient-to-b from-zinc-900/90 to-zinc-950 p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-xl shadow-emerald-950">
            <Store className="w-8 h-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to Pangat Hospitality</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
            No Active Dining Outlets Configured
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed max-w-md">
            To start generating dynamic QR codes, firing orders directly to your kitchen display, and receiving zero-fee UPI settlements, setup your first branch location.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-6 w-full text-left text-xs">
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-emerald-400 font-bold block mb-1">1. Fast Floor Generator</span>
              <span className="text-zinc-500">Batch generate table codes (T01-T20).</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-amber-400 font-bold block mb-1">2. Culinary Presets</span>
              <span className="text-zinc-500">Preload authentic Pune Nashta or Tiffin.</span>
            </div>
            <div className="p-3 rounded-2xl bg-zinc-950/80 border border-zinc-800">
              <span className="text-blue-400 font-bold block mb-1">3. Direct UPI VPA</span>
              <span className="text-zinc-500">Instant diner payouts to your bank account.</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={() => (onAddOutlet ? onAddOutlet() : navigate('/onboarding'))}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 px-6 shadow-xl shadow-emerald-950 cursor-pointer"
            >
              <span>Setup Dining Outlet Now</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {onAddOutlet && (
              <Button
                variant="outline"
                onClick={onAddOutlet}
                className="w-full sm:w-auto border-zinc-700 text-zinc-300 hover:text-white gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Add Outlet</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
