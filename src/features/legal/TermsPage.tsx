import { Link } from 'react-router'
import { LegalLayout, Section, ul } from './LegalLayout'
import { useCompliance } from './usePlatformConfig'

export function TermsPage() {
  const c = useCompliance()
  return (
    <LegalLayout title="Terms of Service" updated={new Date(c.policyVersion).toLocaleDateString('en-IN', { dateStyle: 'long' })}>
      <p>
        These terms are the agreement between <strong className="text-white">{c.legalName}</strong>{c.registeredAddress ? ` (${c.registeredAddress})` : ''} (&ldquo;Pangat&rdquo;, &ldquo;we&rdquo;) and the restaurant or person using Pangat (&ldquo;you&rdquo;). By creating an account or using Pangat you agree to them. If you do not agree, please do not use the service.
      </p>

      <Section title="What Pangat is">
        <p>Pangat is software for restaurants: guest ordering by QR code, a kitchen display, tables, menu, stock, reports and a billing record. Pangat is a tool. The restaurant is the seller of food to its guests and is responsible for its food, prices, licences and taxes.</p>
      </Section>

      <Section title="Your account">
        <ul className={ul}>
          <li>Give accurate details and keep them current. The owner is responsible for everything done through the restaurant&rsquo;s accounts.</li>
          <li>Keep passwords and kitchen PINs private. Give each team member their own account. Tell us at once if you think an account was misused.</li>
          <li>Only add people who work for you, and remove them when they leave.</li>
        </ul>
      </Section>

      <Section title="Rules of use">
        <ul className={ul}>
          <li>Follow the law, including food-safety (FSSAI), tax (GST) and consumer rules. Print your licence and tax details on bills as the law requires.</li>
          <li>Do not try to break, overload or get around the security of Pangat, or access another restaurant&rsquo;s data.</li>
          <li>Do not use Pangat to send spam or unlawful content.</li>
        </ul>
        <p>We may suspend an account that breaks these rules or puts others at risk, and we will say why.</p>
      </Section>

      <Section title="Your data, and ours as your processor">
        <p>Your restaurant data (menu, orders, guests, staff) belongs to you. We process it only to run Pangat for you and to keep it safe, under these terms and our <Link to="/privacy" className="text-emerald-300 hover:underline">Privacy Policy</Link>. In data-protection terms you are the data fiduciary for your guests&rsquo; details and Pangat is your processor. In particular we will:</p>
        <ul className={ul}>
          <li>use guest personal data only on your behalf and not for our own purposes;</li>
          <li>protect it with the safeguards described in the Privacy Policy, and tell you without undue delay if we learn of a breach affecting it;</li>
          <li>help you answer guests who ask to see, correct or erase their data (see your restaurant&rsquo;s Settings and our privacy request process);</li>
          <li>give you a copy of your data on request, and delete it when you leave, except what the law requires us to keep.</li>
        </ul>
        <p>You must tell your guests how you use their details and collect their agreement. Pangat shows a privacy notice at checkout for this purpose.</p>
        <p>Our staff may open your restaurant&rsquo;s data to give support or fix problems. Each time they do, it is recorded and you can see it in Settings → Activity.</p>
      </Section>

      <Section title="Payments and subscriptions">
        <ul className={ul}>
          <li>Guest payments by UPI go directly to the UPI ID you set. Pangat does not hold your guests&rsquo; money and takes no commission on food orders.</li>
          <li>Subscriptions are charged in advance for the period you choose, plus GST, through our payment provider. Free trials and plan limits are shown at sign-up.</li>
          <li>If a subscription lapses, the service moves to a limited mode after a short grace period; your data is kept so you can come back.</li>
          <li>Fees already paid are not refunded unless the law requires it or we say otherwise in writing.</li>
        </ul>
      </Section>

      <Section title="Bills and tax records">
        <p>Pangat helps you record bills, tax and refunds. You remain responsible for the accuracy of your tax details, rates and filings, and for keeping records for the period the law requires. Check your settings (GSTIN, tax rate, licence number) before you start billing.</p>
      </Section>

      <Section title="Availability and changes">
        <p>We work to keep Pangat available but do not promise it will never be interrupted. We may update features and will give notice of changes that matter. We may add, change or end features, and will try to give reasonable notice if a change affects you.</p>
      </Section>

      <Section title="Our responsibility">
        <p>To the extent the law allows, Pangat is provided &ldquo;as is&rdquo;. We are not liable for indirect or consequential loss, or for loss caused by things outside our control. Our total liability for any claim is limited to the fees you paid us in the 12 months before the claim. Nothing here limits liability that cannot lawfully be limited.</p>
      </Section>

      <Section title="Ending the agreement">
        <p>You may stop using Pangat at any time and ask us to export and delete your data. We may end or suspend the service if you break these terms or do not pay. Clauses that by their nature should continue (data handling, liability, disputes) continue after the agreement ends.</p>
      </Section>

      <Section title="Governing law and disputes">
        <p>These terms are governed by the laws of India. {c.jurisdictionCity ? `Courts at ${c.jurisdictionCity} have exclusive jurisdiction over disputes.` : 'The courts in India that have jurisdiction will hear disputes.'} Please contact us first so we can try to settle it.</p>
      </Section>

      <Section title="Contact">
        <p>Questions about these terms: write to {c.grievanceOfficer.email ? <a className="text-emerald-300 hover:underline" href={`mailto:${c.grievanceOfficer.email}`}>{c.grievanceOfficer.email}</a> : 'us through the privacy request form'}. For data questions, our grievance officer is {c.grievanceOfficer.name}; see the <Link to="/privacy#officer" className="text-emerald-300 hover:underline">Privacy Policy</Link>.</p>
      </Section>
    </LegalLayout>
  )
}
