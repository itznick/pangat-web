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
        aria-label="Pangat logo"
        {...props}
      >
        <defs>
          <linearGradient id="pgBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1c1c21" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>
          <linearGradient id="pgAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
          <linearGradient id="pgLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#fcd34d" />
          </linearGradient>
        </defs>

        {variant === "solid" && (
          <>
            <rect x="2" y="2" width="52" height="52" rx="15" fill="url(#pgBg)" />
            <rect x="2.5" y="2.5" width="51" height="51" rx="14.5" stroke="#ffffff" strokeOpacity="0.14" />
          </>
        )}

        {/* Three guests seated in a row: heads over rounded shoulders, centre guest in brand green */}
        <g fill={variant === "solid" ? "#ffffff" : "currentColor"}>
          <circle cx="15.5" cy="22" r="3.6" fillOpacity="0.78" />
          <path d="M 8.5 38 a 7 7.2 0 0 1 14 0 Z" fillOpacity="0.78" />
          <circle cx="40.5" cy="22" r="3.6" fillOpacity="0.78" />
          <path d="M 33.5 38 a 7 7.2 0 0 1 14 0 Z" fillOpacity="0.78" />
        </g>
        <circle cx="28" cy="17.5" r="4.6" fill={variant === "solid" ? "url(#pgAccent)" : "currentColor"} />
        <path d="M 19.5 38 a 8.5 9 0 0 1 17 0 Z" fill={variant === "solid" ? "url(#pgAccent)" : "currentColor"} />

        {/* The shared pangat line they sit along */}
        <path
          d="M 8 44 H 48"
          stroke={variant === "solid" ? "url(#pgLine)" : "currentColor"}
          strokeWidth="2.4"
          strokeLinecap="round"
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
