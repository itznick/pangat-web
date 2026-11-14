import { Activity, BarChart3, Bell, Building2, CreditCard, Inbox, LifeBuoy, ScrollText, Settings2, Store, Users, Wallet } from 'lucide-react'
import type { ElementType } from 'react'

export interface NavItem { id: string; label: string; to: string; icon: ElementType; perm: string; key: string; end?: boolean }
export interface NavGroup { label: string; items: NavItem[] }

export const NAV: NavGroup[] = [
  { label: 'Overview', items: [{ id: 'overview', label: 'Overview', to: '/super-admin', icon: BarChart3, perm: 'dashboard.view', key: 'o', end: true }] },
  {
    label: 'Customers',
    items: [
      { id: 'restaurants', label: 'Restaurants', to: '/super-admin/restaurants', icon: Building2, perm: 'restaurants.view', key: 'r' },
      { id: 'outlets', label: 'Outlets & branches', to: '/super-admin/outlets', icon: Store, perm: 'restaurants.view', key: 'b' },
      { id: 'leads', label: 'Leads & onboarding', to: '/super-admin/leads', icon: Inbox, perm: 'leads.manage', key: 'l' },
    ],
  },
  {
    label: 'Revenue',
    items: [
      { id: 'subscriptions', label: 'Subscriptions & plans', to: '/super-admin/subscriptions', icon: CreditCard, perm: 'subscriptions.view', key: 's' },
      { id: 'payments', label: 'Payments & finance', to: '/super-admin/payments', icon: Wallet, perm: 'payments.view', key: 'p' },
    ],
  },
  {
    label: 'People & support',
    items: [
      { id: 'users', label: 'Users & access', to: '/super-admin/users', icon: Users, perm: 'users.view', key: 'u' },
      { id: 'support', label: 'Support & issues', to: '/super-admin/support', icon: LifeBuoy, perm: 'support.view', key: 't' },
      { id: 'communications', label: 'Communications', to: '/super-admin/communications', icon: Bell, perm: 'notifications.view', key: 'c' },
    ],
  },
  {
    label: 'Platform',
    items: [
      { id: 'monitoring', label: 'Monitoring', to: '/super-admin/monitoring', icon: Activity, perm: 'monitoring.view', key: 'm' },
      { id: 'audit', label: 'Audit log', to: '/super-admin/audit', icon: ScrollText, perm: 'audit.view', key: 'a' },
      { id: 'settings', label: 'Settings', to: '/super-admin/settings', icon: Settings2, perm: 'settings.view', key: 'e' },
    ],
  },
]
export const ALL_NAV = NAV.flatMap((g) => g.items)

/** Old ?tab= links keep working. */
export const LEGACY_TABS: Record<string, string> = {
  overview: '/super-admin', leads: '/super-admin/leads', organizations: '/super-admin/restaurants', outlets: '/super-admin/outlets',
  subscriptions: '/super-admin/subscriptions', health: '/super-admin/monitoring',
}
