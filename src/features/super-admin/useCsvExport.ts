import * as React from 'react'
import { toast } from '@/components/ui/toast'
import { errMsg } from '@/lib/api'
import { sa } from './api'
import { downloadText } from './format'

type Kind = Parameters<typeof sa.report>[0]
type Query = Parameters<typeof sa.report>[1]

/** Download a server-built CSV report. Every "Export" button in the console goes through here. */
export function useCsvExport() {
  const [exporting, setExporting] = React.useState<Kind | null>(null)
  const run = React.useCallback(async (kind: Kind, noun: string, query: Query = {}) => {
    setExporting(kind)
    try {
      const r = await sa.report(kind, query)
      downloadText(r.filename, r.content, 'text/csv')
      toast.success(`Exported ${r.rows} ${noun}`)
      return true
    } catch (e) {
      toast.error(errMsg(e))
      return false
    } finally {
      setExporting(null)
    }
  }, [])
  return { exporting: exporting !== null, running: exporting, run }
}
