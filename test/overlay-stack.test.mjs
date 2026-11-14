import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { createEscapeStack, createScrollLock } from '../src/lib/overlayStack.ts'

describe('escape stack (only the top-most overlay closes)', () => {
  it('delivers Escape to the most recently opened overlay only', () => {
    const s = createEscapeStack()
    const hits = []
    s.push(() => hits.push('drawer'))
    s.push(() => hits.push('modal'))
    assert.equal(s.escape(), true)
    assert.deepEqual(hits, ['modal'])
  })

  it('falls through to the next overlay once the top one is unregistered', () => {
    const s = createEscapeStack()
    const hits = []
    s.push(() => hits.push('drawer'))
    const off = s.push(() => hits.push('modal'))
    s.escape()
    off()
    s.escape()
    assert.deepEqual(hits, ['modal', 'drawer'])
  })

  it('does nothing (and reports it) when no overlay is open', () => {
    const s = createEscapeStack()
    assert.equal(s.escape(), false)
    assert.equal(s.size, 0)
  })

  it('unregistering out of order removes the right entry and is idempotent', () => {
    const s = createEscapeStack()
    const hits = []
    const offA = s.push(() => hits.push('A'))
    s.push(() => hits.push('B'))
    offA()
    offA()
    assert.equal(s.size, 1)
    s.escape()
    assert.deepEqual(hits, ['B'])
  })
})

describe('scroll lock (reference counted)', () => {
  const body = () => ({ style: { overflow: '' } })

  it('locks on first acquire and restores the previous value on last release', () => {
    const el = body()
    el.style.overflow = 'scroll'
    const lock = createScrollLock(el)
    const a = lock.acquire()
    assert.equal(el.style.overflow, 'hidden')
    a()
    assert.equal(el.style.overflow, 'scroll')
  })

  it('stays locked while a second overlay is still open (stacked modal + drawer)', () => {
    const el = body()
    const lock = createScrollLock(el)
    const drawer = lock.acquire()
    const modal = lock.acquire()
    modal()
    assert.equal(el.style.overflow, 'hidden', 'drawer is still open')
    drawer()
    assert.equal(el.style.overflow, '')
    assert.equal(lock.count, 0)
  })

  it('releasing the same hold twice cannot steal another overlay’s lock', () => {
    const el = body()
    const lock = createScrollLock(el)
    const a = lock.acquire()
    lock.acquire()
    a()
    a()
    assert.equal(lock.count, 1)
    assert.equal(el.style.overflow, 'hidden')
  })
})
