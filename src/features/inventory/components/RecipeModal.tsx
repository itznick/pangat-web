import { useState, useEffect } from "react"
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
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/api"
import { Loader2, ChefHat, Plus, Trash2, AlertCircle, History } from "lucide-react"
import type { Ingredient, MenuItem, Recipe, UnitOfMeasure } from "@/types/domain"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  restaurantId: string
  menuItem: MenuItem | null
  ingredients: Ingredient[]
  onRecipeSaved: (recipe: Recipe) => void
}

interface IngredientRow {
  ingredientId: string
  quantity: string
  unit: UnitOfMeasure
}

export function RecipeModal({
  open,
  onOpenChange,
  restaurantId,
  menuItem,
  ingredients,
  onRecipeSaved,
}: Props) {
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(null)
  const [notes, setNotes] = useState("")
  const [rows, setRows] = useState<IngredientRow[]>([])
  const [fetching, setFetching] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !menuItem) {
      setCurrentRecipe(null)
      setRows([])
      setNotes("")
      setError(null)
      return
    }

    const loadRecipe = async () => {
      setFetching(true)
      try {
        const recipe = await api.inventory.getRecipeForMenuItem(menuItem.id, restaurantId)
        setCurrentRecipe(recipe)
        setNotes(recipe.notes || "")
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          setRows(
            recipe.ingredients.map((ri) => ({
              ingredientId: ri.ingredientId,
              quantity: String(ri.quantity),
              unit: ri.unit,
            }))
          )
        } else {
          setRows([{ ingredientId: ingredients[0]?.id || "", quantity: "100", unit: "GRAM" }])
        }
      } catch {
        // No recipe yet
        setCurrentRecipe(null)
        setNotes("")
        setRows([{ ingredientId: ingredients[0]?.id || "", quantity: "100", unit: "GRAM" }])
      } finally {
        setFetching(false)
      }
    }

    loadRecipe()
  }, [open, menuItem, restaurantId, ingredients])

  if (!menuItem) return null

  const handleAddRow = () => {
    const first = ingredients[0]
    setRows([
      ...rows,
      { ingredientId: first?.id || "", quantity: "100", unit: first?.unit || "GRAM" },
    ])
  }

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return
    setRows(rows.filter((_, idx) => idx !== index))
  }

  const handleRowChange = (index: number, field: keyof IngredientRow, value: any) => {
    const updated = [...rows]
    updated[index] = { ...updated[index], [field]: value }
    // If ingredient changed, sync unit with that ingredient's default unit
    if (field === "ingredientId") {
      const ing = ingredients.find((i) => i.id === value)
      if (ing) {
        updated[index].unit = ing.unit
      }
    }
    setRows(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    for (const r of rows) {
      if (!r.ingredientId) {
        setError("Every ingredient row must have a selected ingredient")
        return
      }
      if (!parseFloat(r.quantity) || parseFloat(r.quantity) <= 0) {
        setError("Ingredient quantities must be greater than zero")
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const saved = await api.inventory.upsertRecipe(restaurantId, {
        menuItemId: menuItem.id,
        notes: notes.trim() || undefined,
        ingredients: rows.map((r) => ({
          ingredientId: r.ingredientId,
          quantity: parseFloat(r.quantity),
          unit: r.unit,
        })),
      })

      onRecipeSaved(saved)
      onOpenChange(false)
    } catch (err: any) {
      setError(err.message || "Failed to save recipe")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
              <ChefHat className="w-5 h-5 text-amber-600" />
              Configure Dish Recipe
            </DialogTitle>
            {currentRecipe && (
              <Badge variant="outline" className="flex items-center gap-1 font-mono text-xs bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200">
                <History className="w-3 h-3" />
                Active Version: v{currentRecipe.version}
              </Badge>
            )}
          </div>
          <DialogDescription>
            Specify raw ingredient portions for <strong>{menuItem.name}</strong>. Pangat will automatically deduct these amounts when an order is received.
          </DialogDescription>
        </DialogHeader>

        {fetching ? (
          <div className="py-12 flex flex-col items-center justify-center text-zinc-500 gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading dish recipe data...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Dish Name</p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">{menuItem.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Selling Price</p>
                <p className="font-bold text-zinc-900 dark:text-zinc-100">₹{menuItem.price}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs uppercase font-bold tracking-wider text-zinc-500">
                  Required Ingredients ({rows.length})
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddRow}
                  className="h-7 text-xs flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Ingredient
                </Button>
              </div>

              <div className="space-y-2">
                {rows.map((row, idx) => {
                  return (
                    <div
                      key={idx}
                      className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-700/60 flex items-center gap-2"
                    >
                      <div className="flex-1 min-w-[200px]">
                        <select
                          value={row.ingredientId}
                          onChange={(e) => handleRowChange(idx, "ingredientId", e.target.value)}
                          className="w-full h-9 px-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100"
                          required
                        >
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} (Available: {ing.currentStock} {ing.unit})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="w-24">
                        <Input
                          type="number"
                          step="any"
                          min="0.001"
                          placeholder="Portion"
                          value={row.quantity}
                          onChange={(e) => handleRowChange(idx, "quantity", e.target.value)}
                          required
                        />
                      </div>

                      <div className="w-24">
                        <select
                          value={row.unit}
                          onChange={(e) => handleRowChange(idx, "unit", e.target.value as UnitOfMeasure)}
                          className="w-full h-9 px-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100 font-mono"
                        >
                          <option value="KG">KG</option>
                          <option value="GRAM">GRAM</option>
                          <option value="LITRE">LITRE</option>
                          <option value="ML">ML</option>
                          <option value="PIECE">PIECE</option>
                          <option value="PACKET">PACKET</option>
                        </select>
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

            <div className="space-y-1.5">
              <Label htmlFor="rec-notes">Preparation Notes (Optional)</Label>
              <Input
                id="rec-notes"
                placeholder="e.g. Standard 1-portion serving for lunch & dinner"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
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
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {currentRecipe ? `Save as Version v${currentRecipe.version + 1}` : "Save Recipe (v1)"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
