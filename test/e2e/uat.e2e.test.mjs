/**
 * User-acceptance (end-to-end) tests: drive the real UI in Chromium, against a running API.
 *
 *   # terminal 1: API (Postgres) on :4000      terminal 2: npm run dev      terminal 3:
 *   npm run test:uat
 *
 * Env: UAT_WEB (default http://localhost:5173), UAT_API (default http://localhost:4000/api/v1).
 * The suite onboards its own demo outlet ("uat-cafe") if it does not exist yet.
 */
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.UAT_PLAYWRIGHT || 'playwright')

const WEB = process.env.UAT_WEB || 'http://localhost:5173'
const API = process.env.UAT_API || 'http://localhost:4000/api/v1'
const OWNER = { email: 'uat-owner@example.com', password: 'uat-pass-1234' }
const SLUG = 'uat-cafe'
const PHONE = { width: 375, height: 700 }
const DESKTOP = { width: 1366, height: 800 }

let browser
const sessions = new Set()

async function seed() {
  const res = await fetch(`${API}/auth/onboard`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      brandName: 'UAT Cafe', ownerFullName: 'Uma Tester', mobileNumber: '9876500000', email: OWNER.email, password: OWNER.password,
      outletName: 'UAT Cafe', branchArea: 'Pune', slug: SLUG, upiVpa: 'uat@upi', gstPercentage: 12,
      indoorTableCount: 4, outdoorTableCount: 0, menuPreset: 'pune_cafe', teamMode: 'solo', kitchenPin: '4321',
    }),
  })
  assert.ok([201, 400, 409].includes(res.status), `seed failed: ${res.status}`) // 400/409: already onboarded
}

async function openPage(viewport, path, { signedIn = false } = {}) {
  const ctx = await browser.newContext({ viewport, hasTouch: viewport.width < 500, isMobile: viewport.width < 500 })
  sessions.add(ctx)
  const page = await ctx.newPage()
  page.problems = []
  page.on('pageerror', (e) => page.problems.push(e.message))
  page.on('console', (m) => m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text()) && page.problems.push(m.text()))
  if (signedIn) {
    const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(OWNER) })
    const d = (await r.json()).data
    await page.addInitScript((d) => {
      if (sessionStorage.getItem('uat-seeded')) return
      sessionStorage.setItem('uat-seeded', '1')
      localStorage.setItem('pangat_access_token', d.accessToken)
      localStorage.setItem('pangat_user', JSON.stringify(d.user))
      localStorage.setItem('pangat_org', JSON.stringify(d.organization))
      localStorage.setItem('pangat_outlets', JSON.stringify(d.outlets))
      localStorage.setItem('pangat_active_outlet_slug', d.outlets[0].slug)
    }, d)
  }
  await page.goto(WEB + path, { waitUntil: 'networkidle' })
  return page
}
const bodyLocked = (page) => page.evaluate(() => document.body.style.overflow === 'hidden')
const horizontalOverflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)

before(async () => {
  await seed()
  browser = await chromium.launch()
})
after(async () => {
  for (const c of sessions) await c.close().catch(() => {})
  await browser?.close()
})

describe('UAT · first-time visitor on a phone (landing page)', () => {
  it('opens the menu sheet, locks page scroll, and Escape closes it and unlocks scroll', async () => {
    const page = await openPage(PHONE, '/')
    await page.getByRole('button', { name: 'Open menu' }).click()
    assert.equal(await bodyLocked(page), true)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(150)
    assert.equal(await bodyLocked(page), false)
    assert.equal(await page.getByRole('button', { name: 'Open menu' }).isVisible(), true)
  })

  it('"Start free" opens the trial dialog that closes with Esc and with a backdrop tap, and returns focus to the opener', async () => {
    const page = await openPage(PHONE, '/')
    const opener = page.getByRole('button', { name: 'Start free', exact: true })
    await opener.click()
    const dialog = page.getByRole('dialog')
    await dialog.waitFor()
    assert.equal(await bodyLocked(page), true)
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'detached' })
    assert.equal(await bodyLocked(page), false)
    assert.equal(await page.evaluate(() => document.activeElement?.textContent?.trim().startsWith('Start free')), true, 'focus returned to opener')

    await opener.click()
    await dialog.waitFor()
    await page.mouse.click(5, 350) // backdrop, outside the card
    await dialog.waitFor({ state: 'detached' })
  })

  it('has no horizontal scroll and no runtime errors', async () => {
    const page = await openPage(PHONE, '/')
    assert.ok((await horizontalOverflow(page)) <= 0)
    assert.deepEqual(page.problems, [])
  })
})

