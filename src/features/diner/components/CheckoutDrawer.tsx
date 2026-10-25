import { useState } from "react"
import {
  X,
  Minus,
  Plus,
  Smartphone,
  IndianRupee,
  Receipt,
  Leaf,
  Drumstick,
  Zap,
  Store,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from "lucide-react"
import { Drawer, DrawerHeader, DrawerTitle, DrawerContent, DrawerFooter } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/stores/useCartStore"
import { cn } from "@/lib/utils"
import type { PaymentMethod } from "@/types/domain"

interface CheckoutDrawerProps {
  open: boolean
  onClose: () => void
  onProceedToPay: (data: { mobile: string; paymentMethod: PaymentMethod }) => void
}

export function CheckoutDrawer({ open, onClose, onProceedToPay }: CheckoutDrawerProps) {
  const [mobile, setMobile] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI_INSTANT")
  const [otp, setOtp] = useState("")
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)

  const entries = useCartStore((s) => s.entries)
  const subtotal = useCartStore((s) => s.subtotal())
  const gst = useCartStore((s) => s.gstAmount(5))
  const total = useCartStore((s) => s.total(5))
  const incrementItem = useCartStore((s) => s.incrementItem)
  const decrementItem = useCartStore((s) => s.decrementItem)

  // Mobile number validation (Indian 10-digit starting with 6-9)
  const isMobileValid = /^[6-9]\d{9}$/.test(mobile)
  const isOtpValid = otp === "1234"

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10)
    setMobile(val)
  }

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 4)
    setOtp(val)
  }

  const handleSubmit = () => {
    setHasAttemptedSubmit(true)
    if (!isMobileValid) return

    if (paymentMethod === "PAY_AT_COUNTER" && !isOtpValid) {
      return
    }

    onProceedToPay({
      mobile,
      paymentMethod,
    })
  }

  return (
    <Drawer open={open} onClose={onClose} className="max-h-[92vh]">
      <DrawerHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-400" />
            <DrawerTitle>Your Order Summary</DrawerTitle>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </DrawerHeader>

      <DrawerContent className="overflow-y-auto max-h-[58vh] px-4 space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
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

                <span className="text-sm font-bold text-zinc-100 ml-1 min-w-[52px] text-right">
                  ₹{(itemPrice * entry.quantity).toFixed(0)}
                </span>
              </div>
            )
          })}
        </div>

        {/* Bill breakdown */}
        <div className="bg-zinc-900/70 rounded-xl p-3.5 border border-zinc-800 space-y-2">
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
          <Separator className="bg-zinc-800" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-bold text-zinc-100">Grand Total</span>
            <span className="text-base font-bold text-emerald-400">₹{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Selector Radio Tiles */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 block">
            Select Payment Method
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {/* Tile 1: UPI Instant Pay */}
            <div
              onClick={() => setPaymentMethod("UPI_INSTANT")}
              className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer relative",
                paymentMethod === "UPI_INSTANT"
                  ? "bg-emerald-950/30 border-emerald-500/80 shadow-md shadow-emerald-950/50"
                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                      paymentMethod === "UPI_INSTANT"
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-zinc-600 bg-transparent"
                    )}
                  >
                    {paymentMethod === "UPI_INSTANT" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-emerald-400" />
                        UPI Instant Pay
                      </p>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Auto-opens Google Pay, PhonePe, Paytm or BHIM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tile 2: Pay at Counter */}
            <div
              onClick={() => setPaymentMethod("PAY_AT_COUNTER")}
              className={cn(
                "p-3 rounded-xl border transition-all cursor-pointer relative",
                paymentMethod === "PAY_AT_COUNTER"
                  ? "bg-amber-950/20 border-amber-500/80 shadow-md shadow-amber-950/40"
                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all",
                      paymentMethod === "PAY_AT_COUNTER"
                        ? "border-amber-500 bg-amber-500"
                        : "border-zinc-600 bg-transparent"
                    )}
                  >
                    {paymentMethod === "PAY_AT_COUNTER" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-black" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                      <Store className="h-3.5 w-3.5 text-amber-400" />
                      Pay at Counter
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Order goes to kitchen now; pay via Cash, Card, or Counter QR before leaving.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Number Input with strict validation */}
        <div>
          <label className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              Mobile Number <span className="text-rose-400">*</span>
            </span>
            <span className="text-[11px] text-zinc-500 font-normal">
              {paymentMethod === "PAY_AT_COUNTER" ? "Required for OTP & order confirmation" : "For digital WhatsApp invoice"}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
              +91
            </span>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="Enter 10-digit mobile number"
              value={mobile}
              onChange={handleMobileChange}
              className={cn(
                "w-full h-11 pl-12 pr-4 rounded-xl bg-zinc-900 border text-sm text-zinc-100 placeholder:text-zinc-600 font-medium tracking-wide focus:outline-none transition-all",
                hasAttemptedSubmit && !isMobileValid
                  ? "border-rose-500/80 focus:ring-1 focus:ring-rose-500/40"
                  : "border-zinc-700/80 focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40"
              )}
            />
          </div>

          {hasAttemptedSubmit && !isMobileValid && (
            <p className="flex items-center gap-1 text-xs text-rose-400 mt-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              Please enter a valid 10-digit Indian mobile number (e.g. 9820012345).
            </p>
          )}
        </div>

        {/* Pay at Counter 4-digit OTP Security Step */}
        {paymentMethod === "PAY_AT_COUNTER" && (
          <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-amber-500/30 space-y-2.5">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-zinc-200">Anti-Prank Order Verification</p>
                <p className="text-[11px] text-zinc-400">
                  To protect kitchen prep from false orders, enter the 4-digit code.
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-zinc-400">
                  Verification Code:
                </span>
                <span className="text-[11px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Demo Code: 1234
                </span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="Enter 1234"
                  value={otp}
                  onChange={handleOtpChange}
                  className={cn(
                    "w-full h-11 px-4 rounded-xl bg-zinc-950 border text-center text-lg font-bold tracking-widest text-zinc-100 placeholder:text-zinc-700 placeholder:text-sm focus:outline-none transition-all",
                    isOtpValid
                      ? "border-emerald-500/80 text-emerald-400 bg-emerald-950/20"
                      : hasAttemptedSubmit && !isOtpValid
                      ? "border-rose-500/80"
                      : "border-zinc-700 focus:border-amber-500/60"
                  )}
                />
                {isOtpValid && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                )}
              </div>

              {hasAttemptedSubmit && !isOtpValid && (
                <p className="flex items-center gap-1 text-xs text-rose-400 mt-1">
                  <AlertCircle className="h-3 w-3" />
                  Incorrect code. Please enter demo OTP "1234".
                </p>
              )}
            </div>
          </div>
        )}
      </DrawerContent>

      <DrawerFooter>
        <Button
          className={cn(
            "w-full h-13 text-sm font-bold rounded-xl",
            paymentMethod === "UPI_INSTANT"
              ? "bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-xl shadow-emerald-600/30 border border-emerald-500/50"
              : "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-zinc-950 shadow-xl shadow-amber-600/30 border border-amber-500/50",
            "transition-all duration-200 active:scale-[0.98]"
          )}
          onClick={handleSubmit}
          disabled={entries.length === 0}
        >
          {paymentMethod === "UPI_INSTANT" ? (
            <>
              <Zap className="h-4 w-4 mr-1.5" />
              Proceed to UPI Pay • ₹{total.toFixed(2)}
            </>
          ) : (
            <>
              <Store className="h-4 w-4 mr-1.5" />
              Confirm & Fire to Kitchen • ₹{total.toFixed(2)}
            </>
          )}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}
