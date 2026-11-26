/**
 * Roles and the walk-in order dialog, in a REAL browser against a running API on a throwaway database.
 *   API on :4000 (sign-up enabled for the harness), `npx vite --port 5173`, then: node --test test/e2e/roles.e2e.test.mjs
 */
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.UAT_PLAYWRIGHT || 'playwright')
const WEB = process.env.UAT_WEB || 'http://127.0.0.1:5173'
const API = process.env.UAT_API || 'http://localhost:4000/api/v1'
const run = Math.random().toString(36).slice(2, 7)
const SLUG = `rb-${run}`
const PW = 'Str0ng-pass-1'
const PW2 = 'Tulsi-Wada-Pune-42'
const OWNER = { email: `own-${run}@example.com`, password: PW }
let browser; let owner; let outlet
const staff = {} // role -> { email, auth }

const j = async (method, path, { token, body, headers } = {}) => {
  const r = await fetch(API + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined })
  const b = await r.json().catch(() => ({}))
  return { status: r.status, data: b.data, message: b.message }
}
async function hire(role, name) {
  const email = `${role.toLowerCase()}-${run}@example.com`
  const c = await j('POST', `/restaurants/${outlet.id}/staff`, { token: owner.accessToken, body: { name, email, password: PW, role } })
  assert.equal(c.status, 201, JSON.stringify(c))
  const f = await j('POST', '/auth/login', { body: { email, password: PW } })
  const own = await j('POST', '/auth/change-password', { token: f.data.accessToken, body: { currentPassword: PW, newPassword: PW2 } })
  assert.equal(own.status, 200, JSON.stringify(own))
  const session = await j('POST', '/auth/login', { body: { email, password: PW2 } })
  assert.equal(session.status, 200, JSON.stringify(session))
  staff[role] = { email, auth: session.data }
}
async function pageFor(auth, path) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await ctx.newPage()
  page.problems = []
  page.on('pageerror', (e) => page.problems.push(e.message))
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    localStorage.setItem('pangat_access_token', d.accessToken)
    localStorage.setItem('pangat_user', JSON.stringify(d.user))
    localStorage.setItem('pangat_org', JSON.stringify(d.organization ?? null))
    localStorage.setItem('pangat_outlets', JSON.stringify(d.outlets ?? []))
    if (d.outlets?.[0]) localStorage.setItem('pangat_active_outlet_slug', d.outlets[0].slug)
  }, auth)
  await page.goto(WEB + path, { waitUntil: 'networkidle' })
  return { page, ctx }
}

before(async () => {
  const on = await j('POST', '/auth/onboard', { body: { brandName: `Roles ${run}`, ownerFullName: 'Olive Owner', mobileNumber: '9876500001', email: OWNER.email, password: PW, outletName: 'Roles Cafe', branchArea: 'Pune', slug: SLUG, upiVpa: `rb${run}@upi`, gstPercentage: 5, indoorTableCount: 6, outdoorTableCount: 0, menuPreset: 'pune_cafe', teamMode: 'solo', kitchenPin: '2468' } })
  assert.equal(on.status, 201, JSON.stringify(on))
  owner = (await j('POST', '/auth/login', { body: OWNER })).data
  outlet = owner.outlets[0]
  await hire('STORE_MANAGER', 'Mira Manager')
  await hire('CASHIER', 'Kavi Cashier')
  await hire('STEWARD', 'Sana Steward')
  await hire('CHEF', 'Chetan Chef')
  browser = await chromium.launch()
})
after(async () => { await browser?.close() })

const NAV = {
  SUPER_OWNER: ['Dashboard', 'Floor & Tables', 'Orders & Settlements', 'Reports', 'Menu & Modifiers', 'Inventory & Recipes'],
  STORE_MANAGER: ['Dashboard', 'Floor & Tables', 'Orders & Settlements', 'Reports', 'Menu & Modifiers', 'Inventory & Recipes'],
  CASHIER: ['Floor & Tables', 'Orders & Settlements'],
  STEWARD: ['Floor & Tables'],
}
const ALL = [...new Set(Object.values(NAV).flat())]