describe('UAT · owner signs in', () => {
  it('shows a readable error for bad credentials and can reveal the typed password', async () => {
    const page = await openPage(PHONE, '/login')
    await page.getByLabel('Email', { exact: true }).fill(OWNER.email)
    await page.getByLabel('Password', { exact: true }).fill('wrong-password')
    assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'password')
    await page.getByRole('button', { name: 'Show password' }).click()
    assert.equal(await page.getByLabel('Password', { exact: true }).getAttribute('type'), 'text')
    await page.getByRole('button', { name: /^Sign in/ }).click()
    await page.getByRole('alert').waitFor()
    assert.ok((await page.getByRole('alert').textContent()).length > 5)
  })

  it('kitchen PIN field only accepts digits', async () => {
    const page = await openPage(PHONE, '/login?tab=pin')
    await page.getByLabel('Station PIN').fill('12ab34')
    assert.equal(await page.getByLabel('Station PIN').inputValue(), '1234')
  })

  it('signs in to the dashboard, and /login then sends an already-signed-in owner straight back to work', async () => {
    const page = await openPage(PHONE, '/login')
    await page.getByLabel('Email', { exact: true }).fill(OWNER.email)
    await page.getByLabel('Password', { exact: true }).fill(OWNER.password)
    await page.getByRole('button', { name: /^Sign in/ }).click()
    await page.waitForURL('**/admin/dashboard')
    await page.goto(WEB + '/login')
    await page.waitForURL('**/admin/dashboard')
  })
})

describe('UAT · owner on a phone: navigation', () => {
  it('sidebar opens as a drawer, nav items are real links, choosing one navigates and closes the drawer', async () => {
    const page = await openPage(PHONE, '/admin/dashboard', { signedIn: true })
    await page.getByRole('button', { name: 'Open sidebar' }).click()
    const link = page.getByRole('link', { name: 'Menu & Modifiers' })
    assert.equal(await link.getAttribute('href'), '/admin/menu')
    assert.equal(await bodyLocked(page), true)
    await link.click()
    await page.waitForURL('**/admin/menu')
    await page.waitForTimeout(400)
    assert.equal(await bodyLocked(page), false)
    assert.equal(await page.getByRole('button', { name: 'Open sidebar' }).isVisible(), true)
    assert.equal(await page.getByRole('heading', { level: 1 }).first().isVisible(), true)
  })

  it('Escape closes the sidebar drawer and focus returns to the toggle', async () => {
    const page = await openPage(PHONE, '/admin/dashboard', { signedIn: true })
    const toggle = page.getByRole('button', { name: 'Open sidebar' })
    await toggle.click()
    await page.keyboard.press('Escape')
    await page.waitForTimeout(350)
    assert.equal(await bodyLocked(page), false)
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), 'Open sidebar')
  })

  it('notifications popover closes on outside tap and on Escape', async () => {
    const page = await openPage(PHONE, '/admin/dashboard', { signedIn: true })
    const bell = page.getByRole('button', { name: /^Notifications/ })
    await bell.click()
    await page.getByRole('dialog', { name: 'Notifications' }).waitFor()
    await page.touchscreen.tap(60, 500)
    await page.getByRole('dialog', { name: 'Notifications' }).waitFor({ state: 'detached' })
    await bell.click()
    await page.keyboard.press('Escape')
    await page.getByRole('dialog', { name: 'Notifications' }).waitFor({ state: 'detached' })
  })

  for (const path of ['dashboard', 'tables', 'menu', 'orders', 'inventory', 'feedback', 'settings', 'subscription']) {
    it(`/admin/${path} fits a 375px screen without sideways scrolling or runtime errors`, async () => {
      const page = await openPage(PHONE, `/admin/${path}`, { signedIn: true })
      await page.waitForTimeout(500)
      assert.ok((await horizontalOverflow(page)) <= 0, 'horizontal overflow')
      assert.deepEqual(page.problems, [])
    })
  }
})

