import { create } from 'zustand'
import type { Lead } from '@/types/domain'

/** Shared open/close state so the top bar, leads table and empty states can all start the provisioning flow. */
interface ProvisionState {
  isOpen: boolean
  lead: Lead | null
  openNew: () => void
  openForLead: (lead: Lead) => void
  close: () => void
}

export const useProvisionStore = create<ProvisionState>((set) => ({
  isOpen: false,
  lead: null,
  openNew: () => set({ isOpen: true, lead: null }),
  openForLead: (lead) => set({ isOpen: true, lead }),
  close: () => set({ isOpen: false }),
}))
