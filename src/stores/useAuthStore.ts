// ─────────────────────────────────────────────────────────────────────────────
// useAuthStore – Global Multi-Tenant Authentication & RBAC Store
// Manages organization context, role permissions, active outlet, and JWT tokens.
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import type { StaffUser, UserRole, Restaurant, Organization } from '@/types/domain'

interface AuthState {
  user: StaffUser | null
  organization: Organization | null
  outlets: Restaurant[]
  currentOutlet: Restaurant | null
  token: string | null
  isLoading: boolean

  // Actions
  setSession: (
    token: string,
    user: StaffUser,
    organization?: Organization | null,
    outlets?: Restaurant[],
    activeOutlet?: Restaurant
  ) => void
  setCurrentOutlet: (outlet: Restaurant) => void
  setOutlets: (outlets: Restaurant[]) => void
  addOutlet: (outlet: Restaurant) => void
  setRole: (role: UserRole) => void
  logout: () => void
  initSession: () => void
}

function loadInitialSession(): {
  user: StaffUser | null
  organization: Organization | null
  outlets: Restaurant[]
  currentOutlet: Restaurant | null
  token: string | null
} {
  const savedToken = localStorage.getItem('pangat_access_token')
  const savedUserJson = localStorage.getItem('pangat_user')
  const savedOrgJson = localStorage.getItem('pangat_org')
  const savedOutletsJson = localStorage.getItem('pangat_outlets')
  const savedActiveOutletSlug = localStorage.getItem('pangat_active_outlet_slug')

  let user: StaffUser | null = null
  let organization: Organization | null = null
  let outlets: Restaurant[] = []

  if (savedUserJson) {
    try {
      user = JSON.parse(savedUserJson)
    } catch {
      // ignore
    }
  }

  if (savedOrgJson) {
    try {
      organization = JSON.parse(savedOrgJson)
    } catch {
      // ignore
    }
  }

  if (savedOutletsJson) {
    try {
      const parsed = JSON.parse(savedOutletsJson)
      if (Array.isArray(parsed)) {
        outlets = parsed
      }
    } catch {
      // ignore
    }
  }

  const currentOutlet =
    outlets.find((o) => o.slug === savedActiveOutletSlug) || outlets[0] || null

  return {
    user,
    organization,
    outlets,
    currentOutlet,
    token: savedToken,
  }
}

const initial = loadInitialSession()

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initial.user,
  organization: initial.organization,
  outlets: initial.outlets,
  currentOutlet: initial.currentOutlet,
  token: initial.token,
  isLoading: false,

  initSession: () => {
    const session = loadInitialSession()
    set({
      user: session.user,
      organization: session.organization,
      outlets: session.outlets,
      currentOutlet: session.currentOutlet,
      token: session.token,
    })
  },

  setSession: (token, user, organization, outlets, activeOutlet) => {
    localStorage.setItem('pangat_access_token', token)
    localStorage.setItem('pangat_user', JSON.stringify(user))

    const finalOrg =
      organization ||
      get().organization ||
      (user.organizationId
        ? {
            id: user.organizationId,
            name: user.organizationName || 'My Brand',
            ownerId: user.id,
          }
        : null)

    if (finalOrg) {
      localStorage.setItem('pangat_org', JSON.stringify(finalOrg))
    }

    const finalOutlets = outlets && outlets.length > 0 ? outlets : get().outlets
    localStorage.setItem('pangat_outlets', JSON.stringify(finalOutlets))

    const finalActive =
      activeOutlet ||
      finalOutlets.find((o) => o.id === user.restaurantId || o.slug === user.restaurantSlug) ||
      finalOutlets[0] ||
      null

    if (finalActive) {
      localStorage.setItem('pangat_active_outlet_slug', finalActive.slug)
    }

    set({
      token,
      user,
      organization: finalOrg,
      outlets: finalOutlets,
      currentOutlet: finalActive,
    })
  },

  setCurrentOutlet: (outlet) => {
    localStorage.setItem('pangat_active_outlet_slug', outlet.slug)
    set({ currentOutlet: outlet })
  },

  setOutlets: (outlets) => {
    localStorage.setItem('pangat_outlets', JSON.stringify(outlets))
    const current = get().currentOutlet
    const nextCurrent =
      outlets.find((o) => o.id === current?.id || o.slug === current?.slug) ||
      outlets[0] ||
      null
    set({ outlets, currentOutlet: nextCurrent })
  },

  addOutlet: (outlet) => {
    const updated = [outlet, ...get().outlets.filter((o) => o.id !== outlet.id && o.slug !== outlet.slug)]
    localStorage.setItem('pangat_outlets', JSON.stringify(updated))
    localStorage.setItem('pangat_active_outlet_slug', outlet.slug)
    set({ outlets: updated, currentOutlet: outlet })
  },

  setRole: (role) => {
    const user = get().user
    if (!user) return
    const updated: StaffUser = { ...user, role }
    localStorage.setItem('pangat_user', JSON.stringify(updated))
    set({ user: updated })
  },

  logout: () => {
    localStorage.removeItem('pangat_access_token')
    localStorage.removeItem('pangat_user')
    localStorage.removeItem('pangat_org')
    localStorage.removeItem('pangat_outlets')
    localStorage.removeItem('pangat_active_outlet_slug')
    set({
      token: null,
      user: null,
      organization: null,
      outlets: [],
      currentOutlet: null,
    })
  },
}))