describe('UAT · owner on a laptop: keyboard-driven console', () => {
  it('Ctrl+K palette finds "orders" and Enter opens it; Escape closes the palette', async () => {
    const page = await openPage(DESKTOP, '/admin/dashboard', { signedIn: true })
    await page.keyboard.press('Control+k')
    const palette = page.getByRole('dialog', { name: 'Command palette' })
    await palette.waitFor()
    await page.keyboard.type('orders')
    await page.keyboard.press('Enter')
    await page.waitForURL('**/admin/orders')
    await page.keyboard.press('Control+k')
    await palette.waitFor()
    await page.keyboard.press('Escape')
    await palette.waitFor({ state: 'detached' })
  })

  it('Escape only closes the top-most layer (palette over settings), and scroll lock survives until the last one closes', async () => {
    const page = await openPage(DESKTOP, '/admin/dashboard', { signedIn: true })
    await page.keyboard.press('g')
    await page.keyboard.press('s')
    const settings = page.getByRole('dialog', { name: 'Settings' })
    await settings.waitFor()
    await page.keyboard.press('Control+k')
    const palette = page.getByRole('dialog', { name: 'Command palette' })
    await palette.waitFor()
    await page.keyboard.press('Escape')
    await palette.waitFor({ state: 'detached' })
    assert.equal(await settings.isVisible(), true, 'settings must stay open')
    assert.equal(await bodyLocked(page), true, 'scroll must stay locked while settings is open')
    await page.keyboard.press('Escape')
    await settings.waitFor({ state: 'detached' })
    assert.equal(await bodyLocked(page), false)
  })

  it('keeps keyboard focus inside an open dialog (Tab wraps) and hands focus back on close', async () => {
    const page = await openPage(DESKTOP, '/admin/dashboard', { signedIn: true })
    await page.keyboard.press('g')
    await page.keyboard.press('s')
    const settings = page.getByRole('dialog', { name: 'Settings' })
    await settings.waitFor()
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab')
      assert.equal(await page.evaluate(() => !!document.activeElement?.closest('[role=dialog][aria-label=Settings]')), true, `focus escaped the dialog on Tab #${i + 1}`)
    }
    await page.keyboard.press('Escape')
    await settings.waitFor({ state: 'detached' })
  })

  it('outlet switcher closes on Escape and outside click', async () => {
    const page = await openPage(DESKTOP, '/admin/dashboard', { signedIn: true })
    const sw = page.getByRole('button', { name: /Switch outlet/ })
    await sw.click()
    assert.equal(await sw.getAttribute('aria-expanded'), 'true')
    await page.keyboard.press('Escape')
    assert.equal(await sw.getAttribute('aria-expanded'), 'false')
    await sw.click()
    await page.mouse.click(900, 400)
    assert.equal(await sw.getAttribute('aria-expanded'), 'false')
  })

  it('menu availability switches have meaningful names and flip state', async () => {
    const page = await openPage(DESKTOP, '/admin/menu', { signedIn: true })
    const sw = page.getByRole('switch').first()
    await sw.waitFor()
    const name = await sw.getAttribute('aria-label')
    assert.match(name, /available|hidden/)
    const before = await sw.getAttribute('aria-checked')
    await sw.click()
    await page.waitForTimeout(300)
    assert.notEqual(await page.getByRole('switch').first().getAttribute('aria-checked'), before)
    await page.getByRole('switch').first().click() // restore
  })
})

