/* eslint-disable @typescript-eslint/no-explicit-any */
import { sa } from '../api'
import { useFetch, usePerms } from '../hooks'
import { ago, num, titleCase } from '../format'
import { DataTable, Panel } from '../ui/kit'

/** The single list of every data export and report download (who, what, checksum). Lives under Monitoring → Data & recovery. */
export function ExportHistory() {
  const { can } = usePerms()
  const allowed = can('exports.manage')
  const history = useFetch(() => sa.exportsHistory(), [], { enabled: allowed })
  if (!allowed) return null
  return (
    <Panel title="Exports & report downloads" description="Restaurant data exports start on a restaurant’s profile (Overview → Export data); CSV reports start on each list and on Payments → Reports. Every one is checksummed and audited." flush>
      <div className="mt-3">
        <DataTable rows={history.data ?? undefined} loading={history.loading} error={history.error} onRetry={history.reload} rowKey={(x: any) => x.id} emptyTitle="No exports yet"
          columns={[
            { key: 'k', header: 'Export', primary: true, cell: (x: any) => <span className="font-medium">{titleCase(x.kind)}{x.organization_name ? ` · ${x.organization_name}` : ''}</span> },
            { key: 'b', header: 'By', cell: (x: any) => x.requested_by_name ?? '—' },
            { key: 'r', header: 'Rows / size', align: 'right', cell: (x: any) => { const rows = Object.values(x.row_counts ?? {}).reduce((a: number, v: any) => a + Number(v), 0); return rows ? `${num(rows)} rows` : `${Math.max(1, Math.round((x.bytes ?? 0) / 1024))} KB` } },
            { key: 'c', header: 'Checksum', hideOnMobile: true, cell: (x: any) => <code className="text-[11.5px] text-zinc-500">{String(x.checksum).slice(0, 14)}…</code> },
            { key: 'd', header: 'When', cell: (x: any) => <span className="text-zinc-500">{ago(x.created_at)}</span> },
          ]} />
      </div>
    </Panel>
  )
}
