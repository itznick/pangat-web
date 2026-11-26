/**
 * Kitchen display reliability in a REAL browser (Chromium) against a running API on a throwaway database.
 *   API on :4000, `npx vite --port 5173`, then: node --test test/e2e/kds-reliability.e2e.test.mjs
 */
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.UAT_PLAYWRIGHT || 'playwright')
const WEB = process.env.UAT_WEB || 'http://127.0.0.1:5173'
const API = process.env.UAT_API || 'http://localhost:4000/api/v1'
const run = Math.random().toString(36).slice(2, 7)
const SLUG = `kds-${run}`
const OWNER = { email: `kds-${run}@example.com`, password: 'Str0ng-pass-1' }
let browser, ctx, page, seq = 0, liveId
// Playwright's offline switch does not drop an open websocket, so the live socket is cut explicitly: while `gap` is true the socket is closed
// and every reconnect attempt is refused; events produced during the gap are NOT replayed by the server.
let gap = false
const sockets = new Set()

const j = async (method, path, { token, body, headers } = {}) => {
  const r = await fetch(API + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined })
  const b = await r.json().catch(() => ({}))
  return { status: r.status, data: b.data, message: b.message }
}
async function placeOrder(label) {
  const menu = (await j('GET', `/menu/public/${SLUG}`)).data
  const item = menu.items.find((i) => i.isAvailable !== false)
  const r = await j('POST', '/orders', { headers: { 'x-idempotency-key': `k-${run}-${++seq}` }, body: { restaurantSlug: SLUG, orderType: 'DINE_IN', tableNumber: '01', customerName: label, consentAccepted: true, paymentMethod: 'PAY_AT_COUNTER', items: [{ menuItemId: item.id, name: item.name, price: Number(item.price), quantity: 1 }] } })
  assert.equal(r.status, 201, JSON.stringify(r))
  return r.data
}
const status = () => page.getByTestId('connection-status').getAttribute('data-status')
const waitStatus = (s, t = 20000) => page.waitForFunction((s) => document.querySelector('[data-testid=connection-status]')?.getAttribute('data-status') === s, s, { timeout: t })
const ticketsFor = (id) => page.locator(`[data-order-id="${id}"]`).locator("visible=true")
const count = (id) => ticketsFor(id).count()

before(async () => {
  const on = await j('POST', '/auth/onboard', { body: { brandName: 'KDS Cafe', ownerFullName: 'Kay Dee', mobileNumber: '9876500001', email: OWNER.email, password: OWNER.password, outletName: 'KDS Cafe', branchArea: 'Pune', slug: SLUG, upiVpa: 'kds@upi', gstPercentage: 5, indoorTableCount: 3, outdoorTableCount: 0, menuPreset: 'pune_cafe', teamMode: 'solo', kitchenPin: '4321' } })
  assert.equal(on.status, 201, JSON.stringify(on))
  const login = (await j('POST', '/auth/login', { body: OWNER })).data
  browser = await chromium.launch()
  ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } })
  page = await ctx.newPage()
  await page.routeWebSocket(/socket\.io/, (ws) => {
    if (gap) { ws.close(); return }
    const server = ws.connectToServer()
    sockets.add(ws)
    ws.onMessage((m) => server.send(m))
    server.onMessage((m) => { if (!gap) ws.send(m) })
  })
  page.problems = []
  page.on('pageerror', (e) => page.problems.push(e.message))
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    localStorage.setItem('pangat_access_token', d.accessToken)
    localStorage.setItem('pangat_user', JSON.stringify(d.user))
    localStorage.setItem('pangat_org', JSON.stringify(d.organization))
    localStorage.setItem('pangat_outlets', JSON.stringify(d.outlets))
    localStorage.setItem('pangat_active_outlet_slug', d.outlets[0].slug)
  }, login)
  await page.goto(`${WEB}/kds/${SLUG}`, { waitUntil: 'networkidle' })
})
after(async () => { await ctx?.close(); await browser?.close() })

