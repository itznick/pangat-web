import { create } from 'zustand'

export type Theme = 'light' | 'dark'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem('pangat_theme')
    if (saved === 'light' || saved === 'dark') {
      return saved
    }
    // Default to dark for hospitality/cockpit vibe, or system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
  } catch (e) {
    // ignore local storage errors
  }
  return 'dark'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
  try {
    localStorage.setItem('pangat_theme', theme)
  } catch (e) {}
}

export const useThemeStore = create<ThemeStore>((set) => {
  const initial = getInitialTheme()
  applyTheme(initial)

  return {
    theme: initial,
    setTheme: (theme: Theme) => {
      applyTheme(theme)
      set({ theme })
    },
    toggleTheme: () => {
      set((state) => {
        const next: Theme = state.theme === 'dark' ? 'light' : 'dark'
        applyTheme(next)
        return { theme: next }
      })
    },
  }
})
