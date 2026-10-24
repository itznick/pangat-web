import * as React from "react"
import { Navbar } from "../components/Navbar"
import { Hero } from "../components/Hero"
import { CulturalCallout } from "../components/CulturalCallout"
import { ProblemSolution } from "../components/ProblemSolution"
import { HowItWorks } from "../components/HowItWorks"
import { RoiCalculator } from "../components/RoiCalculator"
import { Pricing } from "../components/Pricing"
import { Footer } from "../components/Footer"
import { PilotModal } from "../components/PilotModal"
import { LiveDemoModal } from "../components/LiveDemoModal"

export function LandingPage() {
  const [pilotModalOpen, setPilotModalOpen] = React.useState(false)
  const [demoModalOpen, setDemoModalOpen] = React.useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-emerald-500 selection:text-white">
      {/* 1. Sticky Header / Navbar */}
      <Navbar onOpenPilot={() => setPilotModalOpen(true)} />

      <main>
        {/* 2. Hero Section */}
        <Hero
          onOpenPilot={() => setPilotModalOpen(true)}
          onOpenDemo={() => setDemoModalOpen(true)}
        />

        {/* 3. The Cultural Context / "Why Pangat?" */}
        <CulturalCallout />

        {/* 4. Problem vs. Solution Grid */}
        <ProblemSolution />

        {/* 5. How It Works */}
        <HowItWorks onOpenPilot={() => setPilotModalOpen(true)} />

        {/* 6. Interactive ROI / Table Turnover Calculator */}
        <RoiCalculator onOpenPilot={() => setPilotModalOpen(true)} />

        {/* 7. Transparent Merchant Pricing */}
        <Pricing onOpenPilot={() => setPilotModalOpen(true)} />
      </main>

      {/* 8. Minimal Footer */}
      <Footer onOpenPilot={() => setPilotModalOpen(true)} />

      {/* Conversion Modals */}
      <PilotModal
        isOpen={pilotModalOpen}
        onClose={() => setPilotModalOpen(false)}
      />

      <LiveDemoModal
        isOpen={demoModalOpen}
        onClose={() => setDemoModalOpen(false)}
        onClaimPilot={() => setPilotModalOpen(true)}
      />
    </div>
  )
}
