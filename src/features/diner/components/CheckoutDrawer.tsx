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
  Wallet,
  Sparkles,
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
    <Drawer open={open} onClose={onClose} className="max-h-[94vh]">
      <DrawerHeader className="border-b border-zinc-800/80 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <DrawerTitle className="text-base font-bold text-zinc-100">Checkout & Order</DrawerTitle>
              <p className="text-[11px] text-zinc-500 font-medium">Review items & payment option</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </DrawerHeader>

      <DrawerContent className="overflow-y-auto max-h-[70vh] px-4 py-4 space-y-6">
        {/* Cart Items List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400 px-0.5">
            <span>Items Ordered</span>
            <span className="text-zinc-500 font-medium">{entries.length} {entries.length === 1 ? 'item' : 'items'}</span>
          </div>

          <div className="space-y-2.5">
            {entries.map((entry) => {
              const modTotal = entry.selectedModifiers.reduce((sum, m) => sum + m.price, 0)
              const itemPrice = entry.price + modTotal
              return (
                <div
                  key={entry._localId}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/60"
                >
                  {/* Dietary indicator */}
                  <div className="mt-0.5 flex-shrink-0">
                    {entry.isVeg ? (
                      <span className="inline-flex p-1 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                        <Leaf className="h-3.5 w-3.5 text-emerald-500" />
                      </span>
                    ) : (
                      <span className="inline-flex p-1 rounded-md bg-rose-500/10 border border-rose-500/20">
                        <Drumstick className="h-3.5 w-3.5 text-rose-500" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 leading-snug">{entry.name}</p>
                    {entry.selectedModifiers.length > 0 && (
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {entry.selectedModifiers.map((m) => m.name).join(", ")}
                      </p>
                    )}
                    {entry.notes && (
                      <p className="text-xs text-amber-400/90 mt-0.5 italic">"{entry.notes}"</p>
                    )}
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => decrementItem(entry._localId)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                    >
                      <Minus className="h-3 w-3 text-zinc-300" />
                    </button>
                    <span className="text-sm font-bold text-zinc-100 w-4 text-center">{entry.quantity}</span>
                    <button
                      onClick={() => incrementItem(entry._localId)}
                      className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center hover:bg-zinc-700 transition-colors"
                    >
                      <Plus className="h-3 w-3 text-zinc-300" />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-zinc-100 ml-1 min-w-[54px] text-right">
                    ₹{((Number(itemPrice) || 0) * entry.quantity).toFixed(0)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bill Breakdown Card */}
        <div className="bg-zinc-900/80 rounded-2xl p-4 border border-zinc-800 space-y-2.5 shadow-sm">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Subtotal</span>
            <span className="text-zinc-200 font-medium">₹{Number(subtotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400 flex items-center gap-1">
              <IndianRupee className="h-3 w-3 text-zinc-500" />
              Taxes & GST (5%)
            </span>
            <span className="text-zinc-200 font-medium">₹{Number(gst || 0).toFixed(2)}</span>
          </div>
          <Separator className="bg-zinc-800/90 my-1" />
          <div className="flex justify-between items-center pt-0.5">
            <div>
              <span className="text-sm font-bold text-zinc-100">Total Payable</span>
              <p className="text-[11px] text-zinc-500">Includes all applicable taxes</p>
            </div>
            <span className="text-lg font-black text-emerald-400">₹{Number(total || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* Spacious & Elevated Payment Selector (Enhanced layout) */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-emerald-400" />
              Select Payment Method
            </span>
            <span className="text-[11px] text-zinc-500 font-medium">Choose preferred mode</span>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {/* Option 1: UPI Instant Pay */}
            <div
              onClick={() => setPaymentMethod("UPI_INSTANT")}
              className={cn(
                "p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative",
                paymentMethod === "UPI_INSTANT"
                  ? "bg-gradient-to-r from-emerald-950/40 to-zinc-900 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/50"
                  : "bg-zinc-900/50 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/80"
              )}
            >
              <div className="flex items-start gap-3.5">
                {/* Radio Circle */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0",
                    paymentMethod === "UPI_INSTANT"
                      ? "border-emerald-400 bg-emerald-500"
                      : "border-zinc-600 bg-transparent"
                  )}
                >
                  {paymentMethod === "UPI_INSTANT" && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </div>

                {/* Icon Box */}
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-5 w-5 text-emerald-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                      UPI Instant Pay
                    </p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                      <Sparkles className="h-2.5 w-2.5" />
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Auto-opens Google Pay, PhonePe, Paytm, CRED or BHIM with seamless 1-tap confirmation.
                  </p>
                </div>
              </div>
            </div>

            {/* Option 2: Pay at Counter */}
            <div
              onClick={() => setPaymentMethod("PAY_AT_COUNTER")}
              className={cn(
                "p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative",
                paymentMethod === "PAY_AT_COUNTER"
                  ? "bg-gradient-to-r from-amber-950/30 to-zinc-900 border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-950/40"
                  : "bg-zinc-900/50 border-zinc-800/90 hover:border-zinc-700 hover:bg-zinc-900/80"
              )}
            >
              <div className="flex items-start gap-3.5">
                {/* Radio Circle */}
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all mt-0.5 flex-shrink-0",
                    paymentMethod === "PAY_AT_COUNTER"
                      ? "border-amber-400 bg-amber-500"
                      : "border-zinc-600 bg-transparent"
                  )}
                >
                  {paymentMethod === "PAY_AT_COUNTER" && (
                    <div className="w-2 h-2 rounded-full bg-black" />
                  )}
                </div>

                {/* Icon Box */}
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Store className="h-5 w-5 text-amber-400" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                      Pay at Counter
                    </p>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                      Cash / Card
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Order fires to kitchen immediately; settle bill at counter via Cash, Card, or QR before leaving.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Number Input Section */}
        <div className="space-y-2 pt-1">
          <label className="flex items-center justify-between text-xs font-semibold text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Smartphone className="h-3.5 w-3.5 text-emerald-400" />
              Mobile Number <span className="text-rose-400">*</span>
            </span>
            <span className="text-[11px] text-zinc-500 font-normal">
              {paymentMethod === "PAY_AT_COUNTER" ? "Required for anti-prank OTP" : "For digital WhatsApp receipt"}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
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
                "w-full h-12 pl-13 pr-4 rounded-xl bg-zinc-900 border text-sm text-zinc-100 placeholder:text-zinc-600 font-medium tracking-wide focus:outline-none transition-all",
                hasAttemptedSubmit && !isMobileValid
                  ? "border-rose-500/80 focus:ring-1 focus:ring-rose-500/40 bg-rose-950/10"
                  : "border-zinc-750 focus:border-emerald-500/70 focus:ring-1 focus:ring-emerald-500/40"
              )}
            />
          </div>

          {hasAttemptedSubmit && !isMobileValid && (
            <p className="flex items-center gap-1.5 text-xs text-rose-400 mt-1 px-1">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              Please enter a valid 10-digit Indian mobile number (e.g. 9820012345).
            </p>
          )}
        </div>

        {/* Pay at Counter 4-digit OTP Security Step */}
        {paymentMethod === "PAY_AT_COUNTER" && (
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 space-y-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <ShieldCheck className="h-4 w-4 text-amber-400 flex-shrink-0" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-100">Anti-Prank Order Verification</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  To protect our kitchen from fake QR fires, please enter the demo code below.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">
                  Enter 4-Digit Code:
                </span>
                <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-md border border-amber-500/30">
                  Demo OTP: 1234
                </span>
              </div>
              <div className="relative">
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="1234"
                  value={otp}
                  onChange={handleOtpChange}
                  className={cn(
                    "w-full h-12 px-4 rounded-xl bg-zinc-950 border text-center text-lg font-bold tracking-[0.4em] text-zinc-100 placeholder:text-zinc-700 placeholder:tracking-normal focus:outline-none transition-all",
                    isOtpValid
                      ? "border-emerald-500 text-emerald-400 bg-emerald-950/20 ring-1 ring-emerald-500/40"
                      : hasAttemptedSubmit && !isOtpValid
                      ? "border-rose-500/80 bg-rose-950/10"
                      : "border-zinc-700 focus:border-amber-500/70"
                  )}
                />
                {isOtpValid && (
                  <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                )}
              </div>

              {hasAttemptedSubmit && !isOtpValid && (
                <p className="flex items-center gap-1 text-xs text-rose-400 mt-1 px-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  Incorrect code. Please enter demo OTP "1234".
                </p>
              )}
            </div>
          </div>
        )}
      </DrawerContent>

      <DrawerFooter className="border-t border-zinc-800/80 pt-3">
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
              Proceed to UPI Pay • ₹{Number(total || 0).toFixed(2)}
            </>
          ) : (
            <>
              <Store className="h-4 w-4 mr-1.5" />
              Confirm & Fire to Kitchen • ₹{Number(total || 0).toFixed(2)}
            </>
          )}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}
