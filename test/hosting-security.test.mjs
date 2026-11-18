import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const toml = fs.readFileSync(new URL('../netlify.toml', import.meta.url), 'utf8')
const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8')
const pkg = JSON.parse(fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
const header = (name) => new RegExp(`^\\s*${name} = "(.*)"$`, 'm').exec(toml)?.[1]
const csp = header('Content-Security-Policy') ?? ''
const directive = (d) => new RegExp(`(?:^|;)\\s*${d}\\s+([^;]*)`).exec(csp)?.[1]?.trim()

describe('hosting security headers (netlify.toml)', () => {
  it('sets the standard hardening headers', () => {
    for (const h of ['X-Frame-Options', 'X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'Strict-Transport-Security']) assert.ok(header(h), `${h} missing`)
    assert.equal(header('X-Frame-Options'), 'DENY'); assert.equal(header('X-Content-Type-Options'), 'nosniff')
  })
  it('CSP forbids inline/eval scripts, plugins, framing and base-tag hijacking', () => {
    assert.equal(directive('script-src'), "'self'")
    assert.ok(!/unsafe-(inline|eval)/.test(directive('script-src')))
    assert.equal(directive('object-src'), "'none'"); assert.equal(directive('frame-ancestors'), "'none'"); assert.equal(directive('base-uri'), "'self'"); assert.equal(directive('default-src'), "'self'")
  })
  it('immutable caching only for hashed assets; HTML shell revalidates', () => {
    assert.match(toml, /for = "\/assets\/\*"[\s\S]*?immutable/); assert.match(toml, /for = "\/index\.html"[\s\S]*?no-cache/)
  })
})

describe('index.html', () => {
  it('has no inline scripts (CSP) and loads the theme bootstrap from a file', () => {
    assert.ok(!/<script(?![^>]*\bsrc=)[^>]*>/.test(html), 'inline <script> found'); assert.match(html, /<script src="\/theme-init\.js">/)
    assert.ok(fs.existsSync(new URL('../public/theme-init.js', import.meta.url)))
  })
  it('loads nothing from third-party hosts (fonts are self-hosted)', () => {
    assert.ok(!/https?:\/\/(?!www\.w3\.org)/.test(html.replace(/<meta[^>]*>/g, '')), 'external URL in index.html')
  })
})

describe('dependency hygiene', () => {
  it('build-time tooling is not a runtime dependency', () => {
    for (const k of ['shadcn', '@types/qrcode']) assert.ok(!(k in pkg.dependencies), `${k} should be a devDependency`)
  })
})
