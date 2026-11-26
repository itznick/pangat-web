/** Menu CSV import in a real browser (API on :4000 with sign-up enabled, vite on :5173). */
import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.UAT_PLAYWRIGHT || 'playwright')
const WEB = process.env.UAT_WEB || 'http://127.0.0.1:5173'
const API = process.env.UAT_API || 'http://localhost:4000/api/v1'
const run = Math.random().toString(36).slice(2, 7)
const OWNER = { email: `imp-${run}@example.com`, password: 'Str0ng-pass-1' }
let browser; let ctx; let page

const j = async (method, path, body, token) => {
  const r = await fetch(API + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined })
  return { status: r.status, data: (await r.json().catch(() => ({}))).data }
}
const csv = (s) => ({ name: 'menu.csv', mimeType: 'text/csv', buffer: Buffer.from(s) })

before(async () => {
  const on = await j('POST', '/auth/onboard', { brandName: `Imp ${run}`, ownerFullName: 'Ira Owner', mobileNumber: '9876500001', email: OWNER.email, password: OWNER.password, outletName: 'Imp Cafe', branchArea: 'Pune', slug: `imp-${run}`, upiVpa: `imp${run}@upi`, gstPercentage: 5, indoorTableCount: 3, outdoorTableCount: 0, menuPreset: 'blank', teamMode: 'solo' })
  assert.equal(on.status, 201)
  const login = (await j('POST', '/auth/login', OWNER)).data
  browser = await chromium.launch()
  ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  page = await ctx.newPage()
  page.problems = []
  page.on('pageerror', (e) => page.problems.push(e.message))
  await page.addInitScript((d) => {
    if (sessionStorage.getItem('seeded')) return
    sessionStorage.setItem('seeded', '1')
    localStorage.setItem('pangat_access_token', d.accessToken); localStorage.setItem('pangat_user', JSON.stringify(d.user))
    localStorage.setItem('pangat_org', JSON.stringify(d.organization)); localStorage.setItem('pangat_outlets', JSON.stringify(d.outlets))
    localStorage.setItem('pangat_active_outlet_slug', d.outlets[0].slug)
  }, login)
  await page.goto(WEB + '/admin/menu', { waitUntil: 'networkidle' })
})
after(async () => { await ctx?.close(); await browser?.close() })

const open = async () => { await page.getByRole('button', { name: /Import CSV/ }).click(); await page.getByRole('dialog').waitFor() }
const dlg = () => page.getByRole('dialog')

describe('Menu import dialog', () => {
  it('a file with problems lists each one by line and cannot be imported', async () => {
    await open()
    await dlg().getByLabel('Choose CSV file').setInputFiles(csv('category,name,price\nMains,Thali,150\nMains,Bad,12,5\nMains,,10\n'))
    await dlg().getByRole('button', { name: 'Check the file' }).click()
    const preview = dlg().getByTestId('import-preview')
    await preview.waitFor()
    assert.match(await preview.innerText(), /with problems/)
    const list = await dlg().getByRole('list', { name: 'Problems' }).innerText()
    assert.match(list, /Line 4/)
    assert.equal(await dlg().getByRole('button', { name: 'Fix the file to import' }).isDisabled(), true)
    await dlg().getByRole('button', { name: 'Cancel' }).click()
  })

  it('a good file: check, import, and the dishes appear on the menu', async () => {
    await open()
    await dlg().getByLabel('Choose CSV file').setInputFiles(csv('category,name,price,veg\nBeverages,Masala Chai,20,veg\nSnacks,Chicken Roll,90,non-veg\n'))
    await dlg().getByRole('button', { name: 'Check the file' }).click()
    await dlg().getByTestId('import-preview').waitFor()
    assert.match(await dlg().getByTestId('import-preview').innerText(), /2 new dishes in 2 new categories/)
    await dlg().getByRole('button', { name: 'Import', exact: true }).click()
    await dlg().waitFor({ state: 'detached', timeout: 15000 })
    await page.getByText('Masala Chai').first().waitFor({ timeout: 15000 })
    await page.getByText('Chicken Roll').first().waitFor()
  })

  it('importing the same file again has nothing to add, and the Import button says so by staying off', async () => {
    await open()
    await dlg().getByLabel('Choose CSV file').setInputFiles(csv('category,name,price,veg\nBeverages,Masala Chai,20,veg\nSnacks,Chicken Roll,90,non-veg\n'))
    await dlg().getByRole('button', { name: 'Check the file' }).click()
    await dlg().getByTestId('import-preview').waitFor()
    assert.match(await dlg().getByTestId('import-preview').innerText(), /0 new dishes.*2 skipped/)
    assert.equal(await dlg().getByRole('button', { name: 'Import', exact: true }).isDisabled(), true)
    await page.keyboard.press('Escape')
  })

  it('no uncaught page errors', () => assert.deepEqual(page.problems, []))
})
