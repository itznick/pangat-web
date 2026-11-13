import type { ElementType } from "react"

export interface CommandItem {
  id: string
  label: string
  group: string
  icon: ElementType
  /** Extra words the search should match */
  keywords?: string
  /** Shown on the right, e.g. "G D" */
  shortcut?: string
  run: () => void
}
