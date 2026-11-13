import * as React from "react"
import { AlertCircle, Bell, Building2, CheckCircle2, Clock, Loader2, Lock, Receipt, Store } from "lucide-react"
import { useAdminStore } from "@/stores/useAdminStore"
import { useAuthStore } from "@/stores/useAuthStore"
import { cn } from "@/lib/utils"
import type { DayKey, OutletOperations } from "@/types/domain"
import { DAY_ORDER, HHMM, resolveOps } from "../settings/operations"
import "@/features/landing/landing.css"

type SectionId = "profile" | "ordering" | "channels" | "tax" | "kitchen"

const SECTIONS: { id: SectionId; label: string; hint: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Outlet profile", hint: "Name and contact", icon: Building2 },
  { id: "ordering", label: "Ordering & hours", hint: "Pause, open hours, prep time", icon: Clock },
  { id: "channels", label: "Order types & payments", hint: "How guests order and pay", icon: Store },
  { id: "tax", label: "Tax & receipts", hint: "GST, UPI and invoice text", icon: Receipt },
  { id: "kitchen", label: "Kitchen & stock", hint: "Alerts and auto-deduction", icon: Bell },
]

interface Form {
  name: string
  branchArea: string
  phone: string
  email: string
  gstin: string
  gstPercentage: number
  hsnSac: string
  upiVpa: string
  isVegOnly: boolean
  kdsNewOrderAlert: boolean
  orderReadyChime: boolean
  outOfStockNotification: boolean
  autoDeductInventory: boolean
  ops: OutletOperations
}

const GSTIN_RE = /^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z\d]Z[A-Z\d]$/

function fromRestaurant(r: ReturnType<typeof useAdminStore.getState>["restaurant"]): Form {
  return {
    name: r.name || "",
    branchArea: r.branchArea || "",
    phone: r.phone || "",
    email: r.email || "",
    gstin: r.gstin || "",
    gstPercentage: r.gstPercentage ?? 5,
    hsnSac: r.hsnSac || "",
    upiVpa: r.upiVpa || "",
    isVegOnly: r.isVegOnly ?? false,
    kdsNewOrderAlert: r.kdsNewOrderAlert ?? true,
    orderReadyChime: r.orderReadyChime ?? true,
    outOfStockNotification: r.outOfStockNotification ?? true,
    autoDeductInventory: r.autoDeductInventory ?? true,
    ops: resolveOps(r.operations),
  }
}