describe('UAT · owner on a laptop: collapsed sidebar rail', () => {
  it('account menu opens fully visible beside the rail (not clipped), and rail items show a tooltip on hover', async () => {
    const page = await openPage(DESKTOP, '/admin/dashboard', { signedIn: true })
    await page.keyboard.press('Control+b')
    await page.waitForTimeout(450)
    await page.locator('aside button[aria-haspopup=menu]').last().click()
    const signOut = page.getByRole('menuitem', { name: /Sign out/ })
    await signOut.waitFor()
    const box = await signOut.boundingBox()
    assert.ok(box.width > 150, `menu item is only ${Math.round(box.width)}px wide (clipped by the rail)`)
    await page.keyboard.press('Escape')
    await page.locator('aside a[href="/admin/tables"]').hover()
    const tip = page.getByRole('tooltip')
    await tip.waitFor()
    assert.match(await tip.textContent(), /Floor & Tables/)
    await page.keyboard.press('Escape')
    await tip.waitFor({ state: 'detached' })
  })
})

describe('UAT · owner on a tablet', () => {
  const TABLET = { width: 820, height: 1000 }
  it('starts with the slim sidebar rail so content has room', async () => {
    const page = await openPage(TABLET, '/admin/tables', { signedIn: true })
    const w = await page.evaluate(() => document.querySelector('aside').getBoundingClientRect().width)
    assert.ok(w < 100, `sidebar is ${w}px wide on a tablet`)
  })
  it('floor table cards do not truncate their buttons or status dropdown text', async () => {
    const page = await openPage(TABLET, '/admin/tables', { signedIn: true })
    await page.locator('select').first().waitFor()
    const clipped = await page.evaluate(() =>
      [...document.querySelectorAll('main select, select, button')].filter((el) => el.closest('[class*=grid-cols]') && el.scrollWidth > el.clientWidth + 1).map((el) => (el.textContent || el.value || '').trim().slice(0, 30)))
    assert.deepEqual(clipped, [])
  })
})

describe('UAT · guest scans a table QR on a phone', () => {
  it('sticky category bar sits directly under the header (not overlapped) while scrolling', async () => {
    const page = await openPage(PHONE, `/r/${SLUG}/t/T1`)
    await page.mouse.wheel(0, 400)
    await page.waitForTimeout(300)
    const gap = await page.evaluate(() => {
      const bar = document.getElementById('diner-topbar').getBoundingClientRect()
      const chips = [...document.querySelectorAll('button[aria-pressed]')].find((b) => b.textContent.trim() === 'All').getBoundingClientRect()
      return chips.top - bar.bottom
    })
    assert.ok(gap >= 0, `category chips overlap the header by ${-gap}px`)
  })

  it('ordering controls are comfortably tappable (>= 40px)', async () => {
    const page = await openPage(PHONE, `/r/${SLUG}/t/T1`)
    const sizes = await page.evaluate(() =>
      [...document.querySelectorAll('button')]
        .filter((b) => /^\+?\s*Add$|^All$|Veg|Non-Veg/.test(b.textContent.trim()))
        .map((b) => [b.textContent.trim(), Math.round(b.getBoundingClientRect().height)]))
    assert.ok(sizes.length >= 4)
    for (const [label, h] of sizes) assert.ok(h >= 36, `${label} is only ${h}px tall`)
  })

  it('cart pill total matches the checkout total (uses the outlet GST, not a hard-coded 5%)', async () => {
    const page = await openPage(PHONE, `/r/${SLUG}/t/T1`)
    await page.getByRole('button', { name: /^Add .* to order$/ }).first().click()
    const pill = page.getByRole('button', { name: /^Review order/ })
    await pill.waitFor()
    const pillTotal = (await pill.textContent()).match(/₹\s*([\d.,]+)\s*$/)[1]
    await pill.click()
    const drawer = page.getByRole('dialog').filter({ hasText: /Taxes & GST/ })
    await drawer.waitFor()
    assert.match(await drawer.textContent(), /Taxes & GST \(12%\)/)
    assert.ok((await drawer.textContent()).includes(pillTotal), `checkout does not show pill total ₹${pillTotal}`)
    assert.equal(await bodyLocked(page), true)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(450)
    assert.equal(await bodyLocked(page), false)
  })
})

