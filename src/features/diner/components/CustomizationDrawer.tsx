import { useState } from "react"
import { X, Minus, Plus, ChefHat } from "lucide-react"
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter } from "@/components/ui/drawer"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { MenuItem, Modifier, SelectedModifier } from "@/types/domain"

interface CustomizationDrawerProps {
  item: MenuItem | null
  open: boolean
  onClose: () => void
  onConfirm: (modifiers: SelectedModifier[], notes: string, quantity: number) => void
}

export function CustomizationDrawer({ item, open, onClose, onConfirm }: CustomizationDrawerProps) {
  const [selectedSingle, setSelectedSingle] = useState<Record<string, string>>({})
  const [selectedMulti, setSelectedMulti] = useState<Record<string, Set<string>>>({})
  const [notes, setNotes] = useState("")
  const [quantity, setQuantity] = useState(1)

  if (!item) return null

  const getModifierPrice = (): number => {
    let total = 0
    item.modifiers.forEach((group) => {
      if (group.type === "SINGLE") {
        const optName = selectedSingle[group.id]
        if (optName) {
          const opt = group.options.find((o) => o.name === optName)
          if (opt) total += opt.price
        }
      } else {
        const selected = selectedMulti[group.id]
        if (selected) {
          group.options.forEach((opt) => {
            if (selected.has(opt.name)) total += opt.price
          })
        }
      }
    })
    return total
  }

  const totalPrice = (item.price + getModifierPrice()) * quantity

  const handleConfirm = () => {
    // Validate required single choices
    for (const group of item.modifiers) {
      if (group.type === "SINGLE" && group.isRequired && !selectedSingle[group.id]) {
        return
      }
    }

    const modifiers: SelectedModifier[] = []
    item.modifiers.forEach((group) => {
      if (group.type === "SINGLE") {
        const optName = selectedSingle[group.id]
        if (optName) {
          const opt = group.options.find((o) => o.name === optName)
          if (opt) {
            modifiers.push({
              name: opt.name,
              price: opt.price,
            })
          }
        }
      } else {
        const selected = selectedMulti[group.id]
        if (selected) {
          group.options.forEach((opt) => {
            if (selected.has(opt.name)) {
              modifiers.push({
                name: opt.name,
                price: opt.price,
              })
            }
          })
        }
      }
    })

    onConfirm(modifiers, notes, quantity)
    // Reset state
    setSelectedSingle({})
    setSelectedMulti({})
    setNotes("")
    setQuantity(1)
  }

  const toggleMulti = (groupId: string, optionName: string) => {
    setSelectedMulti((prev) => {
      const current = new Set(prev[groupId] || [])
      if (current.has(optionName)) current.delete(optionName)
      else current.add(optionName)
      return { ...prev, [groupId]: current }
    })
  }

  return (
    <Drawer open={open} onClose={onClose}>
      <DrawerHeader>
        <div className="flex items-center justify-between">
          <div>
            <DrawerTitle>{item.name}</DrawerTitle>
            <p className="text-xs text-zinc-500 mt-0.5">Base ₹{item.price}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </DrawerHeader>

      <DrawerContent className="max-h-[65vh] overflow-y-auto pb-2">
        {/* Modifier Groups */}
        {item.modifiers.map((group) => (
          <ModifierGroupSection
            key={group.id}
            group={group}
            selectedSingle={selectedSingle}
            selectedMulti={selectedMulti}
            onSingleChange={(groupId, optionName) =>
              setSelectedSingle((prev) => ({ ...prev, [groupId]: optionName }))
            }
            onMultiToggle={toggleMulti}
          />
        ))}

        {/* Chef Notes */}
        <div className="mt-4">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-2">
            <ChefHat className="h-3.5 w-3.5" />
            Chef's Note
            <span className="text-zinc-600">(optional)</span>
          </label>
          <Textarea
            placeholder="e.g., Extra crispy, less salt, no onions…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-sm min-h-[64px]"
          />
        </div>
      </DrawerContent>

      <DrawerFooter>
        {/* Quantity selector */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-zinc-300">Quantity</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 hover:bg-zinc-700 transition-colors border border-zinc-700"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="text-base font-bold text-zinc-100 w-6 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white hover:bg-emerald-500 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <Button
          className="w-full h-12 text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30"
          onClick={handleConfirm}
        >
          Add to Order • ₹{totalPrice}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Modifier Group Section (internal)
// ─────────────────────────────────────────────────────────────────────────────

interface ModifierGroupSectionProps {
  group: Modifier
  selectedSingle: Record<string, string>
  selectedMulti: Record<string, Set<string>>
  onSingleChange: (groupId: string, optionName: string) => void
  onMultiToggle: (groupId: string, optionName: string) => void
}

function ModifierGroupSection({
  group,
  selectedSingle,
  selectedMulti,
  onSingleChange,
  onMultiToggle,
}: ModifierGroupSectionProps) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2.5">
        <h4 className="text-sm font-semibold text-zinc-200">{group.name}</h4>
        {group.isRequired ? (
          <span className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold uppercase tracking-wide">
            Required
          </span>
        ) : (
          <span className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-500 text-[10px] font-medium">
            Optional
          </span>
        )}
        <span className="ml-auto text-[10px] text-zinc-600">
          {group.type === "SINGLE" ? "Choose one" : "Choose any"}
        </span>
      </div>

      <div className="space-y-2">
        {group.options.map((option) => {
          const isSelected =
            group.type === "SINGLE"
              ? selectedSingle[group.id] === option.name
              : selectedMulti[group.id]?.has(option.name) ?? false

          return (
            <button
              key={option.name}
              onClick={() =>
                group.type === "SINGLE"
                  ? onSingleChange(group.id, option.name)
                  : onMultiToggle(group.id, option.name)
              }
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all duration-150",
                isSelected
                  ? "border-emerald-500 bg-emerald-500/10 text-zinc-100"
                  : "border-zinc-800 bg-zinc-800/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
              )}
            >
              <div className="flex items-center gap-2.5">
                {/* Radio / Checkbox indicator */}
                <div
                  className={cn(
                    "flex-shrink-0 transition-all duration-150",
                    group.type === "SINGLE"
                      ? cn(
                          "w-4 h-4 rounded-full border-2",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-zinc-600"
                        )
                      : cn(
                          "w-4 h-4 rounded border-2 flex items-center justify-center",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500"
                            : "border-zinc-600"
                        )
                  )}
                >
                  {group.type === "MULTIPLE" && isSelected && (
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-medium">{option.name}</span>
              </div>
              {option.price > 0 && (
                <span className="text-xs text-emerald-400 font-semibold">+₹{option.price}</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
