import type { Order } from '@/types/domain'

const CLOSED = new Set(['COMPLETED', 'CANCELLED'])
const ms = (v: unknown): number => {
  const t = typeof v === 'string' || typeof v === 'number' || v instanceof Date ? new Date(v).getTime() : NaN
  return Number.isFinite(t) ? t : 0
}

export interface Reconciled {
  tickets: Order[]
  /** Tickets in the authoritative list that this screen had never seen (missed while disconnected): worth one alert */
  missedNew: Order[]
}

/**
 * Make the on-screen list agree with the server's after a gap.
 *  - the server list is authoritative (closed orders drop off, duplicates collapse)
 *  - a ticket that arrived over the socket AFTER the fetch began is kept even if the (older) response lacks it
 *  - never replace a newer local copy with an older server copy (compares updatedAt)
 *  - result is stable and de-duplicated by id, newest first
 */
export function reconcileTickets(current: Order[], fetched: Order[], fetchStartedAt: number, arrivedAt: Record<string, number> = {}): Reconciled {
  const known = new Map(current.map((t) => [t.id, t]))
  const byId = new Map<string, Order>()
  const missedNew: Order[] = []

  for (const f of fetched) {
    if (!f || !f.id || CLOSED.has(f.orderStatus)) continue
    const local = known.get(f.id)
    if (!local) {
      if (f.orderStatus === 'RECEIVED') missedNew.push(f)
      byId.set(f.id, f)
    } else {
      byId.set(f.id, ms(local.updatedAt) > ms(f.updatedAt) ? { ...f, ...local } : { ...local, ...f })
    }
  }
  // socket arrivals newer than the fetch: the server snapshot may predate them
  for (const [id, t] of known) {
    if (!byId.has(id) && !CLOSED.has(t.orderStatus) && (arrivedAt[id] ?? 0) >= fetchStartedAt) byId.set(id, t)
  }
  const tickets = [...byId.values()].sort((a, b) => ms(b.createdAt) - ms(a.createdAt))
  return { tickets, missedNew }
}

/** A socket event is stale when we already hold a strictly newer copy of that order. */
export function isStaleEvent(held: Order | undefined, incoming: Pick<Order, 'updatedAt'>): boolean {
  if (!held) return false
  const h = ms(held.updatedAt)
  const i = ms(incoming.updatedAt)
  return h > 0 && i > 0 && i < h
}