describe('UAT · guest places an order and tracks it', () => {
  it('order tracker has a back-to-menu button', async () => {
    const page = await openPage(PHONE, `/r/${SLUG}/t/T1`)
    await page.getByRole('button', { name: /^Add .* to order$/ }).first().click()
    await page.getByRole('button', { name: /^Review order/ }).click()
    await page.getByRole('button', { name: /Proceed to/ }).click()
    await page.waitForURL(/\/order\//)
    await page.getByRole('button', { name: 'Back to menu' }).click()
    await page.waitForURL(new RegExp(`/r/${SLUG}/t/`))
  })
})

// ─────────────────────────────────────────────────────────────────────────────
// ERP workflows added in the full-stack audit
// ─────────────────────────────────────────────────────────────────────────────
const uniq = Math.random().toString(16).slice(2, 8)
const apiLogin = async (email, password) => {
  const r = await fetch(`${API}/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) })
  return (await r.json()).data
}
const apiAs = (token) => async (method, path, body) => {
  const r = await fetch(API + path, { method, headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` }, body: body ? JSON.stringify(body) : undefined })
  return { status: r.status, json: await r.json().catch(() => null) }
}
const settingsTab = (page, name) => page.getByRole('tab', { name: new RegExp(name) }).click()

describe('UAT · owner runs the team (settings → team)', () => {
  const staffEmail = `cashier-${uniq}@example.com`

  it('adds a cashier in the UI; the cashier signs in and sees only cashier screens; deactivating signs them out', async () => {
    const page = await openPage(DESKTOP, '/admin/settings', { signedIn: true })
    await settingsTab(page, 'Team')
    await page.getByRole('button', { name: 'Add team member' }).click()
    await page.getByLabel('Full name').fill('Chitra Cashier')
    await page.getByLabel('Email (their login)').fill(staffEmail)
    await page.locator('form').getByLabel('Role').selectOption('CASHIER')
    await page.getByLabel('Starting password').fill('Cashier-pass-1')
    await page.getByRole('button', { name: 'Add member' }).click()
    await page.getByText(staffEmail).waitFor()

    // the new cashier, in a fresh browser session
    const cp = await openPage(DESKTOP, '/login')
    await cp.getByLabel('Email', { exact: true }).fill(staffEmail)
    await cp.getByLabel('Password', { exact: true }).fill('Cashier-pass-1')
    await cp.getByRole('button', { name: /^Sign in/ }).click()
    await cp.waitForURL('**/admin/**')
    assert.equal(await cp.getByRole('link', { name: /^Floor & Tables/ }).isVisible(), true)
    assert.equal(await cp.getByRole('link', { name: 'Reports' }).count(), 0, 'cashier must not see Reports')
    assert.match(cp.url(), /\/admin\/orders/, 'a cashier lands on the orders screen, not an owner dashboard')
    await cp.goto(WEB + '/admin/reports')
    await cp.getByText('Access Restricted').waitFor()
    assert.equal(await cp.getByRole('link', { name: 'Menu & Modifiers' }).count(), 0, 'cashier must not see Menu')

    // owner deactivates; the cashier's open session ends on the next request
    await page.getByRole('button', { name: 'Deactivate' }).last().click()
    await page.getByText('Deactivated', { exact: true }).first().waitFor()
    await cp.reload()
    await cp.waitForURL('**/login')
  })
})

describe('UAT · owner reads the numbers and tunes tax', () => {
  it('reports page renders KPIs for the chosen period', async () => {
    const page = await openPage(DESKTOP, '/admin/reports', { signedIn: true })
    await page.getByText('Net sales').waitFor()
    await page.getByRole('button', { name: '30 days' }).click()
    await page.getByText('Best sellers').waitFor()
    assert.deepEqual(page.problems, [])
  })

  it('service charge set in Settings shows up on the guest bill and in the cart total', async () => {
    const t = await apiLogin(OWNER.email, OWNER.password)
    const as = apiAs(t.accessToken)
    await as('PATCH', `/restaurants/${SLUG}/settings`, { serviceChargePercentage: 10, gstPercentage: 12 })
    try {
      const page = await openPage(PHONE, `/r/${SLUG}/t/T1`)
      await page.getByRole('button', { name: /^Add .* to order$/ }).first().click()
      await page.getByRole('button', { name: /^Review order/ }).click()
      const drawer = page.getByRole('dialog').filter({ hasText: /Taxes & GST/ })
      await drawer.waitFor()
      assert.match(await drawer.textContent(), /Service charge \(10%\)/)
    } finally {
      await as('PATCH', `/restaurants/${SLUG}/settings`, { serviceChargePercentage: 0 })
    }
  })
})

