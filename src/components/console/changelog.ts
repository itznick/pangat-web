export interface ChangelogEntry {
  date: string
  title: string
  items: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: "13 Nov 2026",
    title: "A calmer console",
    items: [
      "New top bar with global search and live notifications",
      "Plan & billing rebuilt: usage, plans, GST invoices and a quick billing view",
      "Settings and billing open as modals from your account menu",
      "Sidebar toggle fixed everywhere; press Ctrl B to show or hide it",
      "New look across the owner portal, kitchen display and guest menu",
      "Command palette: press Ctrl K to jump anywhere or run an action",
      "Go-to shortcuts: press G then D, T, O, M, I, F or S",
      "Guided, step-by-step restaurant provisioning for platform ops",
      "Escape now closes every dialog and drawer",
    ],
  },
  {
    date: "6 Nov 2026",
    title: "Guest menu polish",
    items: [
      "“Add to order” waits until a required choice (like milk) is picked",
      "Safe-area aware cart bar on phones with a home indicator",
    ],
  },
]
