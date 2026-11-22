import { useState } from 'react'
import { Link } from 'react-router'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { api, errMsg } from '@/lib/api'
import { LegalLayout, Section, ul } from './LegalLayout'
import { useCompliance } from './usePlatformConfig'

const KINDS = [
  { v: 'ACCESS', l: 'I want to see the data you hold about me' },
  { v: 'CORRECTION', l: 'I want to correct my data' },
  { v: 'ERASURE', l: 'I want my data erased' },
  { v: 'WITHDRAW_CONSENT', l: 'I want to withdraw my consent' },
  { v: 'GRIEVANCE', l: 'I have a complaint' },
  { v: 'NOMINATE', l: 'I want to nominate someone to act for me' },
] as const

const field = 'h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 text-[15px] text-white placeholder:text-zinc-600 outline-none focus:border-emerald-400/60'

export function PrivacyPage() {
  const c = useCompliance()
  const officer = c.grievanceOfficer
  return (
    <LegalLayout title="Privacy Policy" updated={`${new Date(c.policyVersion).toLocaleDateString('en-IN', { dateStyle: 'long' })} (version ${c.policyVersion})`}>
      <p>
        This policy explains what personal information Pangat handles, why, who sees it, how long we keep it, and how you can control it. We follow India&rsquo;s Digital Personal Data Protection Act, 2023 and the rules made under it. We try to write this in plain language. If anything is unclear, ask us (see &ldquo;Contact the grievance officer&rdquo; below).
      </p>

      <Section title="Who is responsible for your data">
        <p>Pangat is a software service run by <strong className="text-white">{c.legalName}</strong>{c.registeredAddress ? `, ${c.registeredAddress}` : ''}. There are two situations:</p>
        <ul className={ul}>
          <li><strong className="text-white">You order food at a restaurant that uses Pangat.</strong> The restaurant decides why your name or phone number is collected (to prepare, serve and bill your order). Pangat stores and processes it for the restaurant, under the restaurant&rsquo;s instructions.</li>
          <li><strong className="text-white">You are a restaurant owner or team member, or you ask us for a demo.</strong> Pangat decides how that information is used, and is responsible for it.</li>
        </ul>
      </Section>

      <Section title="What we collect and why">
        <ul className={ul}>
          <li><strong className="text-white">Diners:</strong> name, phone number and delivery address, only for takeaway and delivery orders and only to make that order happen; what you ordered and its price; optional feedback you write. Dine-in orders by table need none of your personal details.</li>
          <li><strong className="text-white">Restaurant owners and team:</strong> name, email, phone number, role, sign-in history (time, device, network address) and the actions you take in the console, which we keep as a security record.</li>
          <li><strong className="text-white">People who ask for a demo:</strong> name, restaurant name, phone number and city, so we can contact you about Pangat.</li>
          <li><strong className="text-white">Not collected:</strong> card numbers (payments go through the payment provider, or straight to the restaurant by UPI), contacts, location, or anything from your phone.</li>
        </ul>
        <p>We do not sell personal data and do not use it for advertising.</p>
      </Section>

      <Section title="Why we are allowed to use it">
        <p>We ask for your agreement (consent) before collecting personal details from a diner or demo requester, and keep a record of which version of this policy you saw and when. For staff accounts, we use your details to provide the service you or your employer signed up for and to keep the system secure. You can withdraw consent at any time (see your rights below).</p>
      </Section>

      <Section title="Who else sees it">
        <p>Only the companies that help us run Pangat, and only for that purpose:</p>
        <ul className={ul}>
          <li>Database and hosting providers (where the data is stored and the service runs)</li>
          <li>An email provider (to send sign-in codes, password links and notices)</li>
          <li>A payment provider (for restaurant subscriptions)</li>
        </ul>
        <p>The restaurant you ordered from sees your order and contact details. We may also disclose information when the law requires it. Some providers may store data outside India; we choose providers that protect it, and we do not send personal data to any country the Government of India restricts.</p>
      </Section>

      <Section title="How long we keep it">
        <ul className={ul}>
          <li>Diner contact details on finished orders: removed automatically after {c.dinerDataRetentionMonths > 0 ? `${c.dinerDataRetentionMonths} months` : 'the restaurant’s chosen period'}. The bill itself (items, amounts, tax) is kept because the restaurant must keep its tax records.</li>
          <li>Demo requests: removed after 18 months.</li>
          <li>Sign-in history: kept for one year as a security record.</li>
          <li>Accounts and audit records of staff actions: kept for as long as the restaurant uses Pangat and as the law requires, so that mistakes and misuse can be investigated.</li>
        </ul>
      </Section>

      <Section title="How we protect it">
        <p>Access to restaurant data is limited by role: a kitchen screen never receives customer phone numbers or payment details. Passwords are stored in a one-way, salted form. Connections are encrypted. Every sensitive action is recorded in an audit log that cannot be edited, and when Pangat staff open a restaurant&rsquo;s data, the restaurant owner can see it. If a breach affecting your data happens, we will tell the people affected and the authorities as the law requires.</p>
      </Section>

      <Section title="Your rights">
        <ul className={ul}>
          <li>Know what we hold about you, and get a summary of it.</li>
          <li>Correct or complete it.</li>
          <li>Have it erased once it is no longer needed.</li>
          <li>Withdraw your consent whenever you wish. Withdrawing does not undo what already happened.</li>
          <li>Complain to us, and if you are not satisfied, to the Data Protection Board of India.</li>
          <li>Nominate someone to exercise these rights for you if you die or cannot act.</li>
        </ul>
        <p>Use the form below or write to the grievance officer. We aim to answer within {c.responseDays} days. We may ask you to confirm who you are before we share or erase anything, to protect you from someone else asking in your name.</p>
      </Section>

      <Section title="Children">
        <p>Pangat is for restaurants and their customers. We do not knowingly collect personal data from anyone under 18. If you think a child gave us details, tell us and we will remove them.</p>
      </Section>

      <Section title="Cookies and local storage">
        <p>We use your browser&rsquo;s storage only for things the service needs: keeping you signed in, remembering your cart and your theme. We do not use advertising or tracking cookies.</p>
      </Section>

      <Section id="officer" title="Contact the grievance officer">
        <p>
          <strong className="text-white">{officer.name}</strong>, Grievance Officer, {c.legalName}
          {officer.email ? <> &middot; <a className="text-emerald-300 hover:underline" href={`mailto:${officer.email}`}>{officer.email}</a></> : null}
          {officer.phone ? <> &middot; <a className="text-emerald-300 hover:underline" href={`tel:${officer.phone}`}>{officer.phone}</a></> : null}
        </p>
        {!officer.email && <p className="text-zinc-400">Use the form below to reach the officer directly.</p>}
      </Section>

      <Section title="Changes to this policy">
        <p>When we change this policy in a way that affects you, we will update the date and version at the top and, where the change matters, tell you before it applies. Read our <Link to="/terms" className="text-emerald-300 hover:underline">Terms of Service</Link> too.</p>
      </Section>

      <RequestForm />
    </LegalLayout>
  )
}

