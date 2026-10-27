import { useState, useEffect } from "react"
import QRCode from "qrcode"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { QrCode, Download, Printer, Copy, Check } from "lucide-react"

interface TableQrModalProps {
  open: boolean
  onClose: () => void
  tableNumber: string
  outletSlug: string
  outletName?: string
}

export function TableQrModal({
  open,
  onClose,
  tableNumber,
  outletSlug,
  outletName = "Pangat Dining",
}: TableQrModalProps) {
  const [dataUrl, setDataUrl] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const origin = typeof window !== "undefined" ? window.location.origin : "https://layerform.in"
  const qrUrl = `${origin}/r/${outletSlug}/t/${tableNumber}`

  useEffect(() => {
    if (!open) return
    // Generate high-resolution 1024x1024 PNG
    QRCode.toDataURL(qrUrl, {
      width: 1024,
      margin: 2,
      errorCorrectionLevel: "H",
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then(setDataUrl)
      .catch((err) => console.error("Failed to generate QR Code:", err))
  }, [open, qrUrl])

  const handleDownloadPng = () => {
    if (!dataUrl) return
    setDownloading(true)
    try {
      const a = document.createElement("a")
      a.href = dataUrl
      a.download = `${outletSlug}-table-${tableNumber}-qr-1024x1024.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } finally {
      setDownloading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md bg-zinc-950 border border-zinc-800 text-white p-0 overflow-hidden shadow-2xl">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .table-tent-print-area, .table-tent-print-area * {
              visibility: visible;
            }
            .table-tent-print-area {
              position: fixed;
              left: 0;
              top: 0;
              width: 4in;
              height: 6in;
              margin: 0;
              padding: 0.25in;
              box-sizing: border-box;
              background: white !important;
              color: black !important;
              border: 2px solid #000;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: space-between;
              text-align: center;
              page-break-inside: avoid;
            }
            .no-print {
              display: none !important;
            }
          }
        ` }} />

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-b from-zinc-900 to-zinc-950 border-b border-zinc-800 text-center relative no-print">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-white">Dynamic Table QR Code</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Table {tableNumber} • {outletName}
          </p>
        </div>

        {/* Printable 4x6 Acrylic Stand Template Preview */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="table-tent-print-area w-64 bg-white text-zinc-950 rounded-2xl p-4 shadow-xl border-2 border-zinc-300 flex flex-col items-center text-center space-y-3">
            {/* Table Tent Header */}
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-800">
                <span>🍃 PANGAT DINING</span>
              </div>
              <h3 className="text-xs font-semibold text-zinc-700 truncate max-w-[200px]">
                {outletName}
              </h3>
            </div>

            {/* Table Badge */}
            <div className="bg-zinc-900 text-white px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase">
              Table {tableNumber}
            </div>

            {/* High-Contrast QR Code */}
            <div className="p-2 bg-white rounded-xl border border-zinc-200 shadow-inner">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt={`QR for Table ${tableNumber}`}
                  className="w-44 h-44 object-contain"
                />
              ) : (
                <div className="w-44 h-44 bg-zinc-100 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              )}
            </div>

            {/* Instruction */}
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-zinc-900 leading-tight">
                Scan with Camera or Google Lens
              </p>
              <p className="text-[9px] text-zinc-500 leading-tight">
                Instant UPI Settlement · Direct Kitchen Fire
              </p>
            </div>
          </div>

          {/* Direct URL Bar */}
          <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs no-print">
            <span className="font-mono text-zinc-400 truncate max-w-[240px] text-[11px]">
              {qrUrl}
            </span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer shrink-0 ml-2"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between gap-2 no-print">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-zinc-800 text-zinc-400 hover:text-white text-xs cursor-pointer"
          >
            Close
          </Button>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleDownloadPng}
              disabled={!dataUrl || downloading}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs gap-1.5 border border-zinc-700 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG (1024px)</span>
            </Button>

            <Button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-950 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Table Tent</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
