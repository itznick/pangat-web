import { Link } from 'react-router'

/** The tick people give before we collect their details. The same words are stored by version on the server. */
export function ConsentCheckbox({ checked, onChange, purpose }: { checked: boolean; onChange: (v: boolean) => void; purpose: string }) {
  return (
    <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-zinc-400">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-500" />
      <span>
        I have read the{' '}
        <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-emerald-300 underline-offset-2 hover:underline">Privacy Notice</Link>{' '}
        and agree that my details are used {purpose}. I can withdraw this any time.
      </span>
    </label>
  )
}
