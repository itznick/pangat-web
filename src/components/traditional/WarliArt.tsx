import { cn } from "@/lib/utils"

interface WarliProps {
  className?: string
  opacity?: number
  strokeWidth?: number
  color?: string
}

/**
 * Authentic Maharashtrian Warli Pangat Feast Illustration
 * Features:
 * - Traditional Pangat: Diners seated cross-legged in a row on floor runners
 * - Attentive server with serving vessel & ladle
 * - Royal Maharashtrian Tutari (तुतारी) heralds
 * - Traditional earthen pots, thalis, and food offerings
 * - Decorative mango-leaf Toran & tribal sun
 */
export function WarliPangatMural({
  className,
  color = "currentColor",
}: WarliProps) {
  return (
    <svg
      viewBox="0 0 1000 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-full h-auto text-white", className)}
      aria-label="Traditional Maharashtrian Warli Pangat Feast Mural"
    >
      {/* 1. Auspicious Mango Leaf Toran along the top */}
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Festoon swag lines */}
        <path d="M 0 20 Q 125 45 250 20 Q 375 45 500 20 Q 625 45 750 20 Q 875 45 1000 20" fill="none" opacity="0.6" />
        <path d="M 0 12 L 1000 12" strokeWidth="2" opacity="0.4" />

        {/* Mango Leaves (आम्रपल्लव) hanging from the swag */}
        {[30, 60, 90, 120, 155, 185, 215, 280, 310, 340, 375, 410, 440, 470, 530, 560, 590, 625, 660, 690, 720, 780, 810, 840, 875, 910, 940, 970].map((x, i) => (
          <path
            key={i}
            d={`M ${x} 20 C ${x - 4} 32, ${x - 3} 42, ${x} 48 C ${x + 3} 42, ${x + 4} 32, ${x} 20 Z`}
            fill={color}
            fillOpacity="0.15"
          />
        ))}

        {/* Hanging Marigold flowers (झेंडू) */}
        {[125, 375, 625, 875].map((x, i) => (
          <g key={i}>
            <line x1={x} y1="36" x2={x} y2="52" strokeDasharray="2 2" opacity="0.6" />
            <circle cx={x} cy="56" r="5" fill={color} fillOpacity="0.4" />
            <circle cx={x} cy="56" r="2.5" fill={color} />
          </g>
        ))}
      </g>

      {/* 2. Traditional Warli Sun (वारली सूर्य) in background */}
      <g transform="translate(110, 90)" stroke={color} strokeWidth="1.5">
        <circle cx="0" cy="0" r="16" fill={color} fillOpacity="0.12" />
        <circle cx="0" cy="0" r="10" fill="none" strokeDasharray="3 2" />
        <circle cx="0" cy="0" r="4" fill={color} fillOpacity="0.7" />
        {/* Radiant rays */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
          <line
            key={deg}
            x1="0"
            y1="-19"
            x2="0"
            y2="-27"
            transform={`rotate(${deg})`}
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* 3. The Royal Maharashtrian Tutari Herald (तुतारी वादक) - Left Side */}
      <g transform="translate(200, 130)" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Head with Pheta (turban) */}
        <circle cx="0" cy="-22" r="6" fill={color} fillOpacity="0.9" />
        <path d="M -5 -27 C -2 -33, 4 -33, 7 -27" strokeWidth="2.5" fill="none" />
        {/* Upper Body (Warli Triangle) */}
        <path d="M -9 -14 L 9 -14 L 0 0 Z" fill={color} fillOpacity="0.9" />
        {/* Lower Body (Warli Triangle) */}
        <path d="M 0 0 L -8 18 L 8 18 Z" fill={color} fillOpacity="0.9" />
        {/* Standing Legs */}
        <path d="M -5 18 L -9 42 L -14 44" fill="none" />
        <path d="M 5 18 L 9 42 L 14 44" fill="none" />
        {/* Arms holding Tutari upwards */}
        <path d="M -8 -11 L -22 -18 L -15 -35" fill="none" />
        <path d="M 8 -11 L -4 -25 L -10 -35" fill="none" />
        {/* Tutari - Iconic Maharashtrian curved horn */}
        <path
          d="M -12 -33 C -20 -48, -15 -62, 5 -66 C 25 -70, 32 -55, 20 -44"
          fill="none"
          strokeWidth="3"
        />
        {/* Tutari flared bell */}
        <path d="M 18 -46 L 28 -40 L 25 -52 Z" fill={color} />
        {/* Festive sound tassels / ribbons */}
        <path d="M 23 -43 Q 32 -38 35 -30" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
        <path d="M 27 -47 Q 38 -45 42 -40" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
        <text x="-25" y="58" fill={color} fillOpacity="0.6" fontSize="10" fontFamily="serif">
          तुतारी
        </text>
      </g>

      {/* 4. Communal Floor Mat / Seating Runner Line (पंगत पाट / आसन) */}
      <g stroke={color}>
        {/* Traditional runner mat with woven fringe */}
        <line x1="260" y1="195" x2="960" y2="195" strokeWidth="3" strokeLinecap="round" />
        <line x1="260" y1="200" x2="960" y2="200" strokeWidth="1.5" strokeDasharray="4 3" opacity="0.5" />
        {/* Runner fringe ends */}
        <line x1="260" y1="192" x2="260" y2="203" strokeWidth="2" />
        <line x1="960" y1="192" x2="960" y2="203" strokeWidth="2" />
      </g>

      {/* 5. The Attentive Server (अन्नदाता / वाढपी) - Gracefully serving food */}
      <g transform="translate(320, 135)" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {/* Head with Maharashtrian Topi */}
        <circle cx="0" cy="-22" r="6" fill={color} fillOpacity="0.9" />
        <path d="M -5 -28 L 5 -28 L 3 -23 L -3 -23 Z" fill={color} />
        {/* Upper Body leaning forward attentively */}
        <path d="M -7 -14 L 11 -12 L 0 0 Z" fill={color} fillOpacity="0.9" />
        {/* Lower Body */}
        <path d="M 0 0 L -6 18 L 8 18 Z" fill={color} fillOpacity="0.9" />
        {/* Walking stance legs */}
        <path d="M -4 18 L -14 38 L -18 39" fill="none" />
        <path d="M 6 18 L 12 36 L 18 39" fill="none" />
        {/* Hands carrying Serving Vessel & Long Ladle (पातेले आणि पळी) */}
        <path d="M -7 -12 L 12 -4 L 25 -2" fill="none" />
        <path d="M 9 -10 L 22 -6" fill="none" />
        {/* Earthen Serving Vessel (पातेले) */}
        <ellipse cx="28" cy="-2" rx="7" ry="5" fill={color} fillOpacity="0.25" strokeWidth="1.75" />
        <ellipse cx="28" cy="-5" rx="5" ry="2" fill={color} fillOpacity="0.8" />
        {/* Ladle (पळी) pouring gracious serving */}
        <path d="M 32 -3 L 42 12" strokeWidth="2" />
        <circle cx="43" cy="14" r="3" fill={color} />
        {/* Warm aromatic steam curls */}
        <path d="M 26 -10 Q 28 -18 25 -24" strokeWidth="1.2" strokeDasharray="2 2" fill="none" opacity="0.7" />
        <path d="M 31 -10 Q 34 -18 32 -24" strokeWidth="1.2" strokeDasharray="2 2" fill="none" opacity="0.7" />
      </g>

      {/* 6. The Seated Pangat Diners (पंगतीत बसलेले अतिथी) */}
      {[
        { x: 420, label: "Table 1" },
        { x: 510, label: "Table 2" },
        { x: 600, label: "Table 3" },
        { x: 690, label: "Table 4" },
        { x: 780, label: "Table 5" },
        { x: 870, label: "Table 6" },
      ].map((diner, index) => (
        <g key={index} transform={`translate(${diner.x}, 150)`} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {/* Diner Head */}
          <circle cx="0" cy="-20" r="5.5" fill={color} fillOpacity="0.9" />

          {/* Upper Body (Warli Inverted Triangle) */}
          <path d="M -8 -13 L 8 -13 L 0 0 Z" fill={color} fillOpacity="0.9" />

          {/* Lower Body (Warli Triangle) */}
          <path d="M 0 0 L -8 15 L 8 15 Z" fill={color} fillOpacity="0.9" />

          {/* Seated Cross-Legged Stance (पद्मासन / मांडी घालून बसणे) */}
          <path d="M -8 15 L -16 26 L 16 26 L 8 15" fill={color} fillOpacity="0.25" />
          <path d="M -16 26 L -20 28" fill="none" />
          <path d="M 16 26 L 20 28" fill="none" />

          {/* Arms resting gracefully / enjoying food */}
          {index % 2 === 0 ? (
            <>
              <path d="M -7 -10 L -14 5 L -8 18" fill="none" />
              <path d="M 7 -10 L 14 5 L 12 18" fill="none" />
            </>
          ) : (
            <>
              {/* Arm reaching toward thali */}
              <path d="M -7 -10 L -12 2 L -5 18" fill="none" />
              <path d="M 7 -10 L 16 2 L 10 18" fill="none" />
            </>
          )}

          {/* Traditional Brass Thali (पितळी ताट / पत्रावळ) in front of guest */}
          <g transform="translate(0, 36)" strokeWidth="1.5">
            {/* Outer plate rim */}
            <ellipse cx="0" cy="0" rx="14" ry="4.5" fill={color} fillOpacity="0.15" />
            <ellipse cx="0" cy="0" rx="10" ry="3" fill="none" strokeDasharray="2 2" opacity="0.6" />
            {/* Katori bowls on the thali */}
            <circle cx="-5" cy="-0.5" r="2" fill={color} fillOpacity="0.6" />
            <circle cx="0" cy="-1.5" r="2" fill={color} fillOpacity="0.6" />
            <circle cx="5" cy="-0.5" r="2" fill={color} fillOpacity="0.6" />
            {/* Traditional water tumbler (तांब्या) next to thali */}
            <path d="M 18 -4 L 23 -4 L 22 4 L 19 4 Z" fill={color} fillOpacity="0.5" />
          </g>
        </g>
      ))}

      {/* 7. Traditional Sacred Tree of Life (वारली कल्पवृक्ष) - Far Right */}
      <g transform="translate(945, 120)" stroke={color} strokeWidth="1.75" strokeLinecap="round">
        {/* Trunk */}
        <line x1="0" y1="60" x2="0" y2="-10" strokeWidth="3" />
        {/* Branches */}
        <path d="M 0 30 Q 15 15 25 5" fill="none" />
        <path d="M 0 20 Q -15 5 -25 -5" fill="none" />
        <path d="M 0 0 Q 18 -15 28 -25" fill="none" />
        <path d="M 0 -10 Q -16 -25 -24 -35" fill="none" />
        {/* Warli Leaf clusters (triangular fronds) */}
        {[-35, -25, -15, -5, 5, 15, 25].map((y, i) => (
          <path
            key={i}
            d={`M ${i % 2 === 0 ? 12 : -12} ${y} L ${i % 2 === 0 ? 24 : -24} ${y - 4} L ${i % 2 === 0 ? 18 : -18} ${y + 6} Z`}
            fill={color}
            fillOpacity="0.3"
          />
        ))}
        {/* Birds perched in the tree */}
        <path d="M 15 -35 Q 20 -40 25 -38 Q 22 -33 15 -35" fill={color} />
        <path d="M -18 -15 Q -23 -20 -28 -18 Q -25 -13 -18 -15" fill={color} />
      </g>

      {/* 8. Devanagari Auspicious Blessing Tag */}
      <text
        x="500"
        y="232"
        fill={color}
        fillOpacity="0.4"
        fontSize="10"
        fontFamily="serif"
        textAnchor="middle"
        letterSpacing="3"
      >
        ॥ अतिथि देवो भव • अन्न हे पूर्णब्रह्म ॥
      </text>
    </svg>
  )
}

