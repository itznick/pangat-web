/* eslint-disable @typescript-eslint/no-explicit-any */
import { useNavigate } from 'react-router'
import { BadgeCheck, Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sa } from '../api'
import { useFetch, useListState, usePerms } from '../hooks'
import { useProvisionStore } from '../useProvisionStore'
import { ago, dateOnly, inr, num } from '../format'
import { DataTable, FilterSelect, Page, Pager, Panel, SearchBox, StatusPill, Toolbar } from '../ui/kit'
import { usePlans } from '../shared'
import { useCsvExport } from '../useCsvExport'

const STATUS = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'].map((v) => ({ value: v, label: v.charAt(0) + v.slice(1).toLowerCase() }))
const SUBS = [['TRIAL', 'Trial'], ['ACTIVE', 'Active'], ['GRACE_PERIOD', 'Grace period'], ['EXPIRED', 'Expired'], ['CANCELLED', 'Cancelled'], ['NONE', 'No subscription']].map(([value, label]) => ({ value, label }))

export function OnboardingBar({ percent }: { percent: number }) {
  return (
    <div className="flex min-w-[96px] items-center gap-2" title={`${percent}% of onboarding steps done`}>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-500/15"><div className={`h-full rounded-full ${percent === 100 ? 'bg-emerald-500' : percent >= 60 ? 'bg-sky-500' : 'bg-amber-500'}`} style={{ width: `${percent}%` }} /></div>
      <span className="w-8 text-right text-[12px] tabular-nums text-zinc-500">{percent}%</span>
    </div>
  )
}

export function RestaurantsPage() {
  const navigate = useNavigate()
  const { can } = usePerms()
  const provision = useProvisionStore()
  const st = useListState({ status: '', verification: '', subscription: '', plan: '', onboarding: '' }, { sort: 'created', order: 'desc' })
  const list = useFetch(() => sa.restaurants(st.params), [JSON.stringify(st.params), provision.version])
  const plans = usePlans(can('subscriptions.view'))
  const csv = useCsvExport()
  const exportCsv = () => {
    const { sort, order, q, status, verification, subscription, plan } = st.params
    return csv.run('restaurants', 'restaurants', { sort, order, q, status, verification, subscription, plan } as Record<string, string | number>)
  }

  return (
    <Page
      title="Restaurants"
      description="Every brand registered on Pangat. Search, filter and open a profile to manage its account, team, subscription and billing."
      actions={
        <>
          {can('exports.manage') && <Button variant="outline" onClick={exportCsv} disabled={csv.exporting}><Download className="h-4 w-4" /> Export CSV</Button>}
          {can('restaurants.provision') && <Button onClick={provision.openNew}><Plus className="h-4 w-4" /> Provision restaurant</Button>}
        </>
      }
    >
      <Panel flush>
        <div className="space-y-3 px-4 pt-4 sm:px-5">
          <Toolbar onReset={st.reset} active={st.active}>
            <SearchBox value={st.q} onChange={st.setQ} placeholder="Search name, owner, email, outlet or phone…" className="w-full sm:w-[340px]" />
            <FilterSelect label="Account status" value={st.filters.status} onChange={(v) => st.setFilter('status', v)} options={STATUS} className="w-[160px]" />
            <FilterSelect label="Subscription" value={st.filters.subscription} onChange={(v) => st.setFilter('subscription', v)} options={SUBS} className="w-[170px]" />
            {plans.data && <FilterSelect label="Plan" value={st.filters.plan} onChange={(v) => st.setFilter('plan', v)} options={plans.data.plans.map((p) => ({ value: p.code, label: p.name }))} className="w-[190px]" />}
            <FilterSelect label="Verification" value={st.filters.verification} onChange={(v) => st.setFilter('verification', v)} options={[{ value: 'VERIFIED', label: 'Verified' }, { value: 'UNVERIFIED', label: 'Unverified' }, { value: 'REJECTED', label: 'Rejected' }]} className="w-[160px]" />
            <FilterSelect label="Onboarding" value={st.filters.onboarding} onChange={(v) => st.setFilter('onboarding', v)} options={[{ value: 'COMPLETE', label: 'Complete' }, { value: 'INCOMPLETE', label: 'Incomplete' }]} className="w-[150px]" />
          </Toolbar>
        </div>
        <div className="mt-3">
          <DataTable
            rows={list.data?.items}
            loading={list.loading}
            error={list.error}
            onRetry={list.reload}
            rowKey={(r: any) => r.id}
            onRowClick={(r: any) => navigate(`/super-admin/restaurants/${r.id}`)}
            sort={st.sort}
            order={st.order}
            onSort={st.toggleSort}
            emptyTitle={st.active ? 'No restaurants match these filters' : 'No restaurants yet'}
            emptyHint={st.active ? 'Try clearing a filter or broadening the search.' : 'Provision the first restaurant to get started.'}
            columns={[
              {
                key: 'name', header: 'Restaurant', sortKey: 'name', primary: true,
                cell: (r: any) => (
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-medium text-zinc-900 dark:text-zinc-50">{r.name}{r.verification_status === 'VERIFIED' && <BadgeCheck className="h-4 w-4 text-sky-500" aria-label="Verified" />}</p>
                    <p className="truncate text-[12px] text-zinc-500">{r.owner_name ?? '—'} · {r.owner_email ?? '—'}</p>
                  </div>
                ),
              },
              { key: 'status', header: 'Account', cell: (r: any) => <StatusPill status={r.status} /> },
              { key: 'sub', header: 'Subscription', cell: (r: any) => (r.subscription_status ? <div><StatusPill status={r.subscription_status} /><p className="mt-0.5 text-[11.5px] text-zinc-500">{r.plan_name}</p></div> : <span className="text-zinc-500">None</span>) },
              { key: 'outlets', header: 'Outlets', sortKey: 'outlets', align: 'right', cell: (r: any) => <span>{r.outlets}</span> },
              { key: 'orders', header: 'Orders 30d', sortKey: 'orders', align: 'right', cell: (r: any) => num(r.orders_30d) },
              { key: 'gmv', header: 'GMV', sortKey: 'gmv', align: 'right', cell: (r: any) => inr(r.gmv, { compact: true }) },
              { key: 'ob', header: 'Onboarding', cell: (r: any) => <OnboardingBar percent={r.onboarding.percent} /> },
              { key: 'act', header: 'Last order', sortKey: 'activity', cell: (r: any) => <span className="text-zinc-500">{ago(r.last_order_at)}</span> },
              { key: 'created', header: 'Joined', sortKey: 'created', hideOnMobile: true, className: 'hidden 2xl:table-cell', cell: (r: any) => <span className="text-zinc-500">{dateOnly(r.created_at)}</span> },
            ]}
          />
        </div>
        {list.data && <Pager page={list.data.page} limit={list.data.limit} total={list.data.total} onPage={st.setPage} />}
      </Panel>
    </Page>
  )
}
