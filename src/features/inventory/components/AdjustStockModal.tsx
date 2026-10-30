import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { Loader2, SlidersHorizontal, AlertCircle, TrendingUp, TrendingDown } from "lucide-react"
import type { Ingredient } from "@/types/domain"

const REASON_PRESETS = [
  "Physical inventory count reconciliation",
  "Kitchen wastage / spoilage / expired batch",
  "Supplier return / rejected quality",
  "Counter prep spill / damage",
  "Emergency local market purchase",
  "Other manual adjustment",
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantId: string
  ingredient: Ingredient | null
  onStockAdjusted: (updated: Ingredient) => void
}

export function AdjustStockModal({
  open,
  onOpenChange,
  restaurantId,
  ingredient,
  onStockAdjusted,
}: Props) {
  const [mode, setMode] = useState<"ADD" | "DEDUCT">("ADD")
  const [amount, setAmount] = useState("")
  const [selectedReason, setSelectedReason] = useState(REASON_PRESETS[0])
  const [customNote, setCustomNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!ingredient) return null

  const currentStock = Number(ingredient.currentStock)
  const deltaValue = parseFloat(amount) || 0
  const finalDelta = mode === "ADD" ? deltaValue : -deltaValue
  const projectedBalance = Math.round((currentStock + finalDelta) * 1000) / 1000

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (deltaValue <= 0) {
      setError("Please enter a valid quantity greater than zero")
      return
    }

    if (projectedBalance < 0) {
      setError(`Cannot reduce stock by ${deltaValue} ${ingredient.unit}. Current balance is ${currentStock} ${ingredient.unit}.`)
      return
    }

    setLoading(true)
    setError(null)

    const fullReason = customNote.trim()
      ? `${selectedReason} - ${customNote.trim()}`
      : selectedReason

    try {
      const res = await api.inventory.adjustStock(ingredient.id, restaurantId, {
        quantityDelta: finalDelta,
        reason: fullReason,
        type: mode === "DEDUCT" ? "WASTAGE" : "MANUAL_ADJUSTMENT",
      })

      onStockAdjusted(res.ingredient)
      onOpenChange(false)
      setAmount("")
      setCustomNote("")
    } catch (err: any) {
      setError(err.message || "Failed to adjust stock")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
            Adjust Stock Level
          </DialogTitle>
          <DialogDescription>
            Record manual stock count reconciliation, wastage, or spot corrections with full audit logging.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Target Ingredient</p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{ingredient.name}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Current Stock</p>
              <p className="font-bold text-zinc-900 dark:text-zinc-100">
                {currentStock} <span className="text-xs text-zinc-500">{ingredient.unit}</span>
              </p>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Adjustment Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode("ADD")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                  mode === "ADD"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Add Stock (+)
              </button>
              <button
                type="button"
                onClick={() => setMode("DEDUCT")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                  mode === "DEDUCT"
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300"
                    : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-850"
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Deduct / Wastage (-)
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adj-amount">Quantity to {mode === "ADD" ? "Add" : "Deduct"} ({ingredient.unit}) *</Label>
            <Input
              id="adj-amount"
              type="number"
              step="any"
              min="0.001"
              placeholder={`Enter amount in ${ingredient.unit}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adj-reason">Audit Reason *</Label>
            <select
              id="adj-reason"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full h-9 px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {REASON_PRESETS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="adj-notes">Specific Notes / Batch ID (Optional)</Label>
            <Input
              id="adj-notes"
              placeholder="e.g. Discarded burnt gravy container or recount shelf 3"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>

          {deltaValue > 0 && (
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800/80 rounded-md text-xs flex justify-between items-center text-zinc-600 dark:text-zinc-300">
              <span>Projected New Balance:</span>
              <span className={`font-bold text-sm ${projectedBalance < 0 ? "text-rose-600" : "text-zinc-900 dark:text-zinc-100"}`}>
                {projectedBalance} {ingredient.unit}
              </span>
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || deltaValue <= 0 || projectedBalance < 0}
              className={mode === "ADD" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Adjustment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