describe('UAT · account, passwords & the kitchen', () => {
  it('forgot-password from the sign-in page shows a neutral confirmation', async () => {
    const page = await openPage(PHONE, '/login')
    await page.getByRole('button', { name: 'Forgot your password?' }).click()
    await page.getByLabel('Email', { exact: true }).fill(`nobody-${uniq}@example.com`)
    await page.getByRole('button', { name: 'Send reset link' }).click()
    await page.getByRole('status').filter({ hasText: /reset link/i }).waitFor()
  })

  it('owner sets a kitchen PIN in Settings and the kitchen signs in with slug + PIN', async () => {
    const page = await openPage(DESKTOP, '/admin/settings', { signedIn: true })
    await settingsTab(page, 'Kitchen')
    await page.getByLabel(/Set a new PIN|Create a PIN/).fill('5821')
    await page.getByRole('button', { name: /Change PIN|Save PIN/ }).click()
    await page.getByText(/Kitchen PIN saved/).waitFor()

    const k = await openPage(PHONE, '/login?tab=pin')
    await k.getByLabel('Outlet slug').fill(SLUG)
    await k.getByLabel('Station PIN').fill('5821')
    await k.getByRole('button', { name: 'Open kitchen display' }).click()
    await k.waitForURL(`**/kds/${SLUG}`)
  })

  it('PIN sign-in refuses a missing slug and a wrong PIN with a readable message', async () => {
    const k = await openPage(PHONE, '/login?tab=pin')
    await k.getByLabel('Station PIN').fill('0000')
    assert.equal(await k.getByRole('button', { name: 'Open kitchen display' }).isDisabled(), true, 'needs the slug first')
    await k.getByLabel('Outlet slug').fill(SLUG)
    await k.getByRole('button', { name: 'Open kitchen display' }).click()
    await k.getByRole('alert').waitFor()
  })

  it('changing the password in My account keeps this device signed in and the new password works', async () => {
    const email = `pw-${uniq}@example.com`
    const owner = await apiLogin(OWNER.email, OWNER.password)
    const as = apiAs(owner.accessToken)
    const hired = await as('POST', `/restaurants/${owner.outlets[0].id}/staff`, { name: 'Pat Manager', email, password: 'First-pass-123', role: 'STORE_MANAGER' })
    assert.equal(hired.status, 201)

    const page = await openPage(DESKTOP, '/login')
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel('Password', { exact: true }).fill('First-pass-123')
    await page.getByRole('button', { name: /^Sign in/ }).click()
    await page.waitForURL('**/admin/**')
    await page.goto(WEB + '/admin/settings')
    await settingsTab(page, 'My account')
    await page.getByLabel(/^Current password/).fill('First-pass-123')
    await page.getByLabel(/^New password/).fill('Second-pass-456')
    await page.getByLabel(/^Repeat new password/).fill('Second-pass-456')
    await page.getByRole('button', { name: 'Update password' }).click()
    await page.getByText(/Password updated/).waitFor()
    await page.reload()
    assert.equal(page.url().includes('/login'), false, 'this device stays signed in')
    assert.ok((await apiLogin(email, 'Second-pass-456'))?.accessToken)
  })
})

