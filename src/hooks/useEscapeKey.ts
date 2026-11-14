import { useEffect, useRef } from "react"
import { createEscapeStack } from "@/lib/overlayStack"

/** Shared by every overlay: only the most recently opened one reacts to Escape. */
const stack = createEscapeStack()
let listening = false

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape" && !e.defaultPrevented) stack.escape()
}

/** Calls `onEscape` when Escape is pressed while `active` is true and this is the topmost overlay. */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  const cb = useRef(onEscape)
  useEffect(() => {
    cb.current = onEscape
  })
  useEffect(() => {
    if (!active) return
    if (!listening) {
      window.addEventListener("keydown", onKey)
      listening = true
    }
    return stack.push(() => cb.current())
  }, [active])
}
