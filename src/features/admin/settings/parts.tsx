import * as React from "react"
import { cn } from "@/lib/utils"

export function Card({ title, desc, error, children }: { title: string; desc?: string; error?: string; children: React.ReactNode }) {
  return (
    <section className="console-card rounded-2xl p-5 sm:p-6">
      <h2 className="font-heading text-[1.05rem] font-semibold text-white">{title}</h2>
      {desc && <p className="mt-1 max-w-[56ch] text-[13.5px] leading-relaxed text-zinc-500">{desc}</p>}
      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-300">{error}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  )
}

export function Field({ label, hint, error, optional, children }: { label: string; hint?: string; error?: string; optional?: boolean; children: React.ReactNode }) {
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

export function Input({ value, onChange, className, ...rest }: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn("h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-[15px] text-white outline-none transition-colors placeholder:text-zinc-600 focus:border-emerald-400/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-emerald-400/15 disabled:opacity-50", className)}
      {...rest}
    />
  )
}

export function Switch({ checked, onChange, label, desc, tone }: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string; tone?: "good" | "warn" }) {
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
