import { create } from "zustand"

/** Open/close state for the console-wide overlays. */
interface ConsoleUi {
  palette: boolean
  shortcuts: boolean
  changelog: boolean
  settings: boolean
  billing: boolean
  setPalette: (v: boolean) => void
  setShortcuts: (v: boolean) => void
  setChangelog: (v: boolean) => void
  setSettings: (v: boolean) => void
  setBilling: (v: boolean) => void
}

export const useConsoleUi = create<ConsoleUi>((set) => ({
  palette: false,
  shortcuts: false,
  changelog: false,
  settings: false,
  billing: false,
  setPalette: (palette) => set({ palette }),
  setShortcuts: (shortcuts) => set({ shortcuts }),
  setChangelog: (changelog) => set({ changelog }),
  setSettings: (settings) => set({ settings }),
  setBilling: (billing) => set({ billing }),
}))
