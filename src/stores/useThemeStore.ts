import { create } from 'zustand'

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

const KEY = 'pangat_theme'
const media = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null)

function readPreference(): ThemePreference {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch {
    /* storage blocked: fall through to system */
  }
  return 'system'
}

export const resolveTheme = (pref: ThemePreference): ResolvedTheme => (pref === 'system' ? (media()?.matches === false ? 'light' : 'dark') : pref)

/** Paint the chosen theme on <html> (class for Tailwind, colour-scheme for native controls, meta for the mobile browser bar). */
export function applyTheme(theme: ResolvedTheme) {
  const root = document.documentElement
  root.classList.toggle('dark', theme === 'dark')
  root.style.colorScheme = theme
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#050506' : '#f8fafc')
}

interface ThemeState {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (p: ThemePreference) => void
  /** Flip between light and dark (leaves "system" behind) */
  toggle: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => {
  const preference = readPreference()
  return {
    preference,
    resolved: resolveTheme(preference),
    setPreference: (p) => {
      try {
        localStorage.setItem(KEY, p)
      } catch {
        /* ignore */
      }
      const resolved = resolveTheme(p)
      applyTheme(resolved)
      set({ preference: p, resolved })
    },
    toggle: () => get().setPreference(get().resolved === 'dark' ? 'light' : 'dark'),
  }
})

/** Call once at startup: apply the saved theme and follow the OS while the preference is "system". */
export function initTheme() {
  applyTheme(useThemeStore.getState().resolved)
  media()?.addEventListener('change', () => {
    const { preference } = useThemeStore.getState()
    if (preference !== 'system') return
    const resolved = resolveTheme('system')
    applyTheme(resolved)
    useThemeStore.setState({ resolved })
  })
  // keep several open tabs in sync
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    const preference = readPreference()
    const resolved = resolveTheme(preference)
    applyTheme(resolved)
    useThemeStore.setState({ preference, resolved })
  })
}
