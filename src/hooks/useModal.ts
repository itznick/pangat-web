import { useEscapeKey } from "@/hooks/useEscapeKey"
import { createScrollLock } from "@/lib/overlayStack"
import { useEffect, useRef, type RefObject } from "react"

const scrollLock = createScrollLock(document.body)

/** Reference-counted body scroll lock, so stacked overlays never unlock the page early. */
export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return
    return scrollLock.acquire()
  }, [active])
}

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'

function focusables(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement)
}

/**
 * Keeps keyboard focus inside `ref` while active, moves focus in on open (unless something
 * inside already took it, e.g. an autoFocus input) and hands it back to the opener on close.
 */
export function useFocusTrap(active: boolean, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!active) return
    const root = ref.current
    if (!root) return
    const opener = document.activeElement as HTMLElement | null
    if (!root.contains(document.activeElement)) {
      const first = focusables(root)[0]
      if (first) first.focus({ preventScroll: true })
      else {
        root.tabIndex = -1
        root.focus({ preventScroll: true })
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const items = focusables(root)
      if (items.length === 0) {
        e.preventDefault()
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const cur = document.activeElement as HTMLElement | null
      if (e.shiftKey && (cur === first || !root.contains(cur))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (cur === last || !root.contains(cur))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true })
    }
  }, [active, ref])
}

/** Dismiss a popover when a press lands outside `ref` (pointer events: mouse, touch and pen). */
export function useOutsidePress(active: boolean, ref: RefObject<HTMLElement | null>, onOutside: () => void) {
  const cb = useRef(onOutside)
  useEffect(() => {
    cb.current = onOutside
  })
  useEffect(() => {
    if (!active) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb.current()
    }
    document.addEventListener("pointerdown", onDown)
    return () => document.removeEventListener("pointerdown", onDown)
  }, [active, ref])
}

/** One-stop modal behaviour: Escape (topmost only), scroll lock, focus trap + restore. Attach the returned ref to the dialog root. */
export function useModal<T extends HTMLElement = HTMLDivElement>(active: boolean, onClose: () => void) {
  const ref = useRef<T>(null)
  useEscapeKey(active, onClose)
  useScrollLock(active)
  useFocusTrap(active, ref)
  return ref
}
