/**
 * Responsive and runtime check: every key screen at five widths in a REAL browser (Chromium), against a running API (sign-up enabled for the
 * harness) and `npx vite`. It checks what a machine can check: the page renders, nothing overflows horizontally, nothing throws, and no
 * visible control is smaller than 24x24 CSS px (the WCAG 2.2 AA minimum target size; range sliders with a custom track excepted). It does NOT judge design quality: look at the screenshots (SHOTS=dir) with human eyes.
 *   SHOTS=/tmp/shots node --test test/e2e/responsive.e2e.test.mjs
 */
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.UAT_PLAYWRIGHT || 'playwright')
const WEB = process.env.UAT_WEB || 'http://127.0.0.1:5173'
const API = process.env.UAT_API || 'http://localhost:4000/api/v1'
const BOOT = process.env.PLATFORM_BOOTSTRAP_SECRET || 'bootstrapsecret1234567'
const SHOTS = process.env.SHOTS
const run = Math.random().toString(36).slice(2, 7)
const SLUG = `rs-${run}`
const PW = 'Str0ng-pass-1'
const WIDTHS = [[360, 740], [390, 844], [768, 1024], [1024, 768], [1440, 900]]
let browser; let owner; let admin; let order

const j = async (method, path, { token, body, headers } = {}) => {
  const r = await fetch(API + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined })
  return { status: r.status, data: (await r.json().catch(() => ({}))).data }
}

before(async () => {
  const on = await j('POST', '/auth/onboard', { body: { brandName: `Resp ${run}`, ownerFullName: 'Rita Owner', mobileNumber: '9876500001', email: `own-${run}@example.com`, password: PW, outletName: 'Resp Cafe', branchArea: 'Pune', slug: SLUG, upiVpa: `rs${run}@upi`, gstPercentage: 5, indoorTableCount: 6, outdoorTableCount: 0, menuPreset: 'pune_cafe', teamMode: 'solo', kitchenPin: '2468' } })
  assert.equal(on.status, 201)
  owner = (await j('POST', '/auth/login', { body: { email: `own-${run}@example.com`, password: PW } })).data
  const email = `root-${run}@pangat.test`
  const r = await j('POST', '/auth/setup-super-admin', { headers: { 'x-bootstrap-secret': BOOT }, body: { name: 'Root Admin', email, password: PW } })
  assert.ok([201, 403].includes(r.status))
  if (r.status === 201) admin = (await j('POST', '/auth/login', { body: { email, password: PW } })).data
  const menu = (await j('GET', `/menu/public/${SLUG}`)).data
  const it0 = menu.items[0]
  order = (await j('POST', '/orders', { headers: { 'x-idempotency-key': `rs-${run}` }, body: { restaurantSlug: SLUG, orderType: 'DINE_IN', tableNumber: 'T01', paymentMethod: 'PAY_AT_COUNTER', items: [{ menuItemId: it0.id, name: it0.name, price: Number(it0.price), quantity: 2 }] } })).data
  if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true })
  browser = await chromium.launch()
})
after(async () => { await browser?.close() })

const asAuth = (d) => d && ((x) => {
  localStorage.setItem('pangat_access_token', x.accessToken); localStorage.setItem('pangat_user', JSON.stringify(x.user))
  localStorage.setItem('pangat_org', JSON.stringify(x.organization ?? null)); localStorage.setItem('pangat_outlets', JSON.stringify(x.outlets ?? []))
  if (x.outlets?.[0]) localStorage.setItem('pangat_active_outlet_slug', x.outlets[0].slug)
})


