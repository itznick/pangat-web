import { useEffect, useState } from "react"
import QRCode from "qrcode"

interface QrCodeImageProps {
  value: string
  size?: number
  className?: string
}

export function QrCodeImage({ value, size = 200, className = "" }: QrCodeImageProps) {
  const [dataUrl, setDataUrl] = useState<string>("")

  useEffect(() => {
    if (!value) return
    QRCode.toDataURL(value, {
      width: size,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    })
      .then(setDataUrl)
      .catch((err) => console.error("Failed to generate QR code:", err))
  }, [value, size])

  if (!dataUrl) {
    return (
      <div
        className={`bg-white/10 animate-pulse rounded-xl flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-xs text-zinc-500 font-mono">Generating QR...</span>
      </div>
    )
  }

  return (
    <img
      src={dataUrl}
      alt={`QR Code for ${value}`}
      className={`rounded-xl shadow-lg border border-white/10 ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
