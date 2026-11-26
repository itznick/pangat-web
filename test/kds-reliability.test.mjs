import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { deriveConnection, useConnectionStore, watchConnection } from '../src/lib/connection.ts'
import { reconcileTickets, isStaleEvent } from '../src/lib/kdsMerge.ts'
import { createWakeLock } from '../src/lib/wakeLock.ts'

const o = (id, status = 'RECEIVED', extra = {}) => ({ id, orderStatus: status, createdAt: '2026-11-26T10:00:00Z', updatedAt: '2026-11-26T10:00:00Z', ...extra })

describe('connection status is honest', () => {
  const base = { socketConnected: true, online: true, syncing: false, lastSyncFailed: false }
  it('connected only when the socket is up AND the last sync worked', () => {
    assert.equal(deriveConnection(base), 'connected')
    assert.equal(deriveConnection({ ...base, lastSyncFailed: true }), 'reconnecting')
  })
  it('offline beats everything; a dropped socket is reconnecting; a refetch is synchronising', () => {
    assert.equal(deriveConnection({ ...base, online: false, socketConnected: false }), 'offline')
    assert.equal(deriveConnection({ ...base, socketConnected: false }), 'reconnecting')
    assert.equal(deriveConnection({ ...base, syncing: true }), 'synchronising')
  })
})

describe('reconcileTickets: the server list wins after a gap', () => {
  it('adds orders missed while disconnected and reports them once', () => {
    const r = reconcileTickets([o('a')], [o('a'), o('b'), o('c', 'PREPARING')], 1000)
    assert.deepEqual(r.tickets.map((t) => t.id).sort(), ['a', 'b', 'c'])
    assert.deepEqual(r.missedNew.map((t) => t.id), ['b']) // only a NEW (RECEIVED) unseen order rings; a PREPARING one does not
  })
  it('never duplicates a ticket that is on screen and in the fetch', () => {
    const r = reconcileTickets([o('a'), o('b')], [o('b'), o('a'), o('a')], 1000)
    assert.equal(r.tickets.length, 2)
    assert.equal(r.missedNew.length, 0)
  })
  it('drops tickets the server says are closed', () => {
    const r = reconcileTickets([o('a'), o('b')], [o('a', 'COMPLETED'), o('b', 'CANCELLED')], 1000)
    assert.equal(r.tickets.length, 0)
  })
  it('a ticket that arrived over the socket after the fetch began survives an older snapshot', () => {
    const r = reconcileTickets([o('late')], [], 1000, { late: 1500 })
    assert.deepEqual(r.tickets.map((t) => t.id), ['late'])
  })
  it('a ticket that was already on screen before the fetch and is absent from it is gone', () => {
    const r = reconcileTickets([o('old')], [], 1000, { old: 500 })
    assert.equal(r.tickets.length, 0)
  })
  it('does not replace a newer local copy with an older server copy', () => {
    const local = o('a', 'READY', { updatedAt: '2026-11-26T10:05:00Z' })
    const r = reconcileTickets([local], [o('a', 'PREPARING', { updatedAt: '2026-11-26T10:01:00Z' })], 1000)
    assert.equal(r.tickets[0].orderStatus, 'READY')
  })
  it('takes the newer server copy over an older local one', () => {
    const r = reconcileTickets([o('a', 'PREPARING')], [o('a', 'READY', { updatedAt: '2026-11-26T10:09:00Z' })], 1000)
    assert.equal(r.tickets[0].orderStatus, 'READY')
  })
})

describe('stale events', () => {
  it('an event older than what we hold is stale; newer or unknown is not', () => {
    const held = o('a', 'READY', { updatedAt: '2026-11-26T10:05:00Z' })
    assert.equal(isStaleEvent(held, { updatedAt: '2026-11-26T10:01:00Z' }), true)
    assert.equal(isStaleEvent(held, { updatedAt: '2026-11-26T10:09:00Z' }), false)
    assert.equal(isStaleEvent(undefined, { updatedAt: '2026-11-26T10:01:00Z' }), false)
    assert.equal(isStaleEvent(held, {}), false)
  })
})

