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
  User
} from "lucide-react"

interface PilotModalProps {
  isOpen: boolean
  onClose: () => void
}

export function PilotModal({ isOpen, onClose }: PilotModalProps) {
  const [submitted, setSubmitted] = React.useState(false)
  const [formData, setFormData] = React.useState({
    cafeName: "",
    ownerName: "",
    phone: "",
    locality: "FC Road / Deccan",
    tableCount: "16-25 tables",
  })

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleReset = () => {
    setSubmitted(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in duration-200">
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
                Free 7-Day Trial
              </Badge>
              <span className="text-xs text-zinc-400 font-sans">
                Zero Upfront Card Required
              </span>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white font-heading">
              Launch Pangat in your cafe this week
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 leading-relaxed font-sans">
              We&apos;ll deliver 2 custom acrylic table standees, configure your digital menu, and set up your kitchen phone or tablet in 15 minutes.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left font-sans">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cafe / Restaurant Name
                </label>
                <div className="relative">
                  <Store className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Roast & Toast / Third Wave Coffee"
                    value={formData.cafeName}
                    onChange={(e) =>
                      setFormData({ ...formData, cafeName: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Your Name (Owner / Manager)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Deshmukh"
                    value={formData.ownerName}
                    onChange={(e) =>
                      setFormData({ ...formData, ownerName: e.target.value })
                    }
                    className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

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
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Pune Locality / City
                  </label>
                  <select
                    value={formData.locality}
                    onChange={(e) =>
                      setFormData({ ...formData, locality: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="FC Road / Deccan">FC Road / Deccan</option>
                    <option value="Koregaon Park">Koregaon Park</option>
                    <option value="Baner / Balewadi">Baner / Balewadi</option>
                    <option value="Viman Nagar / Kalyani">Viman Nagar / Kalyani</option>
                    <option value="Aundh / Kothrud">Aundh / Kothrud</option>
                    <option value="Hinjawadi Phase 1-3">Hinjawadi Phase 1-3</option>
                    <option value="Mumbai / Other City">Mumbai / Other City</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Dine-in Tables
                  </label>
                  <select
                    value={formData.tableCount}
                    onChange={(e) =>
                      setFormData({ ...formData, tableCount: e.target.value })
                    }
                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-zinc-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="5-15 tables">5 - 15 tables</option>
                    <option value="16-25 tables">16 - 25 tables</option>
                    <option value="26-40 tables">26 - 40 tables</option>
                    <option value="40+ tables">40+ tables</option>
                  </select>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-2 text-xs text-zinc-400 space-y-1.5 font-sans">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free 7-Day Trial · No credit card required upfront</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Flat ₹699/mo thereafter · Zero commission on diner bills</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-950 py-3.5 cursor-pointer font-sans"
                >
                  <Sparkles className="w-4 h-4 text-zinc-950" />
                  <span>Confirm Free 7-Day Trial Setup</span>
                  <ArrowRight className="w-4 h-4" />
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
              You&apos;re in! Welcome to Pangat.
            </h3>

            <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
              We&apos;ve received your setup request for{" "}
              <strong className="text-emerald-400">
                {formData.cafeName || "your cafe"}
              </strong>
              . Our Pune team will WhatsApp you within 2 hours to confirm your standee delivery!
            </p>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-400">Contact:</span>
                <span className="text-zinc-200 font-bold">{formData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Delivery Zone:</span>
                <span className="text-zinc-200">{formData.locality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Free Trial Period:</span>
                <span className="text-emerald-400 font-bold">7 Days Full Access</span>
              </div>
            </div>

            <Button
              onClick={handleReset}
              className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold cursor-pointer"
            >
              Back to Overview
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