/**
 * Authentic Maharashtrian Sanskar Bharati Rangoli Mandala
 * Traditional geometric white rice-powder artwork drawn at entrances and dining halls
 */
export function SanskarBharatiMandala({
  className,
  size = 180,
  color = "currentColor",
}: {
  className?: string
  size?: number
  color?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-white shrink-0", className)}
      aria-label="Sanskar Bharati Rangoli Mandala"
    >
      <g stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Outer dotted circle */}
        <circle cx="100" cy="100" r="92" strokeDasharray="3 4" opacity="0.4" />
        <circle cx="100" cy="100" r="85" opacity="0.6" />

        {/* 16 Lotus Petals (कमळ पाकळ्या) */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 360) / 16
          return (
            <path
              key={i}
              d="M 100 25 C 93 42, 93 58, 100 70 C 107 58, 107 42, 100 25 Z"
              fill={color}
              fillOpacity="0.08"
              transform={`rotate(${angle} 100 100)`}
            />
          )
        })}

        {/* Mid concentric sacred ring with Gopadma / dots */}
        <circle cx="100" cy="100" r="58" strokeWidth="1.75" opacity="0.7" />
        <circle cx="100" cy="100" r="50" strokeDasharray="2 3" opacity="0.5" />

        {/* 8 Inner auspicious petals */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8
          return (
            <g key={i} transform={`rotate(${angle} 100 100)`}>
              <path
                d="M 100 52 C 95 62, 95 72, 100 80 C 105 72, 105 62, 100 52 Z"
                fill={color}
                fillOpacity="0.2"
              />
              <circle cx="100" cy="46" r="2" fill={color} />
            </g>
          )
        })}

        {/* Center Bindu & Sun Core (बिंदू व चक्र) */}
        <circle cx="100" cy="100" r="22" fill={color} fillOpacity="0.1" />
        <circle cx="100" cy="100" r="14" strokeWidth="2" />
        <circle cx="100" cy="100" r="5" fill={color} />

        {/* 4 Cardinal Gopadma curls */}
        {[0, 90, 180, 270].map((angle) => (
          <path
            key={angle}
            d="M 100 10 C 105 2, 115 5, 112 12 C 109 18, 102 18, 100 10"
            fill="none"
            transform={`rotate(${angle} 100 100)`}
            opacity="0.7"
          />
        ))}
      </g>
    </svg>
  )
}

