import { WarliWallpaperPattern, SanskarBharatiMandala } from "./WarliArt"
import { cn } from "@/lib/utils"

interface TraditionalBackdropProps {
  className?: string
  showMandalas?: boolean
  showWarmGlow?: boolean
  patternOpacity?: number
}

/**
 * Traditional Maharashtrian Deccan Basalt & Rice-Art Backdrop
 * Replaces the cold generic "all-black" void with:
 * 1. Deep warm Deccan basalt stone undertone (warm dark charcoal/earth)
 * 2. Authentic chalk-white Warli vector art wallpaper pattern (Pangat diners, servers, Tutari horns)
 * 3. Soft ambient warm terracotta, turmeric amber, and emerald hospitality glows
 * 4. Sacred Sanskar Bharati Rangoli watermarks in the corners
 */
export function TraditionalBackdrop({
  className,
  showMandalas = true,
  showWarmGlow = true,
  patternOpacity = 0.055,
}: TraditionalBackdropProps) {
  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-0 z-0 overflow-hidden select-none",
        className
      )}
      aria-hidden="true"
    >
      {/* 1. Warm Deccan Stone Foundation Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0b0a09] via-[#0f0e0c] to-[#090807]" />

      {/* 2. Soft Ambient Warm Terracotta & Turmeric Hospitality Glows */}
      {showWarmGlow && (
        <>
          {/* Top-center warm amber/turmeric halo (welcoming like morning Surya) */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[480px] bg-amber-600/[0.07] rounded-full blur-[140px]" />

          {/* Top-right warm terracotta glow (traditional geru earth) */}
          <div className="absolute top-1/4 -right-32 w-[600px] h-[600px] bg-orange-700/[0.05] rounded-full blur-[160px]" />

          {/* Mid-left sacred emerald leaf glow (banana leaf patravali) */}
          <div className="absolute top-1/2 -left-32 w-[640px] h-[640px] bg-emerald-600/[0.06] rounded-full blur-[160px]" />

          {/* Bottom warm brass/gold reflection */}
          <div className="absolute -bottom-32 left-1/3 w-[680px] h-[520px] bg-amber-500/[0.05] rounded-full blur-[150px]" />
        </>
      )}

      {/* 3. Authentic Maharashtrian Warli Vector Wallpaper Pattern in Chalk-White */}
      <WarliWallpaperPattern
        color="#ffffff"
        opacity={patternOpacity}
        className="mix-blend-screen"
      />

      {/* 4. Sacred Sanskar Bharati Rangoli Watermarks in Top & Floating Positions - Kept on Big Screens, Hidden on Mobile/Tablet to keep text crisp */}
      {showMandalas && (
        <div className="hidden md:block">
          {/* Top-left corner decorative Rangoli */}
          <div className="absolute -top-16 -left-16 opacity-[0.06] rotate-12">
            <SanskarBharatiMandala size={340} color="#ffffff" />
          </div>

          {/* Top-right subtle floating Rangoli */}
          <div className="absolute top-32 -right-20 opacity-[0.05] -rotate-45">
            <SanskarBharatiMandala size={380} color="#ffffff" />
          </div>

          {/* Mid-section floating Rangoli */}
          <div className="absolute top-[48%] -right-28 opacity-[0.04] rotate-180">
            <SanskarBharatiMandala size={440} color="#ffffff" />
          </div>

          {/* Bottom-left Rangoli near footer */}
          <div className="absolute bottom-20 -left-20 opacity-[0.05] rotate-45">
            <SanskarBharatiMandala size={360} color="#ffffff" />
          </div>
        </div>
      )}

      {/* 5. Subtle Vignette so content stays hyper-legible and sharp */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-black/40" />
    </div>
  )
}
