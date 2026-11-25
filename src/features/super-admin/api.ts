/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiClient } from '@/lib/api'

export type Row = Record<string, any>
export interface Paged<T = Row> { items: T[]; total: number; page: number; limit: number; summary?: Row; [k: string]: any }
type Q = Record<string, string | number | undefined | null>
const clean = (q?: Q) => Object.fromEntries(Object.entries(q || {}).filter(([, v]) => v !== undefined && v !== null && v !== ''))
// the shared client's response interceptor unwraps the { success, data } envelope, so these resolve to the data itself
const get = <T = any>(url: string, q?: Q) => apiClient.get(url, { params: clean(q) }) as unknown as Promise<T>
const post = <T = any>(url: string, body?: unknown) => apiClient.post(url, body ?? {}) as unknown as Promise<T>
const patch = <T = any>(url: string, body?: unknown) => apiClient.patch(url, body ?? {}) as unknown as Promise<T>
const put = <T = any>(url: string, body?: unknown) => apiClient.put(url, body ?? {}) as unknown as Promise<T>

/** Everything the Super Admin console calls. The server enforces permissions on each of these. */
export const sa = {
  dashboard: (q: Q) => get('/admin/dashboard', q),
  events: (limit = 30) => get<Row[]>('/admin/events', { limit }),
  ackEvents: (id?: string) => post('/admin/events/ack', id ? { id } : {}),

  restaurants: (q: Q) => get<Paged>('/admin/restaurants', q),
  restaurant: (id: string) => get(`/admin/restaurants/${id}`),
  restaurantActivity: (id: string, days = 30) => get(`/admin/restaurants/${id}/activity`, { days }),
  restaurantBilling: (id: string) => get(`/admin/restaurants/${id}/billing`),
  restaurantNotes: (id: string) => get<Row[]>(`/admin/restaurants/${id}/notes`),
  addNote: (id: string, body: string, pinned = false) => post(`/admin/restaurants/${id}/notes`, { body, pinned }),
  setStatus: (id: string, action: 'SUSPEND' | 'DEACTIVATE' | 'RESTORE', reason?: string) => post(`/admin/restaurants/${id}/status`, { action, reason }),
  setVerification: (id: string, status: string, note?: string) => post(`/admin/restaurants/${id}/verification`, { status, note }),
  setOutlet: (id: string, isActive: boolean, reason?: string) => post(`/admin/outlets/${id}/status`, { isActive, reason }),
  featureOverride: (id: string, feature: string, mode: string, reason?: string) => post(`/admin/restaurants/${id}/feature-overrides`, { feature, mode, reason }),
  exportRestaurant: (id: string) => get(`/admin/restaurants/${id}/export`),
  outletsMonitor: (q: Q) => get<Paged>('/admin/outlets-monitor', q),
  provision: (data: any) => post('/admin/provision', data),
  resetOwnerPassword: (orgId: string) => post(`/admin/organizations/${orgId}/reset-password`),

  subscriptions: (q: Q) => get<Paged>('/admin/subscriptions', q),
  plans: () => get<{ plans: Row[]; features: Row[]; trial?: Row }>('/admin/subscription-plans'),
  capacity: () => get<Row[]>('/admin/subscriptions/capacity'),
  founding: () => get<{ slotsTotal: number; slotsUsed: number; grants: Row[] }>('/admin/subscriptions/founding'),
  createPlan: (d: any) => post('/subscriptions/admin/plans', d),
  updatePlan: (id: string, d: any) => patch(`/subscriptions/admin/plans/${id}`, d),
  subHistory: (id: string) => get(`/admin/restaurants/${id}/subscription-history`),
  subAction: (id: string, action: 'change-plan' | 'extend' | 'cancel' | 'reactivate' | 'trial' | 'assign', body: any) => post(`/admin/restaurants/${id}/subscription/${action}`, body),

  payments: (q: Q) => get<Paged>('/admin/payments', q),
  paymentsOverview: (q: Q) => get('/admin/payments/overview', q),
  reconciliation: () => get('/admin/payments/reconciliation'),
  report: (kind: 'payments' | 'subscriptions' | 'revenue-by-month' | 'restaurants' | 'users' | 'audit', q: Q = {}) => {
    const path = ['payments', 'subscriptions', 'revenue-by-month'].includes(kind) ? `finance/${kind}` : kind === 'audit' ? 'audit' : `data/${kind}`
    return get<{ filename: string; mime: string; content: string; rows: number }>(`/admin/reports/${path}`, q)
  },
  exportsHistory: () => get<Row[]>('/admin/exports'),

  users: (q: Q) => get<Paged>('/admin/users', q),
  user: (id: string) => get(`/admin/users/${id}`),
  userActive: (id: string, isActive: boolean, reason?: string) => post(`/admin/users/${id}/active`, { isActive, reason }),
  userUnlock: (id: string) => post(`/admin/users/${id}/unlock`),
  userLogout: (id: string) => post(`/admin/users/${id}/logout`),
  userReset: (id: string) => post(`/admin/users/${id}/reset-password`),
  access: () => get<{ permissions: Row[]; roles: Row[] }>('/admin/access/catalog'),
  admins: () => get<Row[]>('/admin/admins'),
  createAdmin: (d: any) => post('/admin/admins', d),
  updateAdmin: (id: string, d: any) => patch(`/admin/admins/${id}`, d),
  resetAdmin: (id: string) => post(`/admin/admins/${id}/reset-password`),
  adminLogins: () => get<Row[]>('/admin/admin-logins'),

  settings: () => get<{ groups: Row[]; settings: Row[] }>('/admin/settings'),
  saveSettings: (changes: Record<string, unknown>) => put<{ groups: Row[]; settings: Row[] }>('/admin/settings', { changes }),
  flags: () => get<Row[]>('/admin/feature-flags'),
  setFlag: (key: string, enabled: boolean, reason?: string) => patch<Row[]>(`/admin/feature-flags/${key}`, { enabled, reason }),

  privacyRequests: (q: Q) => get<Paged & { overdue: number }>('/admin/privacy/requests', q),
  updatePrivacyRequest: (id: string, d: { status?: string; resolutionNote?: string; notifyRequester?: boolean }) => patch(`/admin/privacy/requests/${id}`, d),
  privacyLookup: (phone: string) => post<{ phone: string; orders: Row[]; leads: Row[] }>('/admin/privacy/lookup', { phone }),
  privacyErase: (phone: string, requestReference?: string) => post<{ ordersAnonymised: number; leadsDeleted: number }>('/admin/privacy/erase', { phone, requestReference }),

  commsHistory: (q: Q) => get<Paged & { emailConfigured: boolean }>('/admin/communications/history', q),
  commsDeliveries: (id: string) => get(`/admin/communications/history/${id}`),
  send: (d: any) => post('/admin/communications/send', d),
  templates: () => get<{ templates: Row[]; variables: string[]; emailConfigured: boolean }>('/admin/communications/templates'),
  saveTemplate: (id: string | null, d: any) => (id ? put(`/admin/communications/templates/${id}`, d) : post('/admin/communications/templates', d)),
  announcements: () => get<Row[]>('/admin/communications/announcements'),
  saveAnnouncement: (id: string | null, d: any) => (id ? put(`/admin/communications/announcements/${id}`, d) : post('/admin/communications/announcements', d)),

  health: () => get('/admin/monitoring/health'),
  errors: (q: Q) => get<Paged>('/admin/monitoring/errors', q),
  webhooks: (q: Q) => get<Paged>('/admin/monitoring/webhooks', q),
  jobRuns: (name?: string) => get<Row[]>('/admin/monitoring/jobs', { name }),
  runJob: (name: string) => post(`/admin/monitoring/jobs/${name}/run`),

  audit: (q: Q) => get<Paged>('/admin/audit', q),

  supportMeta: () => get<{ categories: string[]; priorities: string[]; statuses: string[]; assignees: Row[] }>('/admin/support/meta'),
  tickets: (q: Q) => get<Paged>('/admin/support/tickets', q),
  ticket: (id: string) => get<{ ticket: Row; events: Row[] }>(`/admin/support/tickets/${id}`),
  createTicket: (d: any) => post('/admin/support/tickets', d),
  updateTicket: (id: string, d: any) => patch(`/admin/support/tickets/${id}`, d),
  ticketEvent: (id: string, kind: 'NOTE' | 'REPLY', body: string) => post(`/admin/support/tickets/${id}/events`, { kind, body }),

  leads: () => get<Row[]>('/admin/leads'),
  updateLead: (id: string, d: { status?: string; notes?: string }) => patch(`/admin/leads/${id}`, d),
}

/** Restaurant-facing endpoints (merchant console). */
export const merchant = {
  config: () => get('/platform/config'),
  announcements: () => get<Row[]>('/platform/announcements'),
  inbox: () => get<{ items: Row[]; unread: number }>('/notifications/inbox'),
  markRead: (id?: string) => post('/notifications/inbox/read', id ? { id } : {}),
  supportMeta: () => get<{ categories: string[]; priorities: string[] }>('/support/meta'),
  myTickets: () => get<Row[]>('/support/tickets'),
  ticket: (id: string) => get<{ ticket: Row; events: Row[] }>(`/support/tickets/${id}`),
  createTicket: (d: any) => post('/support/tickets', d),
  reply: (id: string, body: string) => post(`/support/tickets/${id}/reply`, { body }),
}
