import * as React from "react"
import {
  X,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Phone,
  Store,
  User,
  MapPin,
  LayoutGrid,
  Loader2,
  Clock,
} from "lucide-react"
import { api } from "@/lib/api"

interface PilotModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PilotModal({ isOpen, onClose }: PilotModalProps) {
  const [submitted, setSubmitted] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [toastVisible, setToastVisible] = React.useState(false)

  const [formData, setFormData] = React.useState({
    ownerName: "",
    restaurantName: "",
    city: "Hinjawadi, Pune",
    phone: "",
    tableCount: "12 tables",
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage(null)

    try {
      await api.leads.create({
        name: formData.ownerName,
        restaurantName: formData.restaurantName,
        city: formData.city,
        phone: formData.phone,
        tableCount: formData.tableCount,
      })

      setSubmitted(true)
      setToastVisible(true)
      setTimeout(() => setToastVisible(false), 5000)
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to submit demo request. Please check your network.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleReset = () => {
    setSubmitted(false)
    setErrorMessage(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastVisible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-5 py-3 rounded-full bg-white text-zinc-950 shadow-2xl animate-in slide-in-from-top duration-300">
          <Clock className="w-4 h-4 text-zinc-950 shrink-0" />
          <span className="text-xs sm:text-sm font-medium">
            Demo request received. Our team will connect within 4 hours.
          </span>
        </div>
      )}

      <div className="relative w-full max-w-lg rounded-3xl border border-white/[0.08] bg-zinc-950 text-white p-6 sm:p-9 shadow-2xl max-h-[92vh] overflow-y-auto ring-1 ring-white/[0.04]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {!submitted ? (
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300 mb-3 font-normal">
              <span>On-Site Setup in Pune</span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white font-heading">
              Book a 15-Minute Live Demo
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed">
              We&apos;ll bring sample branded acrylic standees to your cafe, configure your menu live in 15 minutes, and test the audio chime alert.
            </p>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-500/20 text-xs text-red-200">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              {/* Owner Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Owner / Decision Maker Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sagar Jadhav"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                </div>
              </div>

              {/* Restaurant Name */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Restaurant / Cafe Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pangat Misal & Cafe"
                    value={formData.restaurantName}
                    onChange={(e) =>
                      setFormData({ ...formData, restaurantName: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  WhatsApp Contact Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98900 12345"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* City / Area */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    City / Area
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hinjawadi, Pune"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-white/[0.03] text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/30"
                    />
                  </div>
                </div>

                {/* Daily Table Count */}
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">
                    Daily Table Count
                  </label>
                  <div className="relative">
                    <LayoutGrid className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <select
                      value={formData.tableCount}
                      onChange={(e) =>
                        setFormData({ ...formData, tableCount: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/[0.08] bg-zinc-900 text-white focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer"
                    >
                      <option value="6-12 tables">6 - 12 tables</option>
                      <option value="13-24 tables">13 - 24 tables</option>
                      <option value="25-40 tables">25 - 40 tables</option>
                      <option value="40+ tables">40+ tables</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-2 text-xs text-zinc-400 space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Free on-site standee trial · Zero hardware purchase</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span>Direct UPI settlement to your bank account</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm rounded-full py-3.5 cursor-pointer shadow-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Book Free Demo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-white/[0.08] text-white flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 className="text-2xl font-bold text-white font-heading">
              Demo Request Received
            </h3>

            <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Our team will connect within <strong className="text-white">4 hours</strong> via WhatsApp to schedule your personalized live demo for{" "}
              <strong className="text-zinc-200">
                {formData.restaurantName || "your restaurant"}
              </strong>.
            </p>

            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Owner:</span>
                <span className="text-zinc-200 font-medium">{formData.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">WhatsApp Contact:</span>
                <span className="text-zinc-200 font-medium">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">City / Area:</span>
                <span className="text-zinc-200">{formData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Daily Table Count:</span>
                <span className="text-zinc-200 font-medium">{formData.tableCount}</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-full bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-sm transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export const BookDemoModal = PilotModal
export type BookDemoModalProps = PilotModalProps
