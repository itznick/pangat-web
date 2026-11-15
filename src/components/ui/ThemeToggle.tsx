import { Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore, type ThemePreference } from '@/stores/useThemeStore'

const OPTIONS: { id: ThemePreference; label: string; icon: typeof Sun }[] = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
]

/** One-tap light/dark switch (icon button). */
export function ThemeToggle({ className }: { className?: string }) {
  const resolved = useThemeStore((s) => s.resolved)
  const toggle = useThemeStore((s) => s.toggle)
  const Icon = resolved === 'dark' ? Sun : Moon
  const label = resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500', className)}
    >
      <Icon className="h-[18px] w-[18px]" />
    </button>
  )
}

/** Light / Dark / System selector, for settings and account menus. */
export function ThemeSelect({ className }: { className?: string }) {
  const preference = useThemeStore((s) => s.preference)
  const setPreference = useThemeStore((s) => s.setPreference)
  return (
    <div role="radiogroup" aria-label="Theme" className={cn('inline-flex rounded-xl border border-white/10 bg-white/[0.04] p-0.5', className)}>
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={preference === id}
          onClick={() => setPreference(id)}
          className={cn('flex h-8 items-center gap-1.5 rounded-[10px] px-2.5 text-[12.5px] font-medium transition-colors', preference === id ? 'bg-emerald-500/15 text-emerald-300' : 'text-zinc-400 hover:text-white')}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  )
}
