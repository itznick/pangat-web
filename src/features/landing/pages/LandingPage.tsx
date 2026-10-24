import * as React from "react"
import { Navbar } from "../components/Navbar"
import { Hero } from "../components/Hero"
import { CulturalCallout } from "../components/CulturalCallout"
import { WarliArtSection } from "../components/WarliArtSection"
import { ProblemSolution } from "../components/ProblemSolution"
import { HowItWorks } from "../components/HowItWorks"
import { RoiCalculator } from "../components/RoiCalculator"
import { Pricing } from "../components/Pricing"
import { Footer } from "../components/Footer"
import { PilotModal } from "../components/PilotModal"
import { LiveDemoModal } from "../components/LiveDemoModal"
import { TraditionalBackdrop } from "@/components/traditional/TraditionalBackdrop"
import { TraditionalToranBorder } from "@/components/traditional/WarliArt"

export function LandingPage() {
  const [pilotModalOpen, setPilotModalOpen] = React.useState(false)
  const [demoModalOpen, setDemoModalOpen] = React.useState(false)

  return (
    <div className="relative min-h-screen bg-[#0c0b0a] text-zinc-100 antialiased selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      {/* Authentic Maharashtrian Traditional Backdrop: Warli art in chalk-white + Deccan stone warmth */}
      <TraditionalBackdrop patternOpacity={0.075} />

      {/* 1. Sticky Header / Navbar */}
      <Navbar onOpenPilot={() => setPilotModalOpen(true)} />

      <main className="relative z-10">
        {/* 2. Hero Section */}
        <Hero
          onOpenPilot={() => setPilotModalOpen(true)}
          onOpenDemo={() => setDemoModalOpen(true)}
        />

        {/* Traditional Toran Runner before Cultural Callout */}
        <div className="max-w-6xl mx-auto px-4 opacity-40">
          <TraditionalToranBorder />
        </div>

        {/* 3. The Cultural Context / "Why Pangat?" */}
        <CulturalCallout />

        {/* 3b. Dedicated Full-Width Black Section for the Warli Painting Exhibition */}
        <WarliArtSection />

        {/* 4. Problem vs. Solution Grid */}
        <ProblemSolution />

        {/* 5. How It Works */}
        <HowItWorks />

        {/* 6. Interactive ROI / Table Turnover Calculator */}
        <RoiCalculator onOpenPilot={() => setPilotModalOpen(true)} />

        {/* Traditional Toran Runner before Pricing */}
        <div className="max-w-6xl mx-auto px-4 opacity-40">
          <TraditionalToranBorder />
        </div>

        {/* 7. Transparent Merchant Pricing */}
        <Pricing onOpenPilot={() => setPilotModalOpen(true)} />
      </main>

      {/* 8. Modern Cultural Footer */}
      <div className="relative z-10">
        <Footer onOpenPilot={() => setPilotModalOpen(true)} />
      </div>

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
