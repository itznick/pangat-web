import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createSharedCache } from '../src/features/super-admin/sharedCache.ts'

describe('shared reference-data cache', () => {
  it('serves concurrent callers from one request and reuses the result within the TTL', async () => {
    let t = 0; const c = createSharedCache(() => t); let calls = 0
    const load = async () => { calls++; return { plans: [1, 2] } }
    const [a, b] = await Promise.all([c.load('plans', load, 1000), c.load('plans', load, 1000)])
    assert.equal(calls, 1); assert.equal(a, b)
    t = 500; await c.load('plans', load, 1000); assert.equal(calls, 1)
    t = 1500; await c.load('plans', load, 1000); assert.equal(calls, 2)
  })
  it('force reloads, and a failed load is not cached', async () => {
    const c = createSharedCache(); let n = 0
    await c.load('k', async () => ++n, 1e6); await c.load('k', async () => ++n, 1e6, true); assert.equal(n, 2)
    await assert.rejects(() => c.load('bad', async () => { throw new Error('x') }, 1e6))
    assert.equal(c.has('bad'), false)
    assert.equal(await c.load('bad', async () => 'ok', 1e6), 'ok')
  })
  it('notifies subscribers when a value lands or is invalidated, and unsubscribe stops it', async () => {
    const c = createSharedCache(); let pings = 0
    const off = c.subscribe('p', () => pings++)
    await c.load('p', async () => 1, 1e6); assert.equal(pings, 1)
    c.invalidate('p'); assert.equal(pings, 2); assert.equal(c.has('p'), false)
    off(); await c.load('p', async () => 2, 1e6); assert.equal(pings, 2)
  })
  it('peek returns the cached value (used to avoid a loading flash on remount)', async () => {
    const c = createSharedCache(); assert.equal(c.peek('x'), undefined)
    await c.load('x', async () => ({ a: 1 }), 1e6); assert.deepEqual(c.peek('x'), { a: 1 })
  })
})