export function AdminSettingsPage({ embedded = false }: { embedded?: boolean } = {}) {
  const restaurant = useAdminStore((s) => s.restaurant)
  const updateSettings = useAdminStore((s) => s.updateSettings)
  const user = useAuthStore((s) => s.user)
  const outletSlug = useAuthStore((s) => s.currentOutlet?.slug)
  const isOwner = !user?.role || user?.role === "SUPER_OWNER"

  const [section, setSection] = React.useState<SectionId>("profile")
  const [form, setForm] = React.useState<Form>(() => fromRestaurant(restaurant))
  const baseline = React.useRef(JSON.stringify(fromRestaurant(restaurant)))
  const [saving, setSaving] = React.useState(false)
  const [status, setStatus] = React.useState<"idle" | "saved" | "error">("idle")
  const [error, setError] = React.useState<string | null>(null)

  // Re-sync when the outlet (or a successful save) changes the source of truth, unless the user is mid-edit
  React.useEffect(() => {
    const fresh = fromRestaurant(restaurant)
    const freshJson = JSON.stringify(fresh)
    if (JSON.stringify(form) === baseline.current) setForm(fresh)
    baseline.current = freshJson
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurant])

  const dirty = JSON.stringify(form) !== baseline.current
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }))
  const setOps = (patch: Partial<OutletOperations>) => setForm((f) => ({ ...f, ops: { ...f.ops, ...patch } }))

  // Validation
  const problems = React.useMemo(() => {
    const p: Record<string, string> = {}
    if (form.name.trim().length < 2) p.name = "Enter the outlet name"
    if (form.gstin && !GSTIN_RE.test(form.gstin.trim().toUpperCase())) p.gstin = "GSTIN should be 15 characters, like 27AAAAA0000A1Z5"
    if (form.gstPercentage < 0 || form.gstPercentage > 28) p.gst = "Enter a rate between 0 and 28"
    if (!Object.values(form.ops.orderTypes).some(Boolean)) p.types = "Keep at least one order type on"
    if (!Object.values(form.ops.payments).some(Boolean)) p.payments = "Keep at least one payment method on"
    for (const { key, short } of DAY_ORDER) {
      const h = form.ops.hours[key]
      if (!h.closed && (!HHMM.test(h.open) || !HHMM.test(h.close) || h.open === h.close)) p[`hours-${key}`] = `${short}: check the opening and closing time`
    }
    if (form.ops.avgPrepMinutes < 1 || form.ops.avgPrepMinutes > 180) p.prep = "Prep time must be 1 to 180 minutes"
    return p
  }, [form])
  const firstProblem = Object.values(problems)[0]

  const save = async () => {
    if (firstProblem) {
      setStatus("error")
      setError(firstProblem)
      return
    }
    setSaving(true)
    setStatus("idle")
    setError(null)
    try {
      await updateSettings(
        {
          name: form.name.trim(),
          branchArea: form.branchArea.trim() || undefined,
          phone: form.phone.trim(),
          email: form.email.trim(),
          gstin: form.gstin.trim().toUpperCase(),
          hsnSac: form.hsnSac.trim(),
          gstPercentage: Number(form.gstPercentage),
          isVegOnly: form.isVegOnly,
          kdsNewOrderAlert: form.kdsNewOrderAlert,
          orderReadyChime: form.orderReadyChime,
          outOfStockNotification: form.outOfStockNotification,
          autoDeductInventory: form.autoDeductInventory,
          ...(isOwner ? { upiVpa: form.upiVpa.trim() } : {}),
          operations: form.ops,
        },
        outletSlug
      )
      setStatus("saved")
      setTimeout(() => setStatus("idle"), 3500)
    } catch (e) {
      setStatus("error")
      setError(e instanceof Error ? e.message : "Couldn’t save your changes")
    } finally {
      setSaving(false)
    }
  }

  const discard = () => {
    setForm(fromRestaurant(restaurant))
    setStatus("idle")
    setError(null)
  }

  const ops = form.ops

  return (
    <div className={cn("lp text-zinc-100", embedded ? "" : "mx-auto w-full max-w-[1080px] !bg-transparent px-4 pt-8 sm:px-8")}>
      {!embedded && (
        <div className="mb-7">
          <h1 className="text-[1.75rem]">Settings</h1>
          <p className="mt-1.5 text-sm text-zinc-500">How {form.name || "your outlet"} runs: hours, ordering, payments, tax and the kitchen.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[210px_minmax(0,1fr)] md:gap-8">
        {/* Section nav */}
        <nav aria-label="Settings sections" className="md:sticky md:top-2 md:self-start">
          <div className="lp-noscroll -mx-1 flex gap-1 overflow-x-auto px-1 pb-1 md:flex-col md:overflow-visible md:pb-0">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              const on = section === s.id
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  aria-current={on ? "page" : undefined}
                  className={cn(
                    "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors md:w-full",
                    on ? "bg-white/[0.08] font-medium text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", on ? "text-emerald-400" : "text-zinc-500")} />
                  <span className="whitespace-nowrap">{s.label}</span>
                </button>
              )
            })}
          </div>
        </nav>

        {/* Panel */}
        <div className="min-w-0 space-y-6">
          {section === "profile" && (
            <Card title="Outlet profile" desc="What guests and your team see.">
              <Field label="Outlet name" error={problems.name}>
                <Input value={form.name} onChange={(v) => set("name", v)} />
              </Field>
              <Field label="Area / branch" optional hint="Shown next to the name, e.g. Koregaon Park.">
                <Input value={form.branchArea} onChange={(v) => set("branchArea", v)} placeholder="Koregaon Park, Pune" />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Phone" optional><Input value={form.phone} onChange={(v) => set("phone", v)} inputMode="tel" /></Field>
                <Field label="Email" optional><Input value={form.email} onChange={(v) => set("email", v)} type="email" /></Field>
              </div>
            </Card>
          )}

          {section === "ordering" && (
            <>
              <Card title="Accepting orders" desc="Pause ordering instantly, for example when the kitchen is overwhelmed or you are closing early.">
                <Switch
                  checked={ops.acceptingOrders}
                  onChange={(v) => setOps({ acceptingOrders: v })}
                  label={ops.acceptingOrders ? "Taking orders" : "Ordering is paused"}
                  desc={ops.acceptingOrders ? "Guests can place orders from their table." : "Guests see your message and cannot place new orders. Existing orders are not affected."}
                  tone={ops.acceptingOrders ? "good" : "warn"}
                />
                {!ops.acceptingOrders && (
                  <Field label="Message to guests" optional hint="Shown on the menu while paused.">
                    <Input value={ops.pausedMessage} onChange={(v) => setOps({ pausedMessage: v })} placeholder="The kitchen is catching up. Please ask our staff to order." maxLength={200} />
                  </Field>
                )}
                <Field label="Typical prep time" error={problems.prep} hint="Shown to guests when they track their order.">
                  <div className="flex items-center gap-2">
                    <Input value={String(ops.avgPrepMinutes)} onChange={(v) => setOps({ avgPrepMinutes: Number(v.replace(/\D/g, "")) || 0 })} inputMode="numeric" className="!w-24 text-center" />
                    <span className="text-sm text-zinc-500">minutes</span>
                  </div>
                </Field>
              </Card>

              <Card title="Opening hours" desc="Your weekly schedule. Times are in India Standard Time; a closing time earlier than opening means the shift runs past midnight.">
                <Switch
                  checked={ops.enforceHours}
                  onChange={(v) => setOps({ enforceHours: v })}
                  label="Only accept orders during opening hours"
                  desc={ops.enforceHours ? "Orders outside these hours are blocked automatically." : "Hours are shown for information only; guests can order any time."}
                />
                <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.08]">
                  {DAY_ORDER.map(({ key, label }) => {
                    const h = ops.hours[key]
                    const bad = Boolean(problems[`hours-${key}`])
                    const upd = (patch: Partial<typeof h>) => setOps({ hours: { ...ops.hours, [key]: { ...h, ...patch } } as OutletOperations["hours"] })
                    return (
                      <div key={key} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
                        <span className="w-24 text-[13.5px] text-zinc-300">{label}</span>
                        <label className="flex items-center gap-2 text-xs text-zinc-500">
                          <input type="checkbox" checked={!h.closed} onChange={(e) => upd({ closed: !e.target.checked })} className="h-4 w-4 accent-emerald-500" aria-label={`${label} open`} />
                          {h.closed ? "Closed" : "Open"}
                        </label>
                        {!h.closed && (
                          <div className="ml-auto flex items-center gap-2">
                            <input type="time" value={h.open} onChange={(e) => upd({ open: e.target.value })} aria-label={`${label} opens`} className={cn("h-9 rounded-lg border bg-white/[0.04] px-2 text-sm text-white outline-none focus:border-emerald-400/50", bad ? "border-rose-400/50" : "border-white/10")} />
                            <span className="text-zinc-600">to</span>
                            <input type="time" value={h.close} onChange={(e) => upd({ close: e.target.value })} aria-label={`${label} closes`} className={cn("h-9 rounded-lg border bg-white/[0.04] px-2 text-sm text-white outline-none focus:border-emerald-400/50", bad ? "border-rose-400/50" : "border-white/10")} />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const m = ops.hours.mon
                    setOps({ hours: Object.fromEntries(DAY_ORDER.map(({ key }) => [key, { ...m }])) as Record<DayKey, typeof m> })
                  }}
                  className="text-[13px] text-emerald-300 underline-offset-4 hover:underline"
                >
                  Copy Monday’s hours to every day
                </button>
              </Card>
            </>
          )}

          {section === "channels" && (
            <>
              <Card title="Order types" desc="Choose how guests can order from you." error={problems.types}>
                <Switch checked={ops.orderTypes.dineIn} onChange={(v) => setOps({ orderTypes: { ...ops.orderTypes, dineIn: v } })} label="Dine-in" desc="Scan the table QR, order and pay from the seat." />
                <Switch checked={ops.orderTypes.takeaway} onChange={(v) => setOps({ orderTypes: { ...ops.orderTypes, takeaway: v } })} label="Takeaway" desc="Guests order ahead and collect at the counter." />
                <Switch checked={ops.orderTypes.delivery} onChange={(v) => setOps({ orderTypes: { ...ops.orderTypes, delivery: v } })} label="Delivery" desc="Orders delivered to an address you serve." />
              </Card>
              <Card title="Payment methods" desc="Guests only see the methods you leave on." error={problems.payments}>
                <Switch checked={ops.payments.upi} onChange={(v) => setOps({ payments: { ...ops.payments, upi: v } })} label="UPI (pay now)" desc="Google Pay, PhonePe, Paytm and CRED, straight to your bank." />
                <Switch checked={ops.payments.payAtCounter} onChange={(v) => setOps({ payments: { ...ops.payments, payAtCounter: v } })} label="Pay at counter" desc="For dine-in and takeaway guests who prefer to pay staff." />
                <Switch checked={ops.payments.cod} onChange={(v) => setOps({ payments: { ...ops.payments, cod: v } })} label="Cash on delivery" desc="Collected by your rider on delivery orders." />
              </Card>
              <Card title="Menu rules">
                <Switch checked={form.isVegOnly} onChange={(v) => set("isVegOnly", v)} label="Pure vegetarian outlet" desc="Hides non-veg dishes from guests and from new menu items." />
              </Card>
            </>
          )}

          {section === "tax" && (
            <>
              <Card title="GST" desc="Applied to every guest bill and printed on receipts.">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_140px]">
                  <Field label="GSTIN" optional error={problems.gstin}><Input value={form.gstin} onChange={(v) => set("gstin", v.toUpperCase())} className="font-mono uppercase" maxLength={15} placeholder="27AAAAA0000A1Z5" /></Field>
                  <Field label="GST rate (%)" error={problems.gst}><Input value={String(form.gstPercentage)} onChange={(v) => set("gstPercentage", Number(v.replace(/[^\d.]/g, "")) || 0)} inputMode="decimal" /></Field>
                </div>
                <Field label="HSN / SAC code" optional hint="9963 is the usual code for restaurant services."><Input value={form.hsnSac} onChange={(v) => set("hsnSac", v)} className="!w-40 font-mono" maxLength={10} /></Field>
              </Card>
              <Card title="Settlement" desc="Where guest payments land.">
                <Field label="UPI ID" hint={isOwner ? "Guests pay this ID directly. Pangat takes no commission." : "Only the owner can change the settlement account."}>
                  <div className="relative">
                    <Input value={form.upiVpa} onChange={(v) => set("upiVpa", v)} disabled={!isOwner} className="font-mono" autoCapitalize="none" />
                    {!isOwner && <Lock className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />}
                  </div>
                </Field>
              </Card>
              <Card title="Receipts" desc="Printed at the bottom of every customer receipt.">
                <Field label="Footer message" optional hint="e.g. Thank you for dining with us. Follow us @yourcafe.">
                  <textarea value={ops.receiptFooter} onChange={(e) => setOps({ receiptFooter: e.target.value })} maxLength={240} rows={3} className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-[15px] text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400/50" placeholder="Thank you for dining with us!" />
                  <p className="mt-1 text-right text-xs text-zinc-600">{ops.receiptFooter.length}/240</p>
                </Field>
              </Card>
            </>
          )}

          {section === "kitchen" && (
            <>
              <Card title="Kitchen alerts" desc="What the kitchen screen does when things happen.">
                <Switch checked={form.kdsNewOrderAlert} onChange={(v) => set("kdsNewOrderAlert", v)} label="Chime on new orders" desc="Plays a sound on the kitchen display when an order is paid." />
                <Switch checked={form.orderReadyChime} onChange={(v) => set("orderReadyChime", v)} label="Chime when an order is ready" desc="Alerts front-of-house to collect a finished order." />
                <Switch checked={form.outOfStockNotification} onChange={(v) => set("outOfStockNotification", v)} label="Out-of-stock alerts" desc="Notifies the team when an item is marked sold out." />
              </Card>
              <Card title="Inventory" desc="Keep stock counts honest without extra work.">
                <Switch checked={form.autoDeductInventory} onChange={(v) => set("autoDeductInventory", v)} label="Deduct ingredients automatically" desc="Each order reduces stock using the dish’s recipe." />
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Save bar: only when there is something to save */}
      <div
        className={cn(
          "z-20 flex items-center justify-between gap-3 border-t border-white/[0.07] bg-[#0c0c0f]/95 px-5 py-3.5 backdrop-blur-xl transition-all duration-300",
          embedded ? "sticky -bottom-6 -mx-6 mt-6 -mb-6 sm:-bottom-8 sm:-mx-8 sm:-mb-8 sm:px-8" : "sticky bottom-0 -mx-4 mt-8 sm:-mx-8 sm:px-8",
          dirty || status !== "idle" ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0"
        )}
        role="status"
      >
        <div className="flex min-w-0 items-center gap-2 text-sm">
          {status === "saved" ? (
            <span className="flex items-center gap-2 text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Settings saved</span>
          ) : status === "error" ? (
            <span className="flex min-w-0 items-center gap-2 text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" /> <span className="truncate">{error}</span></span>
          ) : (
            <span className="flex items-center gap-2 text-zinc-300"><span className="h-2 w-2 rounded-full bg-amber-300" /> Unsaved changes</span>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={discard} disabled={!dirty || saving} className="lp-btn lp-btn-ghost !h-10 !px-4 !text-sm disabled:opacity-40">Discard</button>
          <button onClick={() => void save()} disabled={!dirty || saving} className="lp-btn lp-btn-primary !h-10 !px-5 !text-sm disabled:opacity-50">
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  )
}

function Card({ title, desc, error, children }: { title: string; desc?: string; error?: string; children: React.ReactNode }) {
  return (
    <section className="console-card rounded-2xl p-5 sm:p-6">
      <h2 className="font-heading text-[1.05rem] font-semibold text-white">{title}</h2>
      {desc && <p className="mt-1 max-w-[56ch] text-[13.5px] leading-relaxed text-zinc-500">{desc}</p>}
      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

function Field({ label, hint, error, optional, children }: { label: string; hint?: string; error?: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] text-zinc-300">
        <span>{label}</span>
        {optional && <span className="text-xs text-zinc-600">Optional</span>}
      </span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-rose-300">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-zinc-500">{hint}</span> : null}
    </label>
  )
}

function Input({ value, onChange, className, ...rest }: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-[15px] text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-400/15 disabled:opacity-50", className)}
      {...rest}
    />
  )
}

function Switch({ checked, onChange, label, desc, tone }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string; tone?: "good" | "warn" }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-start justify-between gap-5 text-left">
      <span className="min-w-0">
        <span className={cn("block text-[14.5px] font-medium", tone === "warn" ? "text-amber-200" : "text-white")}>{label}</span>
        {desc && <span className="mt-0.5 block text-[13px] leading-relaxed text-zinc-500">{desc}</span>}
      </span>
      <span className={cn("relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors", checked ? (tone === "warn" ? "bg-amber-400" : "bg-emerald-500") : "bg-white/15")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all", checked ? "left-[22px]" : "left-0.5")} />
      </span>
    </button>
  )
}
