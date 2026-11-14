/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router'
import { sa } from '../api'
import { useFetch, useListState } from '../hooks'
import { ago, num } from '../format'
import { DataTable, FilterSelect, Page, Pager, Panel, Pill, SearchBox, Stat, StatusPill, Toolbar } from '../ui/kit'

export function OutletsPage() {
  const navigate = useNavigate()
  const st = useListState({ status: '', online: '' }, { limit: 25 })
  const list = useFetch(() => sa.outletsMonitor(st.params), [JSON.stringify(st.params)], { pollMs: 30000 })
  const s = list.data?.summary
  return (
    <Page title="Outlets & branches" description="Every branch across the platform: whether a console is connected right now, live orders, and recent trading.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Total outlets" value={num(s?.total)} loading={!s} />
        <Stat label="Console connected now" value={num(s?.online)} tone="emerald" loading={!s} hint="live realtime connection" onClick={() => st.setFilter('online', 'true')} />
        <Stat label="Inactive outlets" value={num(s?.inactive)} tone="rose" loading={!s} onClick={() => st.setFilter('status', 'INACTIVE')} />
        <Stat label="Open orders now" value={num((list.data?.items ?? []).reduce((a: number, o: any) => a + o.open_orders, 0))} tone="sky" loading={!list.data} hint="on this page" />
      </div>
      <Panel flush>
        <div className="px-4 pt-4 sm:px-5">
          <Toolbar onReset={st.reset} active={st.active}>
            <SearchBox value={st.q} onChange={st.setQ} placeholder="Search outlet, slug, area or restaurant…" className="w-full sm:w-[320px]" />
            <FilterSelect label="Status" value={st.filters.status} onChange={(v) => st.setFilter('status', v)} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }]} className="w-[140px]" />
            <FilterSelect label="Connection" value={st.filters.online} onChange={(v) => st.setFilter('online', v)} options={[{ value: 'true', label: 'Connected' }, { value: 'false', label: 'Not connected' }]} className="w-[160px]" />
          </Toolbar>
        </div>
        <div className="mt-3">
          <DataTable rows={list.data?.items} loading={list.loading} error={list.error} onRetry={list.reload} rowKey={(o: any) => o.id} onRowClick={(o: any) => o.organization_id && navigate(`/super-admin/restaurants/${o.organization_id}?tab=outlets`)} emptyTitle="No outlets match"
            columns={[
              { key: 'n', header: 'Outlet', primary: true, cell: (o: any) => <div><p className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-50"><span className={`h-2 w-2 rounded-full ${o.isOnline ? 'bg-emerald-500' : 'bg-zinc-400'}`} />{o.name}</p><p className="text-[12px] text-zinc-500">/{o.slug}{o.branch_area ? ` · ${o.branch_area}` : ''}</p></div> },
              { key: 'r', header: 'Restaurant', cell: (o: any) => <div><p>{o.organization_name ?? '—'}</p>{o.account_status && o.account_status !== 'ACTIVE' && <StatusPill status={o.account_status} />}</div> },
              { key: 's', header: 'Status', cell: (o: any) => <Pill tone={o.is_active ? 'good' : 'bad'} dot>{o.is_active ? 'Active' : 'Inactive'}</Pill> },
              { key: 'c', header: 'Console', cell: (o: any) => <Pill tone={o.isOnline ? 'good' : 'neutral'}>{o.isOnline ? 'Connected' : 'Offline'}</Pill> },
              { key: 'o', header: 'Open orders', align: 'right', cell: (o: any) => o.open_orders },
              { key: 'd', header: 'Orders 24h', align: 'right', cell: (o: any) => o.orders_24h },
              { key: 'l', header: 'Last order', cell: (o: any) => <span className="text-zinc-500">{ago(o.last_order_at)}</span> },
            ]} />
        </div>
        {list.data && <Pager page={list.data.page} limit={list.data.limit} total={list.data.total} onPage={st.setPage} />}
      </Panel>
    </Page>
  )
}