function RequestForm() {
  const c = useCompliance()
  const [kind, setKind] = useState<(typeof KINDS)[number]['v']>('ACCESS')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [restaurant, setRestaurant] = useState('')
  const [message, setMessage] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [website, setWebsite] = useState('') // honeypot: real people never see or fill this
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<{ reference: string; dueDays: number } | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      setDone(await api.privacy.createRequest({ kind, name: name.trim(), contact: contact.trim(), restaurantRef: restaurant.trim() || undefined, message: message.trim() || undefined, confirm, website }))
    } catch (err) {
      setError(errMsg(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <section id="request" className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <h2 className="font-heading text-[1.25rem] font-semibold text-white">Make a request about your data</h2>
      <p className="mt-1 text-[13.5px] text-zinc-400">Goes to our grievance officer. We reply within {c.responseDays} days.</p>
      {done ? (
        <div role="status" className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-100">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">We received your request.</p>
            <p className="mt-1 text-[14px]">Your reference is <span className="font-mono font-semibold">{done.reference}</span>. Keep it to ask about progress. We will reply within {done.dueDays} days.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-[13px] text-zinc-400">What would you like to do?</span>
            <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className={field}>
              {KINDS.map((k) => <option key={k.v} value={k.v} className="bg-zinc-900">{k.l}</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-[13px] text-zinc-400">Your name</span><input value={name} onChange={(e) => setName(e.target.value)} className={field} required maxLength={120} autoComplete="name" /></label>
            <label className="block"><span className="mb-1.5 block text-[13px] text-zinc-400">Email or phone to reach you</span><input value={contact} onChange={(e) => setContact(e.target.value)} className={field} required maxLength={180} autoComplete="email" /></label>
          </div>
          <label className="block"><span className="mb-1.5 block text-[13px] text-zinc-400">Restaurant you dealt with (optional)</span><input value={restaurant} onChange={(e) => setRestaurant(e.target.value)} className={field} maxLength={120} /></label>
          <label className="block"><span className="mb-1.5 block text-[13px] text-zinc-400">Details (optional). For example the phone number or order you used.</span><textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={2000} className={`${field} h-auto py-3`} /></label>
          {/* honeypot */}
          <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} /></label></div>
          <label className="flex items-start gap-3 text-[13.5px] text-zinc-300">
            <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="mt-1 h-4 w-4 accent-emerald-500" />
            <span>The details I gave are correct, and I am asking about my own data (or I am allowed to ask on the person&rsquo;s behalf).</span>
          </label>
          {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[13px] text-rose-300"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
          <button type="submit" disabled={busy || !confirm || !name || !contact} className="lp-btn lp-btn-primary !h-12 disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : 'Send request'}
          </button>
        </form>
      )}
    </section>
  )
}
