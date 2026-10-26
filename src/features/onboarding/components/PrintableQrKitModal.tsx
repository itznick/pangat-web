import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Printer, X, Sparkles } from 'lucide-react'
import { PangatLogo } from '@/components/ui/PangatLogo'
import { QrCodeImage } from '@/components/ui/QrCodeImage'

interface PrintableQrKitModalProps {
  open: boolean
  onClose: () => void
  brandName: string
  outletName: string
  slug: string
  indoorTables: string[]
  outdoorTables: string[]
  upiVpa?: string
}

export function PrintableQrKitModal({
  open,
  onClose,
  brandName,
  outletName,
  slug,
  indoorTables,
  outdoorTables,
  upiVpa = '',
}: PrintableQrKitModalProps) {
  const allTables = [
    ...indoorTables.map((t) => ({ number: t, section: 'Indoor Hall' })),
    ...outdoorTables.map((t) => ({ number: t, section: 'Outdoor Garden / Veranda' })),
  ]

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800 text-white p-6 sm:p-8">
        <DialogHeader className="flex flex-row items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                PRINTABLE LAUNCH KIT
              </span>
              <span className="text-xs text-zinc-400">· {allTables.length} Custom Acrylic Cards</span>
            </div>
            <DialogTitle className="text-xl font-bold text-white mt-1">
              Table Standee & QR Kit Preview
            </DialogTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2 shadow-lg shadow-emerald-950"
            >
              <Printer className="w-4 h-4" />
              <span>Print All Cards</span>
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        {/* Printable Standee Grid */}
        <div className="py-6">
          <p className="text-xs text-zinc-400 mb-4">
            Each card is calibrated for standard 4x6" or 5x7" acrylic tent standees. Print double-sided or fold across the center line.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
            {allTables.map((table) => {
              // Generate standard SVG QR representation
              return (
                <div
                  key={table.number}
                  className="rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-900 p-6 flex flex-col items-center text-center shadow-xl relative overflow-hidden print:border-zinc-800 print:shadow-none"
                >
                  {/* Traditional Toran Header accent */}
                  <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500" />

                  {/* Header Logo */}
                  <div className="flex items-center gap-2 mt-2 mb-3">
                    <PangatLogo size="sm" />
                    <span className="text-sm font-bold tracking-tight text-white font-heading">
                      {brandName || 'Pangat'}
                    </span>
                    <span className="text-[10px] font-serif font-bold text-amber-300 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-500/30">
                      पंगत
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 mb-4 font-medium">
                    {outletName || 'Outlet Branch'} · {table.section}
                  </p>

                  {/* Real Scannable High-Res QR Code */}
                  <div className="w-44 h-44 rounded-2xl bg-white p-2.5 flex items-center justify-center shadow-2xl relative group">
                    <QrCodeImage
                      value={typeof window !== 'undefined' ? `${window.location.origin}/r/${slug}/t/${table.number}` : `/r/${slug}/t/${table.number}`}
                      size={160}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Table Badge */}
                  <div className="mt-5 mb-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-sm tracking-wide shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Table {table.number}</span>
                  </div>

                  {/* Customer Call to action */}
                  <h4 className="text-xs font-semibold text-zinc-200 mt-1">
                    Scan with any UPI / Camera App
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 max-w-[200px]">
                    No app download needed · View live menu & pay instantly
                  </p>
                  <p className="text-[9px] font-mono text-zinc-500 mt-1">
                    pangat.in/r/{slug}/t/{table.number}
                  </p>

                  <div className="mt-3 pt-3 border-t border-zinc-800/80 w-full flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="font-mono text-zinc-400">UPI: {upiVpa}</span>
                    <span className="text-emerald-400 font-semibold">Zero Commission</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
