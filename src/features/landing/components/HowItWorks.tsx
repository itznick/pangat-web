import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  QrCode,
  CreditCard,
  BellRing,
  CheckCircle2,
  Zap,
  ArrowRight,
  ShieldCheck,
  Volume2
} from "lucide-react"

interface HowItWorksProps {
  onOpenPilot: () => void
}

export function HowItWorks({ onOpenPilot }: HowItWorksProps) {
  const [activeStep, setActiveStep] = React.useState<number>(1)

  const steps = [
    {
      step: 1,
      title: "Scan Acrylic Table QR",
      subtitle: "Zero app download · Instant 0.8s load",
      icon: QrCode,
      description:
        "The diner sits at Table 04, opens their native phone camera, and scans your branded acrylic table standee. Pangat loads immediately in Chrome or Safari without asking them to install any app or enter OTPs.",
      details: [
        "Works with standard iOS Camera & Google Lens",
        "Zero registration or OTP friction for guests",
        "Geofenced to the exact table number automatically",
        "Crisp visual imagery with diet & allergen tags",
      ],
      previewHeadline: "Table 04 Ready",
      previewSub: "Digital Menu Loaded in 800ms",
      badgeColor: "emerald",
    },
    {
      step: 2,
      title: "Customize & Pay via UPI",
      subtitle: "Google Pay, PhonePe, Paytm · 0% commission",
      icon: CreditCard,
      description:
        "Guests choose their milk alternatives (Oat, Almond, Dairy), spice level, or extra shots. They tap 'Pay via UPI' and authorize instantly via Google Pay or PhonePe. Money transfers directly into your merchant bank account.",
      details: [
        "Visual modifiers with live price updates",
        "1-tap intent launch into GPay, PhonePe, Paytm & Cred",
        "Zero merchant payment cut (100% of the bill is yours)",
        "Automated digital invoice sent to diner's WhatsApp",
      ],
      previewHeadline: "UPI Paid ₹546",
      previewSub: "Direct Bank Settlement Confirmed",
      badgeColor: "amber",
    },
    {
      step: 3,
      title: "Audible Kitchen Chime",
      subtitle: "Live KDS alert on any staff phone or tablet",
      icon: BellRing,
      description:
        "The moment payment clears, the barista's station phone or kitchen tablet rings with a loud, distinctive audible chime. The order appears on the live Web KDS with clear modifier tags and an elapsed preparation timer.",
      details: [
        "Unmissable audible chime sounds even in noisy kitchens",
        "Clear modifier callouts (e.g., 'OAT MILK', 'EXTRA CRISPY')",
        "Runs on any old Android tablet or kitchen smartphone",
        "One-tap 'Ready' state alerts the server or guest",
      ],
      previewHeadline: "Kitchen Chime Ringing 🔔",
      previewSub: "Ticket #T-104 on Barista KDS",
      badgeColor: "emerald",
    },
  ]

  const current = steps.find((s) => s.step === activeStep) || steps[0]
  const CurrentIcon = current.icon

  return (
    <section id="how-it-works" className="py-16 lg:py-24 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-200/80 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="emerald" className="mb-3 text-xs uppercase tracking-wider font-semibold">
            Simple 3-Step Flow
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
            From table scan to kitchen chime in{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              under 30 seconds.
            </span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Engineered to remove every micro-delay between your guest sitting down and your barista starting their brew.
          </p>
        </div>

        {/* Step-by-Step Interactive Cards Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Step Selector (Span 6) */}
          <div className="lg:col-span-6 space-y-4">
            {steps.map((item) => {
              const Icon = item.icon
              const isSelected = activeStep === item.step

              return (
                <div
                  key={item.step}
                  onClick={() => setActiveStep(item.step)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-white border-emerald-600 shadow-md ring-1 ring-emerald-600 dark:bg-zinc-950 dark:border-emerald-500"
                      : "bg-white/70 border-zinc-200/80 hover:bg-white hover:border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-850"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm transition-colors ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {item.step}
                    </div>

                    <div className="grow">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-bold text-zinc-950 dark:text-white">
                          {item.title}
                        </h3>
                        <Icon
                          className={`w-4 h-4 ${
                            isSelected
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-400"
                          }`}
                        />
                      </div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {item.subtitle}
                      </p>
                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Visual Interactive Stage Preview (Span 6) */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-950 relative overflow-hidden">
              {/* Background ambient badge */}
              <div
                className="absolute -top-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-850">
                <div className="flex items-center gap-2">
                  <Badge variant="emerald" className="text-xs font-semibold">
                    Step {current.step} of 3
                  </Badge>
                  <span className="text-xs font-mono text-zinc-400">
                    pangat-flow://step-{current.step}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Real-time Sync</span>
                </div>
              </div>

              {/* Step Simulation Visual Mock */}
              <div className="my-6 p-6 rounded-2xl bg-zinc-950 text-white border border-zinc-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400">
                      <CurrentIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        {current.previewHeadline}
                      </h4>
                      <p className="text-xs text-zinc-400 font-mono">
                        {current.previewSub}
                      </p>
                    </div>
                  </div>

                  {current.step === 3 && (
                    <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/70 border border-amber-800 px-2.5 py-1 rounded-full animate-bounce">
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Audio Alert!</span>
                    </div>
                  )}
                </div>

                {/* Step specific UI graphics */}
                {current.step === 1 && (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Camera QR Scanner</span>
                      <span className="text-emerald-400 font-mono">QR Decoded ✓</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-full animate-pulse" />
                    </div>
                    <p className="text-[11px] text-zinc-400">
                      "Pangat Web Menu opened automatically. Table #4 assigned."
                    </p>
                  </div>
                )}

                {current.step === 2 && (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>UPI Gateway Intent</span>
                      <span className="text-emerald-400 font-mono">₹546.00</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="px-2 py-1 rounded bg-zinc-800 text-[11px] font-medium text-zinc-200">
                        Google Pay
                      </span>
                      <span className="px-2 py-1 rounded bg-zinc-800 text-[11px] font-medium text-zinc-200">
                        PhonePe
                      </span>
                      <span className="px-2 py-1 rounded bg-zinc-800 text-[11px] font-medium text-zinc-200">
                        Paytm UPI
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Direct Merchant VPA: pangat@icici · 0% commission cut</span>
                    </div>
                  </div>
                )}

                {current.step === 3 && (
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span>Kitchen KDS Terminal</span>
                      <span className="text-amber-400 font-mono">Loud Chime Triggered</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] flex justify-between items-center">
                      <span className="text-zinc-200">
                        #T-104 · 1x Cold Brew (Oat) + 1x Toastie
                      </span>
                      <span className="text-emerald-400 font-semibold">PREPARING</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Feature Checklist for this step */}
              <div className="space-y-2.5">
                <h5 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Key Capabilities in Step {current.step}
                </h5>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
                  {current.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom CTA in Step Box */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-850 flex items-center justify-between">
                <span className="text-xs text-zinc-500">
                  Ready to test with your own menu?
                </span>
                <Button
                  onClick={onOpenPilot}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 cursor-pointer"
                >
                  Start Pilot
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
