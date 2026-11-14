import { cn } from "@/lib/utils"

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
  /** Accessible name when there is no visible <label> */
  "aria-label"?: string
}

const Switch = ({ checked, onCheckedChange, disabled, className, id, "aria-label": ariaLabel }: SwitchProps) => {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-label={ariaLabel}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 touch-manipulation before:absolute before:-inset-x-1 before:-inset-y-2.5 before:content-[''] items-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-emerald-600" : "bg-zinc-700",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}

export { Switch }
