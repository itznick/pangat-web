import * as React from "react"
import { cn } from "@/lib/utils"

interface NumberTickerProps {
  value: number
  direction?: "up" | "down"
  delay?: number
  className?: string
  decimalPlaces?: number
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
}: NumberTickerProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const [displayValue, setDisplayValue] = React.useState(
    direction === "down" ? value : 0
  )

  React.useEffect(() => {
    let startTime: number | null = null
    const duration = 1200 // 1.2s smooth ticker

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3)
      const current =
        direction === "up" ? ease * value : value - ease * value

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    const timer = setTimeout(() => {
      requestAnimationFrame(animate)
    }, delay * 1000)

    return () => clearTimeout(timer)
  }, [value, direction, delay])

  return (
    <span ref={ref} className={cn("inline-block tabular-nums", className)}>
      {decimalPlaces > 0
        ? displayValue.toFixed(decimalPlaces)
        : Math.round(displayValue).toLocaleString("en-IN")}
    </span>
  )
}