describe('What each role sees', () => {
  for (const [role, label, auth] of [['SUPER_OWNER', 'owner', () => owner], ['STORE_MANAGER', 'manager', () => staff.STORE_MANAGER.auth], ['CASHIER', 'cashier', () => staff.CASHIER.auth], ['STEWARD', 'steward', () => staff.STEWARD.auth]]) {
    it(`${label}: sees exactly their screens, and a screen they may not use says so`, async () => {
      const home = role === 'STEWARD' ? '/admin/tables' : role === 'CASHIER' ? '/admin/orders' : '/admin/dashboard'
      const { page, ctx } = await pageFor(auth(), home)
      for (const name of ALL) {
        const n = await page.getByRole('link', { name: new RegExp(`^${name.replace(/[&]/g, '\\$&')}`) }).count()
        assert.equal(n > 0, NAV[role].includes(name), `${label}: "${name}" should ${NAV[role].includes(name) ? '' : 'not '}be in the menu`)
      }
      // a screen outside their role, typed into the address bar, is refused with a plain message
      const forbidden = role === 'STEWARD' ? '/admin/orders' : role === 'CASHIER' ? '/admin/reports' : null
      if (forbidden) {
        await page.goto(WEB + forbidden, { waitUntil: 'networkidle' })
        await page.getByText('Access Restricted').waitFor({ timeout: 10000 })
      }
      assert.deepEqual(page.problems, [])
      await ctx.close()
    })
  }

  it('chef: is taken to the kitchen display, not the owner screens', async () => {
    const { page, ctx } = await pageFor(staff.CHEF.auth, '/admin/dashboard')
    await page.waitForURL(/\/kds\//, { timeout: 15000 })
    assert.equal(await page.getByRole('link', { name: /^Reports/ }).count(), 0)
    await ctx.close()
  })

  it('kitchen station (PIN): signs in with the restaurant code and PIN and lands on the display', async () => {
    const ctx = await browser.newContext({ viewport: { width: 1024, height: 768 } })
    const page = await ctx.newPage()
    const st = await j('POST', '/auth/kds-pin-login', { body: { pinCode: '2468', outletSlug: SLUG } })
    assert.equal(st.status, 200)
    await page.addInitScript((d) => {
      localStorage.setItem('pangat_access_token', d.accessToken); localStorage.setItem('pangat_user', JSON.stringify(d.user))
      localStorage.setItem('pangat_outlets', JSON.stringify(d.outlets ?? [])); if (d.outlets?.[0]) localStorage.setItem('pangat_active_outlet_slug', d.outlets[0].slug)
    }, st.data)
    await page.goto(`${WEB}/kds/${SLUG}`, { waitUntil: 'networkidle' })
    await page.getByTestId('connection-status').waitFor()
    // the station has no way into owner screens
    await page.goto(`${WEB}/admin/dashboard`, { waitUntil: 'networkidle' })
    await page.waitForURL(/\/kds\//, { timeout: 15000 })
    await ctx.close()
  })

  it('signing in through the form lands each role on a sensible first screen', async () => {
    for (const [role, expected] of [['STORE_MANAGER', /\/admin\/dashboard/], ['CASHIER', /\/admin\/orders/]]) {
      const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
      const page = await ctx.newPage()
      await page.goto(WEB + '/login', { waitUntil: 'networkidle' })
      await page.getByLabel('Email', { exact: true }).fill(staff[role].email)
      await page.getByLabel('Password', { exact: true }).fill(PW2)
      await page.getByRole('button', { name: /^Sign in/ }).click()
      await page.waitForURL(expected, { timeout: 15000 })
      await ctx.close()
    }
  })
})

describe('Walk-in order dialog', () => {
  let ownerPage; let ownerCtx
  const openDialog = async () => {
    await ownerPage.getByRole('button', { name: /Walk-in Order/ }).click()
    await ownerPage.getByRole('dialog').waitFor()
  }
  const fill = async () => {
    const dlg = ownerPage.getByRole('dialog')
    await dlg.getByRole('button', { name: /^Table / }).first().click()
    await dlg.getByRole('button', { name: /^Add one / }).first().click()
  }
  const fire = () => ownerPage.getByRole('dialog').getByRole('button', { name: /Fire to Kitchen/ })

  before(async () => {
    ;({ page: ownerPage, ctx: ownerCtx } = await pageFor(owner, '/admin/dashboard'))
  })
  after(async () => { await ownerCtx?.close() })

  it('a refused order shows the reason, keeps the dialog and the form, and sends nothing to the kitchen', async () => {
    await openDialog(); await fill()
    await ownerPage.route('**/api/v1/orders', (r) => r.request().method() === 'POST' ? r.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ success: false, message: ['Items need a choice before this order can be placed'] }) }) : r.continue())
    await fire().click()
    const alert = ownerPage.getByRole('dialog').getByRole('alert')
    await alert.waitFor()
    assert.match(await alert.innerText(), /choice before this order/)
    assert.ok(await ownerPage.getByRole('dialog').isVisible(), 'the dialog stays open')
    assert.match(await ownerPage.getByRole('dialog').innerText(), /1 item in order/, 'the form is kept')
    await ownerPage.unroute('**/api/v1/orders')
  })

  it('retrying the same order after a network failure reuses the same idempotency key (no duplicate), then succeeds and closes', async () => {
    const keys = []
    let fail = true
    await ownerPage.route('**/api/v1/orders', async (r) => {
      if (r.request().method() !== 'POST') return r.continue()
      keys.push(r.request().headers()['x-idempotency-key'])
      if (fail) { fail = false; return r.abort('failed') }
      return r.continue()
    })
    await fire().click()
    await ownerPage.getByRole('dialog').getByRole('alert').waitFor()
    await fire().click()
    await ownerPage.getByRole('dialog').waitFor({ state: 'detached', timeout: 15000 })
    assert.equal(keys.length, 2)
    assert.equal(keys[0], keys[1], 'the retry carries the same key')
    await ownerPage.unroute('**/api/v1/orders')
  })

  it('a double click sends one request', async () => {
    await openDialog(); await fill()
    let posts = 0
    await ownerPage.route('**/api/v1/orders', async (r) => {
      if (r.request().method() === 'POST') { posts++; await new Promise((res) => setTimeout(res, 800)) }
      return r.continue()
    })
    const btn = fire()
    await btn.dblclick()
    await ownerPage.getByRole('dialog').waitFor({ state: 'detached', timeout: 15000 })
    assert.equal(posts, 1)
    await ownerPage.unroute('**/api/v1/orders')
  })

  it('every available dish can be found (no silent cut-off), and search narrows the list', async () => {
    await openDialog()
    const dlg = ownerPage.getByRole('dialog')
    const total = await dlg.getByRole('button', { name: /^Add one / }).count()
    const menu = (await j('GET', `/menu/public/${SLUG}`)).data
    assert.equal(total, menu.items.filter((i) => i.isAvailable !== false).length)
    const first = menu.items[0].name
    await dlg.getByPlaceholder('Search dishes').fill(first.slice(0, 4))
    assert.ok((await dlg.getByRole('button', { name: /^Add one / }).count()) >= 1)
    assert.ok((await dlg.getByRole('button', { name: /^Add one / }).count()) <= total)
    await ownerPage.keyboard.press('Escape')
  })
})