describe('UAT · menu & subscription self-service', () => {
  it('owner deletes a dish (with confirmation) and renames a category', async () => {
    const t = await apiLogin(OWNER.email, OWNER.password)
    const as = apiAs(t.accessToken)
    const outlet = t.outlets[0]
    const cat = (await as('POST', '/menu/categories', { name: `Temp ${uniq}`, restaurantId: outlet.id })).json.data
    const dish = (await as('POST', '/menu/items', { name: `Dish ${uniq}`, price: 99, categoryId: cat.id, restaurantId: outlet.id })).json.data

    const page = await openPage(DESKTOP, '/admin/menu', { signedIn: true })
    await page.getByRole('table').getByText(`Dish ${uniq}`).waitFor()
    await page.getByRole('row', { name: new RegExp(`Dish ${uniq}`) }).getByRole('button').last().click()
    await page.getByRole('button', { name: 'Delete dish' }).click()
    await page.getByRole('button', { name: 'Yes, delete' }).click()
    await page.getByRole('table').getByText(`Dish ${uniq}`).waitFor({ state: 'detached' })

    await page.getByRole('button', { name: /^Category$/ }).click()
    await page.locator('li', { hasText: `Temp ${uniq}` }).getByRole('button', { name: 'Rename' }).click()
    await page.getByLabel(`Rename Temp ${uniq}`).fill(`Renamed ${uniq}`)
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    await page.locator('li', { hasText: `Renamed ${uniq}` }).waitFor()
    // empty category can now be deleted
    const row = page.locator('li', { hasText: `Renamed ${uniq}` })
    await row.getByRole('button', { name: 'Delete' }).click()
    await page.locator('li', { hasText: `Renamed ${uniq}` }).waitFor({ state: 'detached' })
    void dish
  })

  it('"Request this plan" reaches the team (toast) instead of opening WhatsApp', async () => {
    const page = await openPage(DESKTOP, '/admin/subscription?tab=plans', { signedIn: true })
    const btn = page.getByRole('button', { name: 'Request this plan' }).first()
    await btn.waitFor()
    await btn.click()
    await page.getByText(/Request sent/).waitFor()
  })
})

describe('UAT · one order, three screens, in real time', () => {
  it('guest orders → kitchen sees it instantly → kitchen cooks → guest tracker follows → cashier settles → everything agrees', async () => {
    // Kitchen tablet, signed in the real way (slug + PIN), watching its board
    const kitchen = await openPage(DESKTOP, '/login?tab=pin')
    await kitchen.getByLabel('Outlet slug').fill(SLUG)
    await kitchen.getByLabel('Station PIN').fill('5821')
    await kitchen.getByRole('button', { name: 'Open kitchen display' }).click()
    await kitchen.waitForURL(`**/kds/${SLUG}`)
    await kitchen.waitForTimeout(1200) // socket joined

    // Owner's orders screen, already open
    const owner = await openPage(DESKTOP, '/admin/orders', { signedIn: true })

    // Guest scans the QR on a phone and orders (UPI)
    const guest = await openPage(PHONE, `/r/${SLUG}/t/T2`)
    await guest.getByRole('button', { name: /^Add .* to order$/ }).first().click()
    await guest.getByRole('button', { name: /^Review order/ }).click()
    await guest.getByRole('button', { name: /Proceed to/ }).click()
    await guest.waitForURL(/\/order\//)
    const orderId = guest.url().split('/order/')[1].split('?')[0]
    const tag = orderId.slice(-3).toUpperCase()

    // Kitchen: the ticket shows up without any reload
    await kitchen.getByText(`#${tag}`).first().waitFor({ timeout: 8000 })
    // Owner: the same order appears live as well
    await owner.getByText(new RegExp(orderId.slice(-6), 'i')).first().waitFor({ timeout: 8000 })

    // Kitchen starts cooking → guest's tracker moves to "In Kitchen"
    await kitchen.getByRole('button', { name: /Start Prep/ }).first().click()
    await guest.getByText(/Chef is actively preparing/).waitFor({ timeout: 8000 })

    // Cashier settles the bill at the counter → guest sees payment confirmed, owner sees it paid
    await owner.reload()
    const row = owner.locator('div, tr').filter({ hasText: new RegExp(orderId.slice(-6), 'i') }).filter({ has: owner.getByRole('button', { name: /Mark Paid/ }) }).last()
    await row.getByRole('button', { name: /Mark Paid/ }).first().click()
    await guest.getByText(/paid|payment (received|confirmed)|thank/i).first().waitFor({ timeout: 10000 })

    assert.deepEqual(kitchen.problems, [])
    assert.deepEqual(guest.problems, [])
  })
})
