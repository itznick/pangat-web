/**
 * The approved Pangat commercial plans, as shown on the public site.
 *
 * SINGLE SOURCE for the landing page. The API's plan catalogue (pangat-api `src/subscriptions/default-plans.ts`, migration 018)
 * carries the same numbers; a test in each repository pins them to the approved table, so a change here without the same change
 * there (or the reverse) fails CI.
 *
 * What is listed under each plan is only what the product enforces or demonstrably does today:
 *  - Mini / Starter / Growth / Enterprise differ by capacity (outlets, tables, staff) and by the entitlements QR ordering,
 *    kitchen display, reports (Starter+), inventory (Growth+) and multi-outlet (Growth+).
 *  - Order management, table management and staff roles exist on EVERY plan, so they are not presented as upgrades.
 *  - Nothing is advertised that is not built: no consolidated multi-outlet reporting, central menu management, outlet comparison,
 *    customer accounts, purchase orders, API access, per-device kitchen-screen limits, add-ons, WhatsApp messages or online payments.
 *  - Prices exclude GST. Annual = exactly ten times monthly (two months free). No quarterly billing.
 */

export type PlanKey = "MINI" | "STARTER" | "GROWTH" | "ENTERPRISE"

export interface LandingPlan {
  key: PlanKey
  name: string
  /** INR per month, excluding GST */
  monthly: number
  outlets: number
  tablesPerOutlet: number
  staffPerOutlet: number
  /** who it is for */
  audience: string
  /** What this plan adds, in order. "Everything in <previous plan>" comes first when relevant. */
  includes: string[]
  support: string
  /** Enterprise is "from" pricing and starts with an enquiry rather than a sign-up */
  enquiry?: boolean
}

export const PLANS: LandingPlan[] = [
  {
    key: "MINI",
    name: "Pangat Mini",
    monthly: 699,
    outlets: 1,
    tablesPerOutlet: 10,
    staffPerOutlet: 3,
    audience: "Food stalls, small cafés, kiosks and takeaway counters",
    includes: [
      "Digital menu and table QR codes",
      "QR table ordering for guests",
      "Order management with live status",
      "Kitchen display",
      "Table management and staff roles",
      "Restaurant-side order history",
      "Today's sales summary on your dashboard",
    ],
    support: "Standard support",
  },
  {
    key: "STARTER",
    name: "Pangat Starter",
    monthly: 1299,
    outlets: 1,
    tablesPerOutlet: 25,
    staffPerOutlet: 8,
    audience: "Cafés, bakeries, small restaurants and quick-service outlets",
    includes: [
      "Everything in Mini",
      "Room for more tables and a bigger team",
      "Order and sales reports for any date range",
      "GST, refunds, payment-method and order-type breakdowns",
      "Best-sellers and kitchen speed",
    ],
    support: "Standard support",
  },
  {
    key: "GROWTH",
    name: "Pangat Growth",
    monthly: 2499,
    outlets: 3,
    tablesPerOutlet: 60,
    staffPerOutlet: 20,
    audience: "Established restaurants and small restaurant groups",
    includes: [
      "Everything in Starter",
      "Inventory, ingredients and recipes",
      "Stock tracking with low-stock alerts",
      "Dishes marked sold out automatically when an ingredient runs out",
      "Manage up to 3 outlets from one login",
    ],
    support: "Priority support",
  },
  {
    key: "ENTERPRISE",
    name: "Pangat Enterprise",
    monthly: 4999,
    outlets: 5,
    tablesPerOutlet: 100,
    staffPerOutlet: 40,
    audience: "Restaurant chains, franchises and larger hospitality businesses",
    includes: [
      "Everything in Growth",
      "5 outlets included, each with its own tables, staff and reports",
      "Additional outlets by agreement",
      "Onboarding arranged with our team",
    ],
    support: "Priority support and a dedicated Pangat contact",
    enquiry: true,
  },
]

/** Annual price: exactly ten times the monthly price. */
export const annualPrice = (monthly: number) => monthly * 10
/** What annual saves against twelve monthly payments: exactly two months. */
export const annualSaving = (monthly: number) => monthly * 12 - annualPrice(monthly)

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

export const GST_NOTE = "All prices exclude GST. GST is charged additionally at the applicable rate and shown on your invoice, so the amount you pay is higher than the price displayed."
export const TRIAL_NOTE = "Every new restaurant starts with a 14-day free trial: no card needed, one outlet and up to 20 tables."

/** Founding 10: the original launch offer. Written and tested, but NOT shown until the founders can fulfil it and approve publishing. */
export const FOUNDING_10_PUBLISHED = false
export const FOUNDING_10 = {
  title: "Founding 10 · Pune",
  intro: "We are working with our first ten restaurant partners in Pune.",
  perks: [
    "A 14-day free trial",
    "20% off your first 12 paid months, under a written 12-month price-lock agreement",
    "Free assisted onboarding",
    "Free digital QR design",
    "A direct line to the founders for feedback",
    "Priority consideration for feature requests",
  ],
  fineprint: "The discount applies to your first 12 paid months only; after that the then-current list price applies. Limited to the first ten restaurants, by agreement with our team.",
}
