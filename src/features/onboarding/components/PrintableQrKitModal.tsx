import { QrKitModal } from '@/features/admin/components/qr/QrKitModal'

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

/** Launch-kit entry point used by onboarding and platform ops: same QR cards as the owner console. */
export function PrintableQrKitModal({ open, onClose, brandName, outletName, slug, indoorTables, outdoorTables, upiVpa }: PrintableQrKitModalProps) {
  return (
    <QrKitModal
      open={open}
      onClose={onClose}
      outletName={outletName || brandName || 'Pangat'}
      outletSlug={slug}
      upiVpa={upiVpa}
      tables={[...indoorTables.map((label) => ({ label, section: 'Indoor' })), ...outdoorTables.map((label) => ({ label, section: 'Outdoor' }))]}
    />
  )
}
