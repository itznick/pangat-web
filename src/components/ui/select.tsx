import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  className?: string
  id?: string
}

const Select = ({ value, onValueChange, options, placeholder, className, id }: SelectProps) => {
  return (
    <div className={cn("relative", className)}>
      <select
        id={id}
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 pr-8 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-zinc-800">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
    </div>
  )
}

// Simplified Select sub-components for compatibility
const SelectTrigger = ({ className, children, ...props }: React.HTMLAttributes<HTMLButtonElement>) => (
  <button className={cn("flex w-full items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500", className)} {...props}>
    {children}
    <ChevronDown className="h-4 w-4 text-zinc-400" />
  </button>
)

const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-zinc-400">{placeholder}</span>
)

export { Select, SelectTrigger, SelectValue }
