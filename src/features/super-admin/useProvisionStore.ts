import { create } from 'zustand'
import type { Lead } from '@/types/domain'

/** Shared open/close state so the top bar, leads table and empty states can all start the provisioning flow. */
interface ProvisionState {
  isOpen: boolean
  lead: Lead | null
  /** Bumped after a restaurant is provisioned so open lists can refresh */
  version: number
  openNew: () => void
  openForLead: (lead: Lead) => void
  close: () => void
  notifyProvisioned: () => void
}

export const useProvisionStore = create<ProvisionState>((set) => ({
  isOpen: false,
  lead: null,
  version: 0,
  openNew: () => set({ isOpen: true, lead: null }),
  openForLead: (lead) => set({ isOpen: true, lead }),
  close: () => set({ isOpen: false }),
  notifyProvisioned: () => set((s) => ({ version: s.version + 1 })),
}))
