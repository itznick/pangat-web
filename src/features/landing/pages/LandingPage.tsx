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

  React.useEffect(() => {
    // If URL has ?demo=true or #book-demo, open lead modal automatically
    if (window.location.search.includes('demo=true') || window.location.hash === '#book-demo') {
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

  return (
    <div className="dark relative min-h-screen bg-[#0c0b0a] text-zinc-100 antialiased selection:bg-emerald-500 selection:text-white overflow-x-hidden">
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
