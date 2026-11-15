import * as React from "react"
import { Navbar } from "../components/Navbar"
import { Hero } from "../components/Hero"
import { Statement, Proof } from "../components/Statement"
import { Journey } from "../components/Journey"
import { Operations } from "../components/Operations"
import { Heritage } from "../components/Heritage"
import { RoiCalculator } from "../components/RoiCalculator"
import { Pricing } from "../components/Pricing"
import { Footer } from "../components/Footer"
const PilotModal = React.lazy(() => import("../components/PilotModal").then((m) => ({ default: m.PilotModal })))
const LiveDemoModal = React.lazy(() => import("../components/LiveDemoModal").then((m) => ({ default: m.LiveDemoModal })))
import "../landing.css"

export function LandingPage() {
  const [pilotModalOpen, setPilotModalOpen] = React.useState(false)
  const [demoModalOpen, setDemoModalOpen] = React.useState(false)

  React.useEffect(() => {
    // If URL has ?demo=true or #book-demo, open lead modal automatically
    if (window.location.search.includes("demo=true") || window.location.hash === "#book-demo") {
      setPilotModalOpen(true)
    }
  }, [])

  const openPilot = React.useCallback(() => setPilotModalOpen(true), [])
  const closePilot = React.useCallback(() => setPilotModalOpen(false), [])
  const openDemo = React.useCallback(() => setDemoModalOpen(true), [])
  const closeDemo = React.useCallback(() => setDemoModalOpen(false), [])

  return (
    <div className="lp relative min-h-screen overflow-x-clip selection:bg-white selection:text-black">
      <Navbar onOpenPilot={openPilot} />

      <main className="relative">
        <Hero onOpenPilot={openPilot} onOpenDemo={openDemo} />
        <Statement />
        <Proof />
        <Journey onOpenPilot={openPilot} />
        <Operations />
        <Heritage />
        <RoiCalculator onOpenPilot={openPilot} />
        <Pricing onOpenPilot={openPilot} />
      </main>

      <Footer onOpenPilot={openPilot} />

      {/* Conversion modals */}
      <React.Suspense fallback={null}>
        {pilotModalOpen && <PilotModal isOpen onClose={closePilot} />}
        {demoModalOpen && <LiveDemoModal isOpen onClose={closeDemo} onClaimPilot={openPilot} />}
      </React.Suspense>
    </div>
  )
}
