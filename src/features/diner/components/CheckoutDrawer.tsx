import { useState } from "react"
import { X, Minus, Plus, Smartphone, IndianRupee, Receipt, Leaf, Drumstick } from "lucide-react"
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/stores/useCartStore"
import { cn } from "@/lib/utils"

interface CheckoutDrawerProps {
  open: boolean
  onClose: () => void
  onProceedToPay: (mobile: string) => void
}

export function CheckoutDrawer({ open, onClose, onProceedToPay }: CheckoutDrawerProps) {
  const [mobile, setMobile] = useState("")
  const entries = useCartStore((s) => s.entries)
  const subtotal = useCartStore((s) => s.subtotal())
  const gst = useCartStore((s) => s.gstAmount(5))
  const total = useCartStore((s) => s.total(5))
  const incrementItem = useCartStore((s) => s.incrementItem)
  const decrementItem = useCartStore((s) => s.decrementItem)

  return (
    <Drawer open={open} onClose={onClose} className="max-h-[90vh]">
      <DrawerHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-400" />
            <DrawerTitle>Your Order</DrawerTitle>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </DrawerHeader>

      <DrawerContent className="overflow-y-auto max-h-[55vh]">
        {/* Cart Items */}
        <div className="space-y-3 mb-4">
          {entries.map((entry) => {
            const modTotal = entry.selectedModifiers.reduce((sum, m) => sum + m.price, 0)
            const itemPrice = entry.price + modTotal
            return (
              <div key={entry._localId} className="flex items-start gap-3 py-2 border-b border-zinc-800/60">
                {/* Dietary indicator */}
                <div className="mt-0.5">
                  {entry.isVeg ? (
                    <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Drumstick className="h-3.5 w-3.5 text-rose-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-100">{entry.name}</p>
                  {entry.selectedModifiers.length > 0 && (
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {entry.selectedModifiers.map((m) => m.name).join(", ")}
                    </p>
                  )}
                  {entry.notes && (
                    <p className="text-xs text-amber-400/80 mt-0.5 italic">"{entry.notes}"</p>
                  )}
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => decrementItem(entry._localId)}
                    className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                  >
                    <Minus className="h-3 w-3 text-zinc-300" />
                  </button>
                  <span className="text-sm font-bold text-zinc-100 w-4 text-center">{entry.quantity}</span>
                  <button
                    onClick={() => incrementItem(entry._localId)}
                    className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                  >
                    <Plus className="h-3 w-3 text-zinc-300" />
                  </button>
                </div>

                <span className="text-sm font-bold text-zinc-100 ml-1 min-w-[48px] text-right">
                  ₹{(itemPrice * entry.quantity).toFixed(0)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Bill breakdown */}
        <div className="bg-zinc-800/40 rounded-xl p-4 border border-zinc-800 space-y-2.5 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Subtotal</span>
            <span className="text-zinc-200 font-medium">₹{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400 flex items-center gap-1">
              <IndianRupee className="h-3 w-3" />
              GST (5%)
            </span>
            <span className="text-zinc-200 font-medium">₹{gst.toFixed(2)}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-sm font-bold text-zinc-100">Total</span>
            <span className="text-base font-bold text-emerald-400">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Mobile number input */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mb-2">
            <Smartphone className="h-3.5 w-3.5" />
            Mobile Number
            <span className="text-zinc-600">(for digital invoice)</span>
          </label>
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
          />
        </div>
      </DrawerContent>

      <DrawerFooter>
        <Button
          className={cn(
            "w-full h-13 text-sm font-bold rounded-xl",
            "bg-gradient-to-r from-emerald-600 to-emerald-500",
            "hover:from-emerald-500 hover:to-emerald-400",
            "text-white shadow-xl shadow-emerald-600/30",
            "border border-emerald-500/50",
            "transition-all duration-200 active:scale-[0.98]"
          )}
          onClick={() => onProceedToPay(mobile)}
          disabled={entries.length === 0}
        >
          <IndianRupee className="h-4 w-4 mr-1" />
          Proceed to UPI Pay • ₹{total.toFixed(2)}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}
