import * as React from "react"
import { cn } from "@/lib/utils"

interface PangatLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "solid" | "monochrome" | "minimal"
  showText?: boolean
  className?: string
}

const sizeMap = {
  sm: { icon: "w-8 h-8", text: "text-lg", devanagari: "text-xs" },
  md: { icon: "w-10 h-10", text: "text-xl", devanagari: "text-xs" },
  lg: { icon: "w-14 h-14", text: "text-3xl", devanagari: "text-sm" },
  xl: { icon: "w-20 h-20", text: "text-4xl", devanagari: "text-base" },
}

export function PangatLogo({
  size = "md",
  variant = "solid",
  showText = false,
  className,
  ...props
}: PangatLogoProps) {
  const { icon: iconSize, text: textSize, devanagari: devanagariSize } = sizeMap[size]

  return (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {/* Seated Pangat Icon SVG */}
      <svg
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(iconSize, "shrink-0 transition-transform duration-200 group-hover:scale-105")}
        aria-label="Pangat Logo - Diners Seated in a Row"
        {...props}
      >
        <defs>
          <linearGradient id="pangatBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="50%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id="pangatLeaf" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="thaliGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {variant === "solid" && (
          <>
            {/* Rounded Squircle Container */}
            <rect
              x="2"
              y="2"
              width="52"
              height="52"
              rx="14"
              fill="url(#pangatBg)"
              className="drop-shadow-sm"
            />
            {/* Subtle inner highlight rim */}
            <rect
              x="2.5"
              y="2.5"
              width="51"
              height="51"
              rx="13.5"
              stroke="#6ee7b7"
              strokeOpacity="0.25"
              strokeWidth="1"
            />
          </>
        )}

        {/* ========================================================
            THE PANGAT SEATING: 3 Diners seated in traditional harmony
            ======================================================== */}

        {/* 1. Traditional Communal Floor Mat / Service Line (Paat / Pangat line) */}
        <path
          d="M 6 42.5 L 50 42.5"
          stroke={variant === "solid" ? "#a7f3d0" : "currentColor"}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeOpacity={variant === "solid" ? "0.45" : "0.3"}
        />

        {/* 2. Traditional Thali / Dining Leaves before each seated guest */}
        {/* Left Guest Thali */}
        <ellipse
          cx="15"
          cy="38.5"
          rx="4.2"
          ry="1.8"
          fill="url(#thaliGold)"
        />
        <circle cx="15" cy="38.5" r="1.1" fill="#ffffff" fillOpacity="0.9" />

        {/* Center Guest Thali (Slightly larger, prime feast position) */}
        <ellipse
          cx="28"
          cy="38"
          rx="5"
          ry="2"
          fill="url(#thaliGold)"
        />
        <circle cx="28" cy="38" r="1.3" fill="#ffffff" fillOpacity="0.9" />

        {/* Right Guest Thali */}
        <ellipse
          cx="41"
          cy="38.5"
          rx="4.2"
          ry="1.8"
          fill="url(#thaliGold)"
        />
        <circle cx="41" cy="38.5" r="1.1" fill="#ffffff" fillOpacity="0.9" />

        {/* 3. Seated Diners Silhouettes (Cross-legged dining posture) */}

        {/* --- LEFT DINER --- */}
        {/* Head */}
        <circle
          cx="15"
          cy="18.5"
          r="3.5"
          fill={variant === "solid" ? "#ffffff" : "currentColor"}
        />
        {/* Seated Torso & Crossed-Leg Lap */}
        <path
          d="M 8.5 33.5 C 8.5 26.5 11.2 24.5 15 24.5 C 18.8 24.5 21.5 26.5 21.5 33.5 C 21.5 34.5 20.5 35 15 35 C 9.5 35 8.5 34.5 8.5 33.5 Z"
          fill={variant === "solid" ? "#ffffff" : "currentColor"}
          fillOpacity={variant === "solid" ? "0.92" : "1"}
        />

        {/* --- CENTER DINER (Elevated slightly for visual hierarchy) --- */}
        {/* Head */}
        <circle
          cx="28"
          cy="15.5"
          r="4"
          fill={variant === "solid" ? "#ffffff" : "currentColor"}
        />
        {/* Seated Torso & Crossed-Leg Lap */}
        <path
          d="M 20.5 32 C 20.5 24.5 23.5 22 28 22 C 32.5 22 35.5 24.5 35.5 32 C 35.5 33.5 34 34.5 28 34.5 C 22 34.5 20.5 33.5 20.5 32 Z"
          fill={variant === "solid" ? "#ffffff" : "currentColor"}
          fillOpacity="1"
        />

        {/* --- RIGHT DINER --- */}
        {/* Head */}
        <circle
          cx="41"
          cy="18.5"
          r="3.5"
          fill={variant === "solid" ? "#ffffff" : "currentColor"}
        />
        {/* Seated Torso & Crossed-Leg Lap */}
        <path
          d="M 34.5 33.5 C 34.5 26.5 37.2 24.5 41 24.5 C 44.8 24.5 47.5 26.5 47.5 33.5 C 47.5 34.5 46.5 35 41 35 C 35.5 35 34.5 34.5 34.5 33.5 Z"
          fill={variant === "solid" ? "#ffffff" : "currentColor"}
          fillOpacity={variant === "solid" ? "0.92" : "1"}
        />

        {/* 4. Subtle hospitality steam/warmth arc above center diner */}
        <path
          d="M 26 10 C 27 8.5 29 8.5 30 10"
          stroke="#fde68a"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
      </svg>

      {/* Optional Wordmark */}
      {showText && (
        <div className="flex items-baseline gap-1.5">
          <span className={cn("font-bold tracking-tight text-zinc-900 dark:text-white font-heading", textSize)}>
            Pangat
          </span>
          <span className={cn("font-serif text-emerald-700 dark:text-emerald-400 font-medium", devanagariSize)}>
            (पंगत)
          </span>
        </div>
      )}
    </div>
  )
}
