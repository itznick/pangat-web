import { describe, it, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

// Minimal browser stand-ins: the store only touches localStorage, <html> and matchMedia.
const store = new Map(); let prefersDark = true; const listeners = []
const cls = new Set()
globalThis.localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)), removeItem: (k) => store.delete(k) }
globalThis.document = { documentElement: { classList: { toggle: (c, on) => (on ? cls.add(c) : cls.delete(c)), contains: (c) => cls.has(c) }, style: {}, dataset: {} }, querySelector: () => ({ setAttribute() {} }) }
globalThis.window = { matchMedia: () => ({ get matches() { return prefersDark }, addEventListener: (_, fn) => listeners.push(fn) }), addEventListener() {} }

const { useThemeStore, resolveTheme, applyTheme, initTheme } = await import('../src/stores/useThemeStore.ts')

describe('theme store', () => {
  beforeEach(() => { store.clear(); cls.clear(); prefersDark = true; useThemeStore.setState({ preference: 'system', resolved: 'dark' }) })

  it('system follows the OS preference', () => {
    prefersDark = true; assert.equal(resolveTheme('system'), 'dark')
    prefersDark = false; assert.equal(resolveTheme('system'), 'light')
    assert.equal(resolveTheme('light'), 'light'); assert.equal(resolveTheme('dark'), 'dark')
  })
  it('applyTheme sets the dark class, colour-scheme and data-theme', () => {
    applyTheme('dark'); assert.ok(cls.has('dark')); assert.equal(document.documentElement.style.colorScheme, 'dark'); assert.equal(document.documentElement.dataset.theme, 'dark')
    applyTheme('light'); assert.ok(!cls.has('dark')); assert.equal(document.documentElement.style.colorScheme, 'light')
  })
  it('setPreference persists, applies and updates the store', () => {
    useThemeStore.getState().setPreference('light')
    assert.equal(store.get('pangat_theme'), 'light'); assert.ok(!cls.has('dark')); assert.equal(useThemeStore.getState().resolved, 'light')
    useThemeStore.getState().setPreference('dark'); assert.ok(cls.has('dark'))
  })
  it('toggle flips light/dark and leaves "system" behind', () => {
    useThemeStore.getState().setPreference('system'); prefersDark = true; useThemeStore.setState({ resolved: 'dark' })
    useThemeStore.getState().toggle(); assert.equal(useThemeStore.getState().preference, 'light')
    useThemeStore.getState().toggle(); assert.equal(useThemeStore.getState().preference, 'dark')
  })
  it('keeps working when storage is blocked', () => {
    const keep = globalThis.localStorage; globalThis.localStorage = { getItem() { throw new Error('blocked') }, setItem() { throw new Error('blocked') } }
    try { assert.doesNotThrow(() => useThemeStore.getState().setPreference('light')); assert.equal(useThemeStore.getState().resolved, 'light') } finally { globalThis.localStorage = keep }
  })
  it('follows OS changes only while the preference is "system"', () => {
    initTheme(); const fire = listeners.at(-1)
    prefersDark = false; fire(); assert.equal(useThemeStore.getState().resolved, 'light')
    useThemeStore.getState().setPreference('dark'); prefersDark = false; fire(); assert.equal(useThemeStore.getState().resolved, 'dark')
  })
})
