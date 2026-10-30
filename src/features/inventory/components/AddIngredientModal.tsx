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
import { Loader2, Plus, AlertCircle } from "lucide-react"
import type { Ingredient, UnitOfMeasure } from "@/types/domain"

const UNITS: { label: string; value: UnitOfMeasure }[] = [
  { label: "Kilogram (kg)", value: "KG" },
  { label: "Gram (g)", value: "GRAM" },
  { label: "Litre (L)", value: "LITRE" },
  { label: "Millilitre (ml)", value: "ML" },
  { label: "Piece (pc)", value: "PIECE" },
  { label: "Packet (pkt)", value: "PACKET" },
]

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantId: string
  onIngredientAdded: (ingredient: Ingredient) => void
}

export function AddIngredientModal({
  open,
  onOpenChange,
  restaurantId,
  onIngredientAdded,
}: Props) {
  const [name, setName] = useState("")
  const [sku, setSku] = useState("")
  const [unit, setUnit] = useState<UnitOfMeasure>("KG")
  const [openingStock, setOpeningStock] = useState("0")
  const [minimumStock, setMinimumStock] = useState("0")
  const [costPerUnit, setCostPerUnit] = useState("0")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Ingredient name is required")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const created = await api.inventory.createIngredient({
        restaurantId,
        name: name.trim(),
        sku: sku.trim() || undefined,
        unit,
        openingStock: parseFloat(openingStock) || 0,
        minimumStock: parseFloat(minimumStock) || 0,
        costPerUnit: parseFloat(costPerUnit) || 0,
      })

      onIngredientAdded(created)
      onOpenChange(false)
      setName("")
      setSku("")
      setUnit("KG")
      setOpeningStock("0")
      setMinimumStock("0")
      setCostPerUnit("0")
    } catch (err: any) {
      setError(err.message || "Failed to create ingredient")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <Plus className="w-5 h-5 text-emerald-600" />
            Add New Ingredient
          </DialogTitle>
          <DialogDescription>
            Register raw materials, liquids, or packaged stock for inventory tracking and automatic recipe deduction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="ing-name">Ingredient Name *</Label>
            <Input
              id="ing-name"
              placeholder="e.g. Malai Paneer, Amul Butter, Basmati Rice"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ing-unit">Unit of Measure *</Label>
              <select
                id="ing-unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitOfMeasure)}
                className="w-full h-9 px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ing-sku">SKU / Code (Optional)</Label>
              <Input
                id="ing-sku"
                placeholder="e.g. PAN-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ing-opening">Initial Stock</Label>
              <Input
                id="ing-opening"
                type="number"
                step="any"
                min="0"
                value={openingStock}
                onChange={(e) => setOpeningStock(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ing-min">Alert Threshold</Label>
              <Input
                id="ing-min"
                type="number"
                step="any"
                min="0"
                value={minimumStock}
                onChange={(e) => setMinimumStock(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ing-cost">Cost / Unit (₹)</Label>
              <Input
                id="ing-cost"
                type="number"
                step="any"
                min="0"
                value={costPerUnit}
                onChange={(e) => setCostPerUnit(e.target.value)}
              />
            </div>
          </div>

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
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Ingredient
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