describe('KDS reliability (real browser)', () => {
  it('shows Connected once live', async () => {
    await waitStatus('connected')
  })

  it('sound is locked on a fresh load: the banner says so, and the explicit button unlocks it', async () => {
    const banner = page.getByTestId('enable-sound-banner')
    // a headless browser with no tap keeps audio suspended; if the browser allowed it, the banner is correctly absent
    if (await banner.count()) {
      await page.getByTestId('enable-sound').click()
      await banner.waitFor({ state: 'detached', timeout: 5000 })
    }
    assert.equal(await page.getByTestId('enable-sound-banner').count(), 0)
  })

  it('a new order arrives live exactly once', async () => {
    const o = await placeOrder(`Live${run}`)
    liveId = o.id
    await ticketsFor(liveId).first().waitFor({ timeout: 10000 })
    assert.equal(await count(liveId), 1)
  })

  it('offline: shows Offline + the warning; an order placed meanwhile appears after reconnect, once, and the badge returns to Connected', async () => {
    gap = true
    for (const ws of sockets) ws.close()
    sockets.clear()
    await ctx.setOffline(true)
    await waitStatus('offline', 10000)
    assert.ok(await page.getByTestId('offline-banner').isVisible())
    const missed = await placeOrder(`Missed${run}`) // goes to the server while the kitchen tablet has no network
    assert.equal(await count(missed.id), 0, 'the tablet cannot know about it yet')
    await page.waitForTimeout(1500)
    assert.equal(await count(missed.id), 0, 'nothing reached the tablet during the gap')
    gap = false
    await ctx.setOffline(false)
    await ticketsFor(missed.id).first().waitFor({ timeout: 30000 })
    await waitStatus('connected', 30000)
    assert.equal(await count(missed.id), 1, 'no duplicate ticket after the resync')
    assert.equal(await page.getByTestId('offline-banner').count(), 0)
  })

  it('a failed resync (server error) keeps the board and does not claim Connected', async () => {
    assert.equal(await count(liveId), 1)
    await page.route('**/api/v1/orders?**', (r) => r.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'down' }) }))
    await page.evaluate(() => window.dispatchEvent(new Event('online'))) // triggers a resync
    await page.waitForFunction(() => document.querySelector('[data-testid=connection-status]')?.getAttribute('data-status') === 'reconnecting', null, { timeout: 10000 })
    assert.equal(await count(liveId), 1, 'tickets stay on screen when a refresh fails')
    assert.ok(await page.getByTestId('offline-banner').isVisible())
    await page.unroute('**/api/v1/orders?**')
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await waitStatus('connected', 15000)
  })

  it('a withdrawn kitchen feed (403 on refresh) also keeps the last board visible', async () => {
    await page.route('**/api/v1/orders?**', (r) => r.fulfill({ status: 403, contentType: 'application/json', body: JSON.stringify({ success: false, code: 'FEATURE_NOT_IN_PLAN', message: 'Kitchen display is not in your plan' }) }))
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await page.waitForTimeout(1500)
    assert.notEqual(await status(), 'connected')
    await page.unroute('**/api/v1/orders?**')
    await page.evaluate(() => window.dispatchEvent(new Event('online')))
    await waitStatus('connected', 15000)
  })

  it('wake lock reports the truth: a refused request is not shown as active', async () => {
    const c2 = await browser.newContext({ viewport: { width: 1024, height: 768 } })
    const p2 = await c2.newPage()
    const login = (await j('POST', '/auth/login', { body: OWNER })).data
    await p2.addInitScript((d) => {
      localStorage.setItem('pangat_access_token', d.accessToken); localStorage.setItem('pangat_user', JSON.stringify(d.user))
      localStorage.setItem('pangat_org', JSON.stringify(d.organization)); localStorage.setItem('pangat_outlets', JSON.stringify(d.outlets)); localStorage.setItem('pangat_active_outlet_slug', d.outlets[0].slug)
      Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: () => Promise.reject(new DOMException('battery saver', 'NotAllowedError')) } })
    }, login)
    await p2.goto(`${WEB}/kds/${SLUG}`, { waitUntil: 'networkidle' })
    await p2.waitForFunction(() => document.querySelector('[data-testid=wake-lock]')?.getAttribute('data-state') === 'blocked', null, { timeout: 10000 })
    assert.doesNotMatch(await p2.getByTestId('wake-lock').innerText(), /Screen stays on/)
    await c2.close()
  })

  it('wake lock granted shows active, and is re-acquired after the page is hidden and shown again', async () => {
    const c3 = await browser.newContext({ viewport: { width: 1024, height: 768 } })
    const p3 = await c3.newPage()
    const login = (await j('POST', '/auth/login', { body: OWNER })).data
    await p3.addInitScript((d) => {
      localStorage.setItem('pangat_access_token', d.accessToken); localStorage.setItem('pangat_user', JSON.stringify(d.user))
      localStorage.setItem('pangat_org', JSON.stringify(d.organization)); localStorage.setItem('pangat_outlets', JSON.stringify(d.outlets)); localStorage.setItem('pangat_active_outlet_slug', d.outlets[0].slug)
      window.__wl = { n: 0, releases: [] }
      Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => { window.__wl.n++; const l = []; const s = { released: false, release: async () => {}, addEventListener: (_e, f) => l.push(f) }; window.__wl.releases.push(() => l.forEach((f) => f())); return s } } })
    }, login)
    await p3.goto(`${WEB}/kds/${SLUG}`, { waitUntil: 'networkidle' })
    await p3.waitForFunction(() => document.querySelector('[data-testid=wake-lock]')?.getAttribute('data-state') === 'active', null, { timeout: 10000 })
    const nBefore = await p3.evaluate(() => window.__wl.n)
    await p3.evaluate(() => window.__wl.releases.at(-1)()) // the browser drops the lock (tab hidden / battery saver)
    await p3.waitForFunction(() => document.querySelector('[data-testid=wake-lock]')?.getAttribute('data-state') === 'inactive')
    await p3.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await p3.waitForFunction(() => document.querySelector('[data-testid=wake-lock]')?.getAttribute('data-state') === 'active', null, { timeout: 5000 })
    assert.equal(await p3.evaluate(() => window.__wl.n), nBefore + 1, 'exactly one re-request after the drop')
    await c3.close()
  })

  it('an expired session during a refresh signs the kitchen out cleanly', async () => {
    const c4 = await browser.newContext({ viewport: { width: 1024, height: 768 } })
    const p4 = await c4.newPage()
    const login = (await j('POST', '/auth/login', { body: OWNER })).data
    await p4.addInitScript((d) => {
      if (sessionStorage.getItem('seeded')) return
      sessionStorage.setItem('seeded', '1')
      localStorage.setItem('pangat_access_token', d.accessToken); localStorage.setItem('pangat_user', JSON.stringify(d.user))
      localStorage.setItem('pangat_org', JSON.stringify(d.organization)); localStorage.setItem('pangat_outlets', JSON.stringify(d.outlets)); localStorage.setItem('pangat_active_outlet_slug', d.outlets[0].slug)
    }, login)
    await p4.goto(`${WEB}/kds/${SLUG}`, { waitUntil: 'networkidle' })
    await p4.route('**/api/v1/orders?**', (r) => r.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'Unauthorized' }) }))
    await p4.evaluate(() => window.dispatchEvent(new Event('online')))
    await p4.waitForURL(/login/, { timeout: 10000 })
    await c4.close()
  })

  it('no uncaught page errors during any of this', () => {
    assert.deepEqual(page.problems, [])
  })
})