/**
 * Traditional Maharashtrian Toran Border (तोरण धागा)
 * Decorative mango leaf and marigold runner for section breaks
 */
export function TraditionalToranBorder({
  className,
  color = "currentColor",
}: WarliProps) {
  return (
    <div className={cn("w-full overflow-hidden leading-none select-none py-1", className)}>
      <svg
        viewBox="0 0 1200 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-8 sm:h-10 text-white"
        preserveAspectRatio="none"
      >
        <g stroke={color} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          {/* Main hanging rope */}
          <line x1="0" y1="8" x2="1200" y2="8" strokeWidth="1.75" opacity="0.4" />
          <path
            d="M 0 8 Q 50 20 100 8 Q 150 20 200 8 Q 250 20 300 8 Q 350 20 400 8 Q 450 20 500 8 Q 550 20 600 8 Q 650 20 700 8 Q 750 20 800 8 Q 850 20 900 8 Q 950 20 1000 8 Q 1050 20 1100 8 Q 1150 20 1200 8"
            fill="none"
            opacity="0.5"
          />

          {/* Repeating Mango Leaves & Marigolds across 1200px */}
          {[
            25, 50, 75, 125, 150, 175, 225, 250, 275, 325, 350, 375,
            425, 450, 475, 525, 550, 575, 625, 650, 675, 725, 750, 775,
            825, 850, 875, 925, 950, 975, 1025, 1050, 1075, 1125, 1150, 1175,
          ].map((x, i) => (
            <path
              key={i}
              d={`M ${x} 12 C ${x - 3} 22, ${x - 2} 32, ${x} 38 C ${x + 2} 32, ${x + 3} 22, ${x} 12 Z`}
              fill={color}
              fillOpacity={i % 3 === 1 ? "0.3" : "0.15"}
            />
          ))}

          {/* Marigolds at apex points */}
          {[100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="8" x2={x} y2="24" strokeDasharray="2 2" opacity="0.4" />
              <circle cx={x} cy="26" r="3.5" fill={color} fillOpacity="0.4" />
              <circle cx={x} cy="26" r="1.5" fill={color} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  )
}

/**
 * Traditional Maharashtrian Warli Seamless Background Wallpaper Texture
 * Pure white vector lines creating an authentic textured backdrop reminiscent of
 * rice-paste art on Deccan basalt stone wada walls.
 */
export function WarliWallpaperPattern({
  className,
  color = "#ffffff",
  opacity = 0.05,
}: {
  className?: string
  color?: string
  opacity?: number
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden select-none", className)}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="warliPangatPattern"
            width="240"
            height="240"
            patternUnits="userSpaceOnUse"
          >
            {/* Warli Figures in harmony */}
            <g stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              {/* Figure 1: Seated Diner with Thali */}
              <g transform="translate(40, 50)">
                <circle cx="0" cy="-14" r="4.5" fill={color} />
                <path d="M -6 -8 L 6 -8 L 0 0 Z" fill={color} />
                <path d="M 0 0 L -6 10 L 6 10 Z" fill={color} />
                <path d="M -6 10 L -12 18 L 12 18 L 6 10" />
                <ellipse cx="0" cy="24" rx="9" ry="3" />
                <circle cx="0" cy="24" r="1.5" fill={color} />
              </g>

              {/* Figure 2: Server walking with pot */}
              <g transform="translate(160, 60)">
                <circle cx="0" cy="-15" r="4.5" fill={color} />
                <path d="M -5 -9 L 7 -7 L 0 0 Z" fill={color} />
                <path d="M 0 0 L -5 12 L 5 12 Z" fill={color} />
                <path d="M -4 12 L -9 24" />
                <path d="M 4 12 L 9 24" />
                <path d="M 0 -4 L 14 0" />
                <ellipse cx="16" cy="0" rx="4" ry="3" fill={color} fillOpacity="0.4" />
              </g>

              {/* Motif 3: Tutari Horn */}
              <g transform="translate(60, 170)">
                <circle cx="0" cy="-14" r="4" fill={color} />
                <path d="M -5 -8 L 5 -8 L 0 0 Z" fill={color} />
                <path d="M 0 0 L -5 10 L 5 10 Z" fill={color} />
                <path d="M -4 10 L -7 22" />
                <path d="M 4 10 L 7 22" />
                {/* Curved Tutari */}
                <path d="M -3 -8 C -10 -20, 0 -28, 14 -24" strokeWidth="2" />
                <path d="M 12 -28 L 18 -22 L 14 -20 Z" fill={color} />
              </g>

              {/* Motif 4: Small Rangoli Mandala */}
              <g transform="translate(170, 170)">
                <circle cx="0" cy="0" r="14" strokeDasharray="2 2" />
                <circle cx="0" cy="0" r="7" />
                <circle cx="0" cy="0" r="2.5" fill={color} />
                {[0, 60, 120, 180, 240, 300].map((deg) => (
                  <circle
                    key={deg}
                    cx={11 * Math.cos((deg * Math.PI) / 180)}
                    cy={11 * Math.sin((deg * Math.PI) / 180)}
                    r="1.5"
                    fill={color}
                  />
                ))}
              </g>

              {/* Floor Runner Accents */}
              <line x1="10" y1="80" x2="100" y2="80" strokeWidth="1.5" />
              <line x1="120" y1="200" x2="220" y2="200" strokeWidth="1.5" />

              {/* Auspicious dots / grains */}
              <circle cx="100" cy="40" r="1" fill={color} />
              <circle cx="110" cy="45" r="1" fill={color} />
              <circle cx="105" cy="50" r="1" fill={color} />
              <circle cx="20" cy="140" r="1" fill={color} />
              <circle cx="120" cy="130" r="1" fill={color} />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#warliPangatPattern)" />
      </svg>
    </div>
  )
}
