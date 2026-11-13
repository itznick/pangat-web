import { create } from "zustand"

/** Open/close state for the console-wide overlays (command palette, shortcuts, changelog). */
interface ConsoleUi {
  palette: boolean
  shortcuts: boolean
  changelog: boolean
  setPalette: (v: boolean) => void
  setShortcuts: (v: boolean) => void
  setChangelog: (v: boolean) => void
}

export const useConsoleUi = create<ConsoleUi>((set) => ({
  palette: false,
  shortcuts: false,
  changelog: false,
  setPalette: (palette) => set({ palette }),
  setShortcuts: (shortcuts) => set({ shortcuts }),
  setChangelog: (changelog) => set({ changelog }),
}))
