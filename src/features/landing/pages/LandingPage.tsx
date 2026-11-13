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
import { PilotModal } from "../components/PilotModal"
import { LiveDemoModal } from "../components/LiveDemoModal"
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

  // The landing page is always strictly locked to premium dark mode
  React.useEffect(() => {
    const savedTheme = localStorage.getItem("pangat_theme")
    document.documentElement.classList.add("dark")
    document.documentElement.style.colorScheme = "dark"

    return () => {
      // Restore user's saved preference when navigating into the admin app
      if (savedTheme === "light") {
        document.documentElement.classList.remove("dark")
        document.documentElement.style.colorScheme = "light"
      }
    }
  }, [])

  const openPilot = () => setPilotModalOpen(true)

  return (
    <div className="lp dark relative min-h-screen overflow-x-clip selection:bg-white selection:text-black">
      <Navbar onOpenPilot={openPilot} />

      <main className="relative">
        <Hero onOpenPilot={openPilot} onOpenDemo={() => setDemoModalOpen(true)} />
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
      <PilotModal isOpen={pilotModalOpen} onClose={() => setPilotModalOpen(false)} />
      <LiveDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onClaimPilot={openPilot}
      />
    </div>
  )
}
