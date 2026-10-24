import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue" | "onChange"> {
  value?: number[]
  defaultValue?: number[]
  onValueChange?: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      className,
      min = 0,
      max = 100,
      step = 1,
      value,
      defaultValue,
      onValueChange,
      disabled,
      ...props
    },
    ref
  ) => {
    const isControlled = value !== undefined
    const [internalValue, setInternalValue] = React.useState<number[]>(
      defaultValue ?? [min]
    )

    const currentValue = (isControlled ? value : internalValue) ?? [min]
    const numericValue = currentValue[0] ?? min
    const percentage = Math.max(0, Math.min(100, ((numericValue - min) / (max - min)) * 100))

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVal = [parseFloat(e.target.value)]
      if (!isControlled) {
        setInternalValue(newVal)
      }
      onValueChange?.(newVal)
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center py-2 group",
          disabled && "opacity-50 pointer-events-none",
          className
        )}
      >
        <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
          <div
            className="h-full bg-emerald-600 rounded-full transition-all duration-75"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={numericValue}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10"
          {...props}
        />
        <div
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 rounded-full border-2 border-emerald-600 bg-white shadow-md ring-offset-background transition-transform duration-100 group-hover:scale-110 group-active:scale-95 dark:bg-zinc-950 dark:border-emerald-500"
          style={{ left: `${percentage}%` }}
        />
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
