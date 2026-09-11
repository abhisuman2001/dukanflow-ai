import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import StatusBadge from '../components/ui/StatusBadge'
import { TableSkeleton, Spinner } from '../components/ui/LoadingState'
import ErrorState from '../components/ui/ErrorState'
import EmptyState from '../components/ui/EmptyState'
import { fetchDashboard } from '../api/data'

// ── Compact inline icons ──────────────────────────────────────────────────────
const I = {
  Calendar:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>,
  Wrench:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.655m5.657-5.657 1.857-.248.921 2.18-1.07 1.07-2.18-.921.248-1.857Zm-5.657 5.657-1.857.248-.921-2.18 1.07-1.07 2.18.921-.248 1.857Z" /></svg>,
  Check:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  Bell:      (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>,
  Warning:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>,
  Info:      (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>,
  Urgent:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  Cpu:       (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" /></svg>,
  Plus:      (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Refresh:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  ArrowRight:(p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg>,
}

// ── Metric tile ───────────────────────────────────────────────────────────────
function Tile({ label, value, sub, icon: Icon, color = 'default', loading }) {
  const colors = {
    default: 'bg-white border-surface-200 text-surface-900',
    amber:   'bg-amber-50 border-amber-200 text-amber-700',
    green:   'bg-green-50 border-green-200 text-green-700',
    brand:   'bg-brand-50 border-brand-200 text-brand-700',
    violet:  'bg-violet-50 border-violet-200 text-violet-700',
  }
  const iconColors = {
    default: 'text-surface-400', amber: 'text-amber-500',
    green: 'text-green-500', brand: 'text-brand-500', violet: 'text-violet-500',
  }
  return (
    <div className={`rounded-lg border p-4 flex items-start justify-between gap-2 ${colors[color]}`}>
      <div>
        <p className="text-2xs font-semibold uppercase tracking-wider opacity-60">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight">
          {loading ? <span className="inline-block w-8 h-6 bg-surface-100 rounded animate-pulse" /> : (value ?? '—')}
        </p>
        {sub && <p className="mt-0.5 text-xs opacity-60">{sub}</p>}
      </div>
      {Icon && <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors[color]}`} />}
    </div>
  )
}

// ── Attention item ────────────────────────────────────────────────────────────
function AttentionItem({ item }) {
  const cfg = {
    urgent:  { bg: 'bg-red-50 border-red-200',   icon: I.Urgent,  ic: 'text-red-500'    },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: I.Warning, ic: 'text-amber-500' },
    info:    { bg: 'bg-blue-50 border-blue-200',   icon: I.Info,    ic: 'text-blue-500'  },
  }[item.type] || { bg: 'bg-surface-50 border-surface-200', icon: I.Info, ic: 'text-surface-400' }

  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 border-b border-surface-100 last:border-0 ${item.type === 'urgent' ? 'bg-red-50/50' : ''}`}>
      <cfg.icon className={`w-4 h-4 shrink-0 ${cfg.ic}`} />
      <p className="flex-1 text-sm text-surface-700">{item.message}</p>
      {item.link && (
        <Link to={item.link} className="text-xs text-brand-600 hover:text-brand-700 font-medium whitespace-nowrap flex items-center gap-0.5">
          {item.link_label} <I.ArrowRight className="w-3 h-3" />
        </Link>
      )}
    </div>
  )
}

// ── Activity entry ────────────────────────────────────────────────────────────
const ACTION_LABELS = {
  customer_lookup:    { label: 'Customer looked up',     color: 'bg-blue-100 text-blue-600'   },
  technician_assigned:{ label: 'Technician assigned',    color: 'bg-violet-100 text-violet-600'},
  job_status_updated: { label: 'Job status updated',     color: 'bg-amber-100 text-amber-700' },
  invoice_generated:  { label: 'Invoice generated',      color: 'bg-green-100 text-green-700' },
  followup_scheduled: { label: 'Follow-up scheduled',    color: 'bg-teal-100 text-teal-700'   },
}

function ActivityEntry({ entry }) {
  const cfg = ACTION_LABELS[entry.action] || { label: entry.action, color: 'bg-surface-100 text-surface-600' }
  const time = entry.ts ? new Date(entry.ts).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-surface-100 last:border-0">
      <span className="text-xs text-surface-400 tabular-nums w-12 shrink-0 mt-0.5">{time}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-surface-700 leading-snug">{entry.description}</p>
      </div>
      <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded shrink-0 ${cfg.color}`}>
        {cfg.label}
      </span>
    </div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, action, children }) {
  return (
    <div className="bg-white border border-surface-200 rounded-lg shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-surface-100">
        <h3 className="text-sm font-semibold text-surface-800">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = async (soft = false) => {
    if (soft) setRefreshing(true)
    else { setLoading(true); setError(null) }
    try {
      const d = await fetchDashboard()
      setData(d)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { load() }, [])

  const m  = data?.metrics || {}
  const today = data?.today || new Date().toISOString().slice(0, 10)

  const todayLabel = new Date(today + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <AppShell title="Dashboard">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-sm text-surface-500">
            {todayLabel} · Here's what needs attention today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="btn-ghost text-xs border border-surface-200 gap-1.5"
          >
            {refreshing
              ? <Spinner size="sm" />
              : <I.Refresh className="w-3.5 h-3.5" />}
            Refresh
          </button>
          <Link to="/ai-ops" className="btn-primary text-xs gap-1.5">
            <I.Plus className="w-3.5 h-3.5" />
            New appointment
          </Link>
        </div>
      </div>

      {error && !data && <ErrorState message={error} onRetry={() => load()} />}

      {/* ── Section 1: Today's overview ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Tile loading={loading} label="Today's appointments" value={m.todays_appointments}
          sub={`${m.unassigned_today ?? 0} unassigned`} icon={I.Calendar} color="brand" />
        <Tile loading={loading} label="In progress" value={m.in_progress}
          sub="Active jobs" icon={I.Wrench} color="amber" />
        <Tile loading={loading} label="Completed" value={m.completed_today}
          sub="All time" icon={I.Check} color="green" />
        <Tile loading={loading} label="Pending follow-ups" value={m.pending_followups}
          sub="Scheduled" icon={I.Bell} color="violet" />
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">

        {/* ── Section 2: Today's appointments table ── */}
        <div className="xl:col-span-2">
          <Section
            title={`Today's Appointments`}
            action={
              <Link to="/appointments" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                All appointments →
              </Link>
            }
          >
            {loading ? (
              <TableSkeleton rows={5} cols={5} />
            ) : !data?.todays_appointments?.length ? (
              <EmptyState
                title="No appointments today"
                description="Use the AI Operations agent to book a new appointment."
                action={
                  <Link to="/ai-ops" className="btn-primary text-xs">
                    <I.Plus className="w-3.5 h-3.5" /> Book via AI
                  </Link>
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="df-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Customer</th>
                      <th>Service</th>
                      <th>Technician</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.todays_appointments.map((a) => (
                      <tr key={a._id}>
                        <td className="tabular-nums text-surface-500 text-xs whitespace-nowrap">
                          {a.time_slot || '—'}
                        </td>
                        <td>
                          <div className="font-medium text-surface-800">{a.customer_name}</div>
                          <div className="text-xs text-surface-400">{a.customer_phone}</div>
                        </td>
                        <td className="capitalize text-surface-600">
                          {(a.skill || '—').replace('_', ' ')}
                        </td>
                        <td className="text-surface-600">
                          {a.technician_name || (
                            <span className="text-amber-600 font-medium text-xs">Unassigned</span>
                          )}
                        </td>
                        <td><StatusBadge status={a.status} /></td>
                        <td>
                          <Link
                            to="/appointments"
                            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-4">

          {/* ── Section 3: Operations attention ── */}
          <Section
            title="Needs Attention"
            action={
              !loading && data?.attention?.length === 0 && (
                <span className="text-xs text-green-600 font-medium">All clear</span>
              )
            }
          >
            {loading ? (
              <div className="px-4 py-6"><Spinner /></div>
            ) : !data?.attention?.length ? (
              <div className="flex items-center gap-2 px-4 py-4">
                <I.Check className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-sm text-surface-500">Nothing needs attention right now.</p>
              </div>
            ) : (
              <div>
                {data.attention.map((item, i) => (
                  <AttentionItem key={i} item={item} />
                ))}
              </div>
            )}
          </Section>

          {/* ── AI Operations summary ── */}
          <Section title="AI Operations">
            {loading ? (
              <div className="px-4 py-4"><Spinner /></div>
            ) : (
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <I.Cpu className="w-4 h-4 text-surface-400" />
                  <span className="text-xs text-surface-500">
                    {data?.ai_ops?.total_actions ?? 0} total actions recorded
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Customer lookups',      val: data?.ai_ops?.customer_lookups ?? 0 },
                    { label: 'Technician assignments', val: data?.ai_ops?.assignments ?? 0 },
                    { label: 'Invoices generated',    val: data?.ai_ops?.invoices ?? 0 },
                    { label: 'Follow-ups scheduled',  val: data?.ai_ops?.followups ?? 0 },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-xs text-surface-500">{label}</span>
                      <span className="text-xs font-semibold text-surface-700 tabular-nums">{val}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/ai-ops"
                  className="mt-3 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                >
                  Open AI Operations <I.ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </Section>

        </div>
      </div>

      {/* ── Section 4: Recent activity ── */}
      <Section
        title="Recent Activity"
        action={
          <Link to="/appointments" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
            View all →
          </Link>
        }
      >
        {loading ? (
          <TableSkeleton rows={4} cols={3} />
        ) : !data?.activity?.length ? (
          <div className="px-4 py-5">
            <p className="text-sm text-surface-400">
              No activity recorded yet. Activity is logged automatically as the AI agent performs operations.
            </p>
          </div>
        ) : (
          <div className="px-4 divide-y divide-surface-50">
            {data.activity.map((e) => (
              <ActivityEntry key={e._id} entry={e} />
            ))}
          </div>
        )}
      </Section>

    </AppShell>
  )
}