/** Contrast of the text inside the elements this release added (go-live checklist, kitchen banners and badges): catches "pale text on a pale box". */
const lowContrast = (page) => page.evaluate(() => {
  // any CSS colour syntax (rgb, oklch, color(srgb ...)) is normalised through a canvas to plain rgba
  const cv = document.createElement('canvas'); cv.width = cv.height = 1
  const cx = cv.getContext('2d', { willReadFrequently: true })
  const parse = (c) => {
    if (!c || c === 'transparent') return { r: 0, g: 0, b: 0, a: 0 }
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1)
    const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data
    return { r, g, b, a: a / 255 }
  }
  const lum = ({ r, g, b }) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b) }
  const bgOf = (el) => {
    const layers = []
    for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0) { layers.push(c); if (c.a >= 1) break } }
    let base = { r: 255, g: 255, b: 255 }
    if (!layers.length || layers[layers.length - 1].a < 1) { const root = parse(getComputedStyle(document.body).backgroundColor); if (root && root.a > 0) base = root }
    for (const l of layers.reverse()) base = { r: base.r * (1 - l.a) + l.r * l.a, g: base.g * (1 - l.a) + l.g * l.a, b: base.b * (1 - l.a) + l.b * l.a }
    return base
  }
  const out = []
  for (const root of document.querySelectorAll('[data-testid="go-live"], [data-testid="enable-sound-banner"], [data-testid="offline-banner"], [data-testid="connection-status"], [data-testid="wake-lock"]')) {
    for (const el of root.querySelectorAll('*')) {
      if (![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue
      const fg = parse(getComputedStyle(el).color); if (!fg) continue
      const bg = bgOf(el)
      const mix = { r: bg.r * (1 - fg.a) + fg.r * fg.a, g: bg.g * (1 - fg.a) + fg.g * fg.a, b: bg.b * (1 - fg.a) + fg.b * fg.a }
      const [hi, lo] = [lum(mix), lum(bg)].sort((a, b) => b - a)
      const ratio = (hi + 0.05) / (lo + 0.05)
      if (ratio < 3) out.push(`${(el.textContent || '').trim().slice(0, 28)} (${ratio.toFixed(1)}:1)`)
    }
  }
  return [...new Set(out)].slice(0, 4)
})

const SCREENS = () => [
  ['landing', '/', null],
  ['diner menu (table QR)', `/r/${SLUG}/t/T01`, null],
  ['order tracking', `/r/${SLUG}/order/${order.id}?token=${order.trackingToken}`, null],
  ['kitchen display', `/kds/${SLUG}`, owner],
  ['owner dashboard', '/admin/dashboard', owner],
  ['owner orders', '/admin/orders', owner],
  ['owner tables', '/admin/tables', owner],
  ['owner menu', '/admin/menu', owner],
  ['owner inventory', '/admin/inventory', owner],
  ['owner subscription', '/admin/subscription', owner],
  ['owner settings', '/admin/settings', owner],
  ['owner reports', '/admin/reports', owner],
  ['super admin overview', '/super-admin', admin],
  ['super admin restaurants', '/super-admin/restaurants', admin],
  ['super admin monitoring', '/super-admin/monitoring', admin],
]

describe('Responsive and runtime check', () => {
  for (const [w, h] of WIDTHS) {
    describe(`${w} x ${h}`, () => {
      it('every screen renders without overflow or runtime errors', async () => {
        const problems = []
        for (const scheme of ['light', 'dark']) for (const [name0, path, auth] of SCREENS()) {
          if (auth === undefined) continue
          if (scheme === 'dark' && !/kitchen|dashboard/.test(name0)) continue
          const name = `${name0} [${scheme}]`
          const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 800, isMobile: w < 500, colorScheme: scheme })
          const page = await ctx.newPage()
          const errs = []
          page.on('pageerror', (e) => errs.push(e.message))
          page.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource|WebSocket|net::ERR/.test(m.text())) errs.push(m.text().slice(0, 140)) })
          if (auth) await page.addInitScript(asAuth(auth), auth)
          try {
            await page.goto(WEB + path, { waitUntil: 'networkidle', timeout: 30000 })
            await page.waitForTimeout(600)
            const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
            const text = (await page.locator('body').innerText()).slice(0, 4000)
            const small = await page.evaluate(() => [...document.querySelectorAll('button, a[href], input, select')]
              .filter((el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && (r.height < 24 || r.width < 24) && !['checkbox', 'radio', 'range'].includes(el.getAttribute('type')) && !el.closest('.sr-only') })
              .map((el) => (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 30)).slice(0, 4))
            if (overflow > 1) problems.push(`${name}: horizontal overflow of ${overflow}px`)
            if (/application error|something went wrong|cannot read propert/i.test(text)) problems.push(`${name}: error text on screen`)
            if (text.trim().length < 20) problems.push(`${name}: renders almost nothing`)
            if (w <= 390 && small.length) problems.push(`${name}: tiny tap targets: ${small.join(' | ')}`)
            const pale = await lowContrast(page)
            if (pale.length) problems.push(`${name}: hard-to-read text: ${pale.join(' | ')}`)
            if (errs.length) problems.push(`${name}: ${errs.slice(0, 2).join(' / ')}`)
            if (SHOTS) await page.screenshot({ path: `${SHOTS}/${w}-${name.replace(/[^a-z0-9]+/gi, '_')}.png`, fullPage: false })
          } catch (e) {
            problems.push(`${name}: ${String(e.message).split('\n')[0]}`)
          } finally { await ctx.close() }
        }
        assert.deepEqual(problems, [], problems.join('\n'))
      })
    })
  }
})
