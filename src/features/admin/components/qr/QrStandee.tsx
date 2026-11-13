import * as React from "react"
import QRCode from "qrcode"
import { PangatLogo } from "@/components/ui/PangatLogo"

export type StandeeLayout = "tent" | "sticker"
export type StandeeTheme = "light" | "dark"

/** Physical print sizes (mm). Cards are sized in container units, so they scale to any of these. */
export const LAYOUTS: Record<StandeeLayout, { label: string; hint: string; w: number; h: number; perSheet: string }> = {
  tent: { label: "Table tent", hint: "90 × 135 mm · cut & fold", w: 90, h: 135, perSheet: "4 per A4 sheet" },
  sticker: { label: "Sticker", hint: "60 × 60 mm · peel & stick", w: 60, h: 60, perSheet: "12 per A4 sheet" },
}

export function qrDataUrl(value: string, width = 640) {
  return QRCode.toDataURL(value, { width, margin: 1, errorCorrectionLevel: "H", color: { dark: "#0a0a0b", light: "#ffffff" } })
}

export function useQrDataUrl(value: string, width = 640) {
  const [url, setUrl] = React.useState("")
  React.useEffect(() => {
    let alive = true
    setUrl("")
    if (!value) return
    qrDataUrl(value, width)
      .then((u) => alive && setUrl(u))
      .catch((e) => console.error("QR generation failed", e))
    return () => {
      alive = false
    }
  }, [value, width])
  return url
}

interface StandeeProps {
  layout: StandeeLayout
  theme: StandeeTheme
  outletName: string
  tableLabel: string
  section?: string
  qr: string
  url: string
  upiVpa?: string
  showUrl?: boolean
  showUpi?: boolean
  className?: string
}

/**
 * The printed table card. Every dimension is in `cqw` (1% of the card's own width), so the same
 * design renders crisply as a 260px preview or a 90 mm print.
 */
export function QrStandee({ layout, theme, outletName, tableLabel, section, qr, url, upiVpa, showUrl, showUpi, className = "" }: StandeeProps) {
  const dark = theme === "dark"
  const c = dark
    ? { bg: "#0b0b0d", ink: "#ffffff", mute: "#9a9aa5", line: "rgba(255,255,255,0.14)", chip: "#ffffff", chipInk: "#0a0a0b" }
    : { bg: "#ffffff", ink: "#0a0a0b", mute: "#5b5b66", line: "rgba(10,10,11,0.14)", chip: "#0a0a0b", chipInk: "#ffffff" }
  const tent = layout === "tent"
  const urlText = url.replace(/^https?:\/\//, "")

  return (
    <div className={`qr-card ${className}`} style={{ containerType: "inline-size", aspectRatio: tent ? "2 / 3" : "1 / 1", width: "100%" }}>
     {/* Sizes below are in cqw, which resolve against the container above (this card's own width) */}
     <div
      className="relative flex h-full w-full flex-col items-center overflow-hidden text-center"
      style={{
        background: c.bg,
        color: c.ink,
        borderRadius: "7cqw",
        border: `0.4cqw solid ${c.line}`,
        padding: tent ? "8cqw 8cqw 7cqw" : "6cqw",
        fontFamily: "var(--font-sans)",
        boxSizing: "border-box",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {/* brand row */}
      <div className="flex w-full items-center justify-center" style={{ gap: "2.4cqw" }}>
        <div style={{ width: tent ? "8.5cqw" : "9cqw", height: tent ? "8.5cqw" : "9cqw" }} className="[&_svg]:!h-full [&_svg]:!w-full [&>div]:!h-full [&>div]:!w-full">
          <PangatLogo size="sm" />
        </div>
        <span className="truncate font-semibold" style={{ fontSize: tent ? "5cqw" : "5.4cqw", letterSpacing: "-0.01em", maxWidth: "70cqw" }}>
          {outletName}
        </span>
      </div>

      {tent && (
        <>
          <p className="font-semibold" style={{ fontSize: "10.5cqw", lineHeight: 1.02, letterSpacing: "-0.04em", marginTop: "6.5cqw" }}>
            Scan to order.
          </p>
          <p style={{ fontSize: "4cqw", color: c.mute, marginTop: "1.8cqw" }}>No app. Pay with any UPI app.</p>
        </>
      )}

      {/* QR with brand corner marks */}
      <div className="relative flex items-center justify-center" style={{ marginTop: tent ? "6cqw" : "4cqw", width: tent ? "60cqw" : "62cqw", aspectRatio: "1 / 1" }}>
        {(["tl", "tr", "bl", "br"] as const).map((k) => (
          <span
            key={k}
            aria-hidden
            style={{
              position: "absolute",
              width: "9cqw",
              height: "9cqw",
              borderColor: "#10b981",
              borderStyle: "solid",
              borderWidth: 0,
              ...(k === "tl" && { top: 0, left: 0, borderTopWidth: "1cqw", borderLeftWidth: "1cqw", borderTopLeftRadius: "3cqw" }),
              ...(k === "tr" && { top: 0, right: 0, borderTopWidth: "1cqw", borderRightWidth: "1cqw", borderTopRightRadius: "3cqw" }),
              ...(k === "bl" && { bottom: 0, left: 0, borderBottomWidth: "1cqw", borderLeftWidth: "1cqw", borderBottomLeftRadius: "3cqw" }),
              ...(k === "br" && { bottom: 0, right: 0, borderBottomWidth: "1cqw", borderRightWidth: "1cqw", borderBottomRightRadius: "3cqw" }),
            }}
          />
        ))}
        <div className="flex items-center justify-center bg-white" style={{ width: "86%", height: "86%", borderRadius: "3cqw", padding: "1.2cqw" }}>
          {qr ? <img src={qr} alt={`QR code for ${tableLabel}`} style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} /> : <span style={{ fontSize: "3.4cqw", color: "#a1a1aa" }}>Generating…</span>}
        </div>
      </div>

      {/* table chip */}
      <div
        className="font-semibold"
        style={{ marginTop: tent ? "6cqw" : "4cqw", background: c.chip, color: c.chipInk, borderRadius: "999px", padding: tent ? "1.8cqw 7cqw" : "1.5cqw 6cqw", fontSize: tent ? "6.4cqw" : "6cqw", letterSpacing: "0.04em" }}
      >
        {tableLabel}
      </div>
      {section && tent && <p style={{ fontSize: "3.4cqw", color: c.mute, marginTop: "1.6cqw" }}>{section}</p>}

      {(showUrl || showUpi) && (
        <div className="mt-auto w-full" style={{ paddingTop: "3cqw", borderTop: `0.3cqw solid ${c.line}`, marginTop: "auto", fontSize: "3cqw", color: c.mute }}>
          {showUrl && <p className="truncate" style={{ fontFamily: "var(--font-mono, ui-monospace)" }}>{urlText}</p>}
          {showUpi && upiVpa && <p className="truncate" style={{ marginTop: "0.8cqw" }}>UPI · {upiVpa}</p>}
        </div>
      )}
      {!(showUrl || showUpi) && <div style={{ marginTop: "auto" }} />}
      {tent && !(showUrl || showUpi) && (
        <p style={{ fontSize: "2.8cqw", color: c.mute, letterSpacing: "0.12em", textTransform: "uppercase" }}>Powered by Pangat</p>
      )}
     </div>
    </div>
  )
}
