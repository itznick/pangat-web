import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { PangatLogo } from '@/components/ui/PangatLogo'
import '@/features/landing/landing.css'

/** Shared frame for the Privacy Policy and Terms: readable, dark like the rest of the public site. */
export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <div className="lp min-h-screen">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-6 sm:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <PangatLogo size="sm" />
          <span className="font-heading text-xl font-semibold tracking-tight text-white">Pangat</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 transition-colors hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
      </header>
      <main className="mx-auto max-w-3xl px-5 pb-24 sm:px-8">
        <h1 className="lp-display text-[2.2rem] text-white sm:text-[3rem]">{title}</h1>
        <p className="mt-2 text-[13px] text-zinc-500">Last updated {updated}</p>
        <div className="mt-10 space-y-10 text-[15px] leading-relaxed text-zinc-300">{children}</div>
        <nav className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/[0.08] pt-6 text-[13px] text-zinc-500" aria-label="Legal">
          <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          <Link to="/privacy#request" className="hover:text-white">Your data rights</Link>
        </nav>
      </main>
    </div>
  )
}

export function Section({ id, title, children }: { id?: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="font-heading text-[1.25rem] font-semibold text-white">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  )
}

export const ul = 'list-disc space-y-1.5 pl-5 marker:text-zinc-600'
