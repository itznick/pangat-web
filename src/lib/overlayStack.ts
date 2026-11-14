/**
 * Pure overlay bookkeeping (no React / DOM) so it can be unit-tested.
 *
 * - Escape stack: only the most recently opened overlay answers Escape.
 * - Scroll lock: reference-counted, so closing one of two stacked overlays never unlocks the page early.
 */
export interface EscapeStack {
  /** Register an overlay; returns an unregister function */
  push(onEscape: () => void): () => void
  /** Deliver an Escape press to the top-most overlay. Returns true if one handled it. */
  escape(): boolean
  readonly size: number
}

export function createEscapeStack(): EscapeStack {
  const entries: { cb: () => void }[] = []
  return {
    push(cb) {
      const entry = { cb }
      entries.push(entry)
      return () => {
        const i = entries.indexOf(entry)
        if (i >= 0) entries.splice(i, 1)
      }
    },
    escape() {
      const top = entries[entries.length - 1]
      if (!top) return false
      top.cb()
      return true
    },
    get size() {
      return entries.length
    },
  }
}

export interface ScrollLock {
  acquire(): () => void
  readonly count: number
}

/** `target` is anything with a `style.overflow` (document.body in the browser). */
export function createScrollLock(target: { style: { overflow: string } }): ScrollLock {
  let count = 0
  let previous = ""
  return {
    acquire() {
      if (count === 0) {
        previous = target.style.overflow
        target.style.overflow = "hidden"
      }
      count++
      let released = false
      return () => {
        if (released) return // releasing twice must not unlock someone else's hold
        released = true
        count = Math.max(0, count - 1)
        if (count === 0) target.style.overflow = previous
      }
    },
    get count() {
      return count
    },
  }
}
