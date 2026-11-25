/**
 * Public pricing and landing-page claims (no browser, no network).
 *
 * 1. The plan table on the site equals the APPROVED Pangat strategy (and the API repository pins the same numbers).
 * 2. The landing page never makes a claim the product does not support.
 * 3. The Founding 10 section is written but stays unpublished until the founders switch it on.
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8')
const plansMod = await import(path.join(root, 'src/features/landing/plans.ts'))
const { PLANS, annualPrice, annualSaving, inr, FOUNDING_10, FOUNDING_10_PUBLISHED, GST_NOTE, TRIAL_NOTE } = plansMod

const APPROVED = {
  MINI:       { name: 'Pangat Mini',       monthly: 699,  annual: 6990,  saving: 1398, outlets: 1, tables: 10,  staff: 3 },
  STARTER:    { name: 'Pangat Starter',    monthly: 1299, annual: 12990, saving: 2598, outlets: 1, tables: 25,  staff: 8 },
  GROWTH:     { name: 'Pangat Growth',     monthly: 2499, annual: 24990, saving: 4998, outlets: 3, tables: 60,  staff: 20 },
  ENTERPRISE: { name: 'Pangat Enterprise', monthly: 4999, annual: 49990, saving: 9998, outlets: 5, tables: 100, staff: 40 },
}

describe('Approved plan table', () => {
  it('shows exactly four plans, in this order, under these names', () => {
    assert.deepEqual(PLANS.map((p) => p.key), ['MINI', 'STARTER', 'GROWTH', 'ENTERPRISE'])
    assert.deepEqual(PLANS.map((p) => p.name), Object.values(APPROVED).map((a) => a.name))
  })
  for (const p of PLANS) {
    const a = APPROVED[p.key]
    it(`${p.name}: monthly, annual, saving and limits`, () => {
      assert.equal(p.monthly, a.monthly)
      assert.equal(annualPrice(p.monthly), a.annual)
      assert.equal(annualPrice(p.monthly), p.monthly * 10, 'annual is exactly ten times monthly')
      assert.equal(annualSaving(p.monthly), a.saving)
      assert.deepEqual([p.outlets, p.tablesPerOutlet, p.staffPerOutlet], [a.outlets, a.tables, a.staff])
    })
  }
  it('Enterprise is "starting at" and an enquiry; the others are self-serve trials', () => {
    assert.equal(PLANS.find((p) => p.key === 'ENTERPRISE').enquiry, true)
    assert.ok(PLANS.filter((p) => p.key !== 'ENTERPRISE').every((p) => !p.enquiry))
  })
  it('prices are formatted in Indian digit grouping', () => {
    assert.equal(inr(49990), '₹49,990')
    assert.equal(inr(699), '₹699')
  })
  it('GST is stated clearly and does not imply the displayed price is the amount payable', () => {
    assert.match(GST_NOTE, /exclude GST/)
    assert.match(GST_NOTE, /additionally/)
    assert.match(GST_NOTE, /higher than the price displayed/)
  })
  it('the trial is 14 days with no card and the trial capacity', () => {
    assert.match(TRIAL_NOTE, /14-day/)
    assert.match(TRIAL_NOTE, /no card/)
    assert.match(TRIAL_NOTE, /20 tables/)
  })
  it('there is no quarterly billing anywhere on the site', () => {
    const strip = (x) => x.replace(/\/\*[\s\S]*?\*\//g, '')
    const src = strip(read('src/features/landing/components/Pricing.tsx')) + strip(read('src/features/landing/plans.ts'))
    assert.ok(!/quarter/i.test(src))
  })
  it('the pricing component offers a monthly/annual switch and uses the shared plan table', () => {
    const src = read('src/features/landing/components/Pricing.tsx')
    assert.match(src, /aria-pressed/)
    assert.match(src, /from "\.\.\/plans"/)
    assert.match(src, /PLANS\.map/)
  })
})

describe('Only what the product does is advertised', () => {
  const dir = path.join(root, 'src/features/landing')
  const files = []
  const walk = (d) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) f.isDirectory() ? walk(path.join(d, f.name)) : /\.(tsx|ts)$/.test(f.name) && files.push(path.join(d, f.name)) }
  walk(dir)
  // Only text that can reach a visitor is scanned: source comments (which document what is NOT advertised) are removed first
  const stripComments = (src) => src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:"'`])\/\/[^\n]*/g, '$1')
  const text = files.map((f) => ({ f: path.relative(root, f), s: stripComments(fs.readFileSync(f, 'utf8')) }))
  text.push({ f: 'index.html', s: read('index.html') })

  // Each pattern is something the product does NOT do (or that cannot be verified), with the reason.
  const BANNED = [
    [/WhatsApp (daily |nightly |closing )?(summary|message|digest)|Nightly WhatsApp|closing summary/i, 'no WhatsApp or daily summary feature exists'],
    [/keep 100%|100% yours|Fee: ₹0|0% fee|Settled to your bank|Straight to your bank/i, 'payments are not routed or guaranteed by Pangat; gateway charges may apply'],
    [/instant (UPI )?payment|1-Tap UPI|UPI Instant|Direct UPI settlement|Collected via UPI|GPay|PhonePe|Paytm|\bCRED\b/i, 'UPI payment is not verified by the product'],
    [/Water (and bill )?request|waiter call|call (the )?waiter/i, 'no call-waiter or bill-request feature exists'],
    [/every rupee, reconciled|reconcil/i, 'no payment reconciliation feature exists'],
    [/7[- ]day/i, 'the trial is 14 days'],
    [/under (a|0\.8) ?s(econd)?|Zero mis-?heard|saved on every table turn/i, 'unmeasured performance or outcome claim'],
    [/customer accounts?|loyalty|order history for (your )?(guests|customers)|consolidated report|central menu|outlet comparison|purchase order|supplier management|API integration|unlimited/i, 'not built or not available'],
    [/screens? (limit|cap)|(1|2|5) KDS screens?/i, 'no per-device KDS limit is enforceable'],
    [/Roast & Toast/i, 'a made-up business name must not look like a real customer'],
    [/testimonial|"Ordered in 20 seconds|Genuinely loved this/i, 'no fabricated testimonials'],
  ]
  for (const [re, why] of BANNED) {
    it(`never says: ${re.source.slice(0, 60)} (${why})`, () => {
      const hits = text.filter(({ s }) => re.test(s)).map(({ f }) => f)
      assert.deepEqual(hits, [], `found in ${hits.join(', ')}`)
    })
  }
  it('mock product screens are labelled as sample data', () => {
    const admin = read('src/features/landing/components/AdminScreens.tsx')
    assert.match(admin, /Sample data/)
    assert.match(read('src/features/landing/components/ProductScreens.tsx'), /sample data/i)
  })
  it('the page states 14-day trial, not 7', () => {
    const all = text.map((t) => t.s).join('\n')
    assert.match(all, /14[- ]day/i)
  })
})

