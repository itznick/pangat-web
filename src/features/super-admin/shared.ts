import { sa } from './api'
import { invalidateShared, useShared, usePerms } from './hooks'

/** Reference data used across the console. Each is requested once, then served from the shared cache. */
export const usePlans = (enabled = true) => useShared('plans', () => sa.plans(), { enabled })
export const useTemplates = () => useShared('comms-templates', () => sa.templates())
export const useSupportMeta = () => useShared('support-meta', () => sa.supportMeta())
export const useAccessCatalog = () => useShared('access-catalog', () => sa.access())
export const usePlansIfAllowed = () => usePlans(usePerms().can('subscriptions.view'))

export const invalidatePlans = () => invalidateShared('plans')
export const invalidateTemplates = () => invalidateShared('comms-templates')

/** One label per product feature, used by plans, feature switches and restaurant overrides. */
export const FEATURE_LABEL: Record<string, string> = {
  QR_ORDERING: 'QR ordering',
  KDS: 'Kitchen display',
  INVENTORY: 'Inventory & recipes',
  ANALYTICS: 'Analytics & reports',
  MULTI_OUTLET: 'Multi-outlet',
  ADVANCED_REPORTS: 'Advanced reports',
}
