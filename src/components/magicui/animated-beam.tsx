import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedBeamProps {
  className?: string
  duration?: number
  pathColor?: string
  gradientStartColor?: string
  gradientStopColor?: string
}

export function AnimatedBeam({
  className,
  duration = 2.5,
  pathColor = "rgba(255, 255, 255, 0.15)",
  gradientStartColor = "#10b981",
  gradientStopColor = "#34d399",
}: AnimatedBeamProps) {
  const id = React.useId()

  return (
    <div className={cn("relative flex items-center justify-center w-full", className)}>
      <svg
        className="w-full h-8 overflow-visible"
        viewBox="0 0 200 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`pulse-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
            <stop offset="50%" stopColor={gradientStopColor} stopOpacity="1" />
            <stop offset="100%" stopColor={gradientStartColor} stopOpacity="0" />
            <animate
              attributeName="x1"
              from="-100%"
              to="100%"
              dur={`${duration}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="x2"
              from="0%"
              to="200%"
              dur={`${duration}s`}
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>

        {/* Static track */}
        <line
          x1="0"
          y1="12"
          x2="200"
          y2="12"
          stroke={pathColor}
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Animated photon beam */}
        <line
          x1="0"
          y1="12"
          x2="200"
          y2="12"
          stroke={`url(#pulse-${id})`}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
