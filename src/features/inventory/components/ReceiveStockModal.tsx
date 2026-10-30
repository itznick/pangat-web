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
import { Loader2, PackagePlus, Plus, Trash2, AlertCircle } from "lucide-react"
import type { Ingredient } from "@/types/domain"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantId: string
  ingredients: Ingredient[]
  onStockReceived: (updatedIngredients: Ingredient[]) => void
}

interface ItemRow {
  ingredientId: string
  quantity: string
  costPerUnit: string
  notes: string
}

export function ReceiveStockModal({
  open,
  onOpenChange,
  restaurantId,
  ingredients,
  onStockReceived,
}: Props) {
  const [supplierName, setSupplierName] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [rows, setRows] = useState<ItemRow[]>([
    { ingredientId: ingredients[0]?.id || "", quantity: "1", costPerUnit: "", notes: "" },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddRow = () => {
    setRows([
      ...rows,
      { ingredientId: ingredients[0]?.id || "", quantity: "1", costPerUnit: "", notes: "" },
    ])
  }

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return
    setRows(rows.filter((_, idx) => idx !== index))
  }

  const handleRowChange = (index: number, field: keyof ItemRow, value: string) => {
    const updated = [...rows]
    updated[index] = { ...updated[index], [field]: value }
    setRows(updated)
  }

  const totalValue = rows.reduce((sum, r) => {
    const qty = parseFloat(r.quantity) || 0
    const cost = parseFloat(r.costPerUnit) || 0
    return sum + qty * cost
  }, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate rows
    for (const r of rows) {
      if (!r.ingredientId) {
        setError("Every line item must have a selected ingredient")
        return
      }
      if (!parseFloat(r.quantity) || parseFloat(r.quantity) <= 0) {
        setError("Quantity must be greater than zero for all items")
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const res = await api.inventory.receiveStock({
        restaurantId,
        supplierName: supplierName.trim() || undefined,
        invoiceNumber: invoiceNumber.trim() || undefined,
        items: rows.map((r) => ({
          ingredientId: r.ingredientId,
          quantity: parseFloat(r.quantity),
          costPerUnit: r.costPerUnit ? parseFloat(r.costPerUnit) : undefined,
          notes: r.notes.trim() || undefined,
        })),
      })

      onStockReceived(res.updatedIngredients)
      onOpenChange(false)
      setSupplierName("")
      setInvoiceNumber("")
      setRows([{ ingredientId: ingredients[0]?.id || "", quantity: "1", costPerUnit: "", notes: "" }])
    } catch (err: any) {
      setError(err.message || "Failed to receive supplier shipment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
            <PackagePlus className="w-5 h-5 text-emerald-600" />
            Receive Supplier Shipment
          </DialogTitle>
          <DialogDescription>
            Record batch deliveries from suppliers, update unit costs, and automatically replenish stock levels.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="sup-name">Supplier / Vendor Name</Label>
              <Input
                id="sup-name"
                placeholder="e.g. Metro Cash & Carry, Local Dairy"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sup-inv">Supplier Invoice / Challan #</Label>
              <Input
                id="sup-inv"
                placeholder="e.g. INV-2026-9812"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase font-bold tracking-wider text-zinc-500">
                Delivery Line Items ({rows.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddRow}
                className="h-7 text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </Button>
            </div>

            <div className="space-y-2">
              {rows.map((row, idx) => {
                return (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-2"
                  >
                    <div className="flex-1 min-w-[160px]">
                      <select
                        value={row.ingredientId}
                        onChange={(e) => handleRowChange(idx, "ingredientId", e.target.value)}
                        className="w-full h-9 px-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100"
                        required
                      >
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <Input
                        type="number"
                        step="any"
                        min="0.001"
                        placeholder="Qty"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, "quantity", e.target.value)}
                        required
                      />
                    </div>

                    <div className="w-28">
                      <Input
                        type="number"
                        step="any"
                        min="0"
                        placeholder="₹ / Unit"
                        value={row.costPerUnit}
                        onChange={(e) => handleRowChange(idx, "costPerUnit", e.target.value)}
                      />
                    </div>

                    <div className="flex-1 min-w-[120px]">
                      <Input
                        placeholder="Note / Batch"
                        value={row.notes}
                        onChange={(e) => handleRowChange(idx, "notes", e.target.value)}
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveRow(idx)}
                      disabled={rows.length === 1}
                      className="text-zinc-400 hover:text-rose-600 h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          {totalValue > 0 && (
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg flex items-center justify-between text-sm">
              <span className="text-emerald-800 dark:text-emerald-300 font-medium">Estimated Invoice Total:</span>
              <span className="text-base font-bold text-emerald-700 dark:text-emerald-200">
                ₹{totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Receive Stock ({rows.length} items)
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