describe('Founding 10', () => {
  it('is written in full but NOT published until the founders switch it on', () => {
    assert.equal(FOUNDING_10_PUBLISHED, false)
    const joined = FOUNDING_10.perks.join(' | ')
    for (const needle of ['14-day free trial', '20% off', 'first 12 paid months', '12-month price-lock', 'Free assisted onboarding', 'Free digital QR design', 'founders', 'feature requests']) {
      assert.ok(joined.includes(needle), `perk list mentions: ${needle}`)
    }
    assert.match(FOUNDING_10.intro, /first ten restaurant partners in Pune/)
  })
  it('promises no lifetime discount and uses no fake scarcity', () => {
    const txt = JSON.stringify(FOUNDING_10) + read('src/features/landing/components/Pricing.tsx')
    assert.ok(!/lifetime|forever|countdown|only \d+ (left|spots)|hurry|ends (today|soon)/i.test(txt))
    assert.match(FOUNDING_10.fineprint, /first 12 paid months only/)
  })
  it('is not rendered while unpublished', () => {
    const src = read('src/features/landing/components/Pricing.tsx')
    assert.match(src, /FOUNDING_10_PUBLISHED && <Founding10/)
  })
})

describe('Enterprise call to action is a working enquiry', () => {
  it('opens the existing lead form with an enterprise intent that is passed on to the lead', () => {
    assert.match(read('src/features/landing/components/Pricing.tsx'), /kind: "enterprise"/)
    const modal = read('src/features/landing/components/PilotModal.tsx')
    assert.match(modal, /Enterprise enquiry/)
    assert.match(modal, /api\.leads\.create/)
    assert.match(read('src/features/landing/pages/LandingPage.tsx'), /intent=\{pilotIntent\}/)
  })
})

describe('Page metadata', () => {
  const html = read('index.html')
  it('has a title, description and Open Graph tags that match the approved pricing', () => {
    assert.match(html, /<title>[^<]{20,}<\/title>/)
    assert.match(html, /name="description" content="[^"]*₹699[^"]*GST/)
    assert.match(html, /property="og:title"/)
    assert.match(html, /property="og:description"/)
    assert.ok(!/instant UPI|thermal printers/i.test(html))
  })
  it('does not invent a canonical URL, address, phone number or review markup', () => {
    assert.ok(!/rel="canonical"|aggregateRating|"telephone"|"address"|"review"/.test(html))
  })
  it('keeps the inline theme script untouched (its hash is pinned in the Content-Security-Policy)', () => {
    const m = html.match(/<script>\s*([\s\S]*?)<\/script>/)
    assert.ok(m && /pangat_theme/.test(m[1]))
    assert.match(read('netlify.toml'), /sha256-La\+RFf2i\+HwrCZm\/7sQr8H1qe1sfCkxc7q5O9ZR2aCU=/)
  })
})
