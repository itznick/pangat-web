import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Sparkles,
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
      // Auto-hide toast after 5s
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastVisible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 shadow-2xl shadow-emerald-950 animate-in slide-in-from-top duration-300">
          <Clock className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">
            Demo request received! Our team will connect within 4 hours.
          </span>
        </div>
      )}

      <div className="relative w-full max-w-lg rounded-3xl border border-white/10 bg-zinc-950 text-white p-6 sm:p-9 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="emerald" className="text-xs font-semibold font-sans">
                Assisted B2B Provisioning
              </Badge>
              <span className="text-xs text-zinc-400 font-sans">
                Zero Upfront Tech Hassle
              </span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white font-heading">
              Book a 15-Minute Live Demo
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed font-sans">
              Our ops engineering team will inspect your floor layout, provision your branded QR standees, and connect your kitchen tablet.
            </p>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-red-950/60 border border-red-500/30 text-xs text-red-200 font-sans">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left font-sans">
              {/* Owner Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
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
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Restaurant Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
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
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
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
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* City / Area */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
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
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Daily Table Count */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Daily Table Count
                  </label>
                  <div className="relative">
                    <LayoutGrid className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <select
                      value={formData.tableCount}
                      onChange={(e) =>
                        setFormData({ ...formData, tableCount: e.target.value })
                      }
                      className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
              <div className="pt-2 text-xs text-zinc-400 space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Assisted Table Onboarding · Hardware-free QR Standees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Instant settlement directly to your restaurant UPI VPA</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-950 py-3.5 cursor-pointer font-sans"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-zinc-950" />
                      <span>Book a Demo</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div className="py-6 text-center space-y-4 font-sans">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-in zoom-in duration-300 shadow-xl shadow-emerald-950">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="text-2xl font-extrabold text-white font-heading">
              Demo Request Received!
            </h3>

            <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
              Our team will connect within <strong className="text-emerald-400">4 hours</strong> via WhatsApp to schedule your personalized live demo and setup for{" "}
              <strong className="text-zinc-100">
                {formData.restaurantName || "your restaurant"}
              </strong>.
            </p>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Owner:</span>
                <span className="text-zinc-200 font-bold">{formData.ownerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">WhatsApp Contact:</span>
                <span className="text-zinc-200 font-bold">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">City / Area:</span>
                <span className="text-zinc-200">{formData.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Daily Table Count:</span>
                <span className="text-emerald-400 font-bold">{formData.tableCount}</span>
              </div>
            </div>

            <Button
              onClick={handleReset}
              className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold cursor-pointer"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export const BookDemoModal = PilotModal
export type BookDemoModalProps = PilotModalProps
