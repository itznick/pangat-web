import { useThemeStore } from "@/stores/useThemeStore"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
  variant?: "ghost" | "outline" | "pill"
}

export function ThemeToggle({
  className,
  showLabel = false,
  variant = "outline",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === "dark"

  const baseClasses = cn(
    "relative inline-flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer select-none",
    variant === "outline" &&
      "p-2 border border-zinc-700/80 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white shadow-sm",
    variant === "ghost" &&
      "p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800",
    variant === "pill" &&
      "px-3 py-1.5 text-xs font-semibold gap-2 border border-zinc-700/80 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 shadow-sm",
    className
  )

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={baseClasses}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="relative w-4 h-4 flex items-center justify-center">
        <Sun
          className={cn(
            "h-4 w-4 text-amber-400 transition-all duration-300 absolute transform",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0"
          )}
        />
        <Moon
          className={cn(
            "h-4 w-4 text-blue-400 transition-all duration-300 absolute transform",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
      </div>

      {showLabel && (
        <span className="text-xs font-medium ml-1.5">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  )
}