describe('wake lock reports what the browser really did', () => {
  const mkEnv = (api, visible = true) => {
    let vis = () => {}
    return { env: { wakeLock: api, isVisible: () => visible, onVisible: (f) => { vis = f; return () => {} } }, fireVisible: () => vis(), setVisible: (v) => { visible = v } }
  }
  it('unsupported browser is reported as unsupported, never active', async () => {
    const states = []
    const w = createWakeLock({ wakeLock: undefined, isVisible: () => true, onVisible: () => () => {} }, (s) => states.push(s))
    await w.enable()
    assert.equal(w.state, 'unsupported')
    assert.ok(!states.includes('active'))
  })
  it('a refused request is "blocked", not active', async () => {
    const { env } = mkEnv({ request: async () => { throw new Error('NotAllowedError') } })
    const w = createWakeLock(env, () => {})
    await w.enable()
    assert.equal(w.state, 'blocked')
  })
  it('granted lock is active, and release turns it inactive', async () => {
    let released = false
    const sentinel = { released: false, release: async () => { released = true }, addEventListener: () => {} }
    const { env } = mkEnv({ request: async () => sentinel })
    const w = createWakeLock(env, () => {})
    await w.enable()
    assert.equal(w.state, 'active')
    await w.disable()
    assert.equal(w.state, 'inactive')
    assert.ok(released)
  })
  it('re-acquires after the browser drops it (tab hidden then shown)', async () => {
    let n = 0
    let onRelease = () => {}
    const api = { request: async () => { n++; return { released: false, release: async () => {}, addEventListener: (_e, f) => { onRelease = f } } } }
    const { env, fireVisible } = mkEnv(api)
    const w = createWakeLock(env, () => {})
    await w.enable()
    assert.equal(n, 1)
    onRelease() // browser released it
    assert.equal(w.state, 'inactive') // honest: not active any more
    fireVisible()
    await new Promise((r) => setTimeout(r, 0))
    assert.equal(n, 2)
    assert.equal(w.state, 'active')
  })
  it('does not request while the page is hidden', async () => {
    let n = 0
    const { env } = mkEnv({ request: async () => { n++; return { released: false, release: async () => {}, addEventListener: () => {} } } }, false)
    const w = createWakeLock(env, () => {})
    await w.enable()
    assert.equal(n, 0)
  })
})

describe('watchConnection triggers a resync after every kind of gap', () => {
  let handlers, socket, windowL, docL, resyncs
  beforeEach(() => {
    handlers = {}
    resyncs = 0
    windowL = {}
    docL = {}
    socket = { connected: true, on: (e, f) => { handlers[e] = f }, off: () => {} }
    globalThis.window = { addEventListener: (e, f) => { windowL[e] = f }, removeEventListener() {}, setInterval: () => 0, clearInterval() {} }
    globalThis.document = { hidden: false, addEventListener: (e, f) => { docL[e] = f }, removeEventListener() {} }
    useConnectionStore.setState({ socketConnected: false, online: true, syncing: false, lastSyncFailed: false, lastSyncedAt: null, status: 'reconnecting' })
  })
  it('socket drop shows Reconnecting; reconnect resyncs and flips back once the sync succeeds', () => {
    watchConnection(socket, () => { resyncs++ }, { pollMs: 0 })
    assert.equal(useConnectionStore.getState().status, 'connected')
    handlers.disconnect()
    assert.equal(useConnectionStore.getState().status, 'reconnecting')
    handlers.connect()
    assert.equal(resyncs, 1)
    useConnectionStore.getState().syncStarted()
    assert.equal(useConnectionStore.getState().status, 'synchronising')
    useConnectionStore.getState().syncFinished(true)
    assert.equal(useConnectionStore.getState().status, 'connected')
  })
  it('the first connect of a fresh page does not trigger a redundant resync', () => {
    socket.connected = false
    watchConnection(socket, () => { resyncs++ }, { pollMs: 0 })
    handlers.connect()
    assert.equal(resyncs, 0)
    handlers.disconnect(); handlers.connect()
    assert.equal(resyncs, 1)
  })
  it('going offline shows Offline; coming back online resyncs', () => {
    watchConnection(socket, () => { resyncs++ }, { pollMs: 0 })
    windowL.offline()
    assert.equal(useConnectionStore.getState().status, 'offline')
    windowL.online()
    assert.equal(resyncs, 1)
    assert.notEqual(useConnectionStore.getState().status, 'offline')
  })
  it('a visible tablet resyncs; a hidden one does not', () => {
    watchConnection(socket, () => { resyncs++ }, { pollMs: 0 })
    globalThis.document.hidden = true; docL.visibilitychange()
    assert.equal(resyncs, 0)
    globalThis.document.hidden = false; docL.visibilitychange()
    assert.equal(resyncs, 1)
  })
  it('a failed sync never shows Connected', () => {
    watchConnection(socket, () => {}, { pollMs: 0 })
    useConnectionStore.getState().syncStarted()
    useConnectionStore.getState().syncFinished(false)
    assert.equal(useConnectionStore.getState().status, 'reconnecting')
  })
})
