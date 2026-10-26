import * as React from 'react'
import { Button } from '@/components/ui/button'
import { X, KeyRound, Copy, Check, Send } from 'lucide-react'

interface ResetPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    ownerName: string
    ownerEmail: string
    temporaryPassword: string
    organizationName: string
  } | null
}

export function ResetPasswordModal({ isOpen, onClose, data }: ResetPasswordModalProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)

  if (!isOpen || !data) return null

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const waMessage = `Namaskar ${data.ownerName}! 🙏\nYour Pangat access credentials for *${data.organizationName}* have been reset by platform operations.\n\n🌐 Login: ${window.location.origin}/login\n✉️ Email: ${data.ownerEmail}\n🔑 New Access Code: ${data.temporaryPassword}\n\nPlease change your password upon signing in.`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 text-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Temporary Access Code Generated</h3>
              <p className="text-[11px] text-zinc-400">{data.organizationName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Merchant Super Owner:</span>
              <span className="font-semibold text-white">{data.ownerName}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Login Email:</span>
              <span className="font-mono text-zinc-200">{data.ownerEmail}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                6-Digit Temporary Access Code
              </span>
              <span className="text-lg font-mono font-bold text-white tracking-widest">
                {data.temporaryPassword}
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => handleCopy(data.temporaryPassword, 'pwd')}
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs h-8 px-3"
            >
              {copiedKey === 'pwd' ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1 text-zinc-950" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-zinc-400 font-medium">WhatsApp Dispatch Text:</span>
              <button
                type="button"
                onClick={() => handleCopy(waMessage, 'wa')}
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'wa' ? <Check className="w-3 h-3 text-emerald-400" /> : <Send className="w-3 h-3" />}
                <span>Copy WhatsApp Message</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
              {waMessage}
            </pre>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}
