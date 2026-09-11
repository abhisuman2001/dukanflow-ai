import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { TableSkeleton } from '../components/ui/LoadingState'
import { fetchFollowups } from '../api/data'

const I = {
  Refresh: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  Bell:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>,
  Alert:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>,
  Clock:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  Check:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>,
}

const today = new Date().toISOString().slice(0, 10)
const isOverdue  = (d) => d && d < today
const isDueToday = (d) => d && d === today

function DateCell({ date, status }) {
  if (!date) return <span className="text-surface-400">—</span>
  if (status !== 'scheduled') {
    return <span className="tabular-nums text-surface-500">{date}</span>
  }
  if (isOverdue(date)) {
    return (
      <span className="flex items-center gap-1.5">
        <I.Alert className="w-3.5 h-3.5 text-red-500 shrink-0" />
        <span className="tabular-nums text-red-600 font-medium">{date}</span>
        <span className="text-2xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">Overdue</span>
      </span>
    )
  }
  if (isDueToday(date)) {
    return (
      <span className="flex items-center gap-1.5">
        <I.Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="tabular-nums text-amber-600 font-medium">{date}</span>
        <span className="text-2xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-semibold">Today</span>
      </span>
    )
  }
  return <span className="tabular-nums text-surface-600">{date}</span>
}

export default function FollowUps() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [status, setStatus]   = useState('')

  const load = (s = status) => {
    setLoading(true); setError(null)
    fetchFollowups(s)
      .then((r) => setData(r.followups || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Derived counts
  const overdueCount  = data.filter((f) => f.status === 'scheduled' && isOverdue(f.scheduled_for)).length
  const dueTodayCount = data.filter((f) => f.status === 'scheduled' && isDueToday(f.scheduled_for)).length

  return (
    <AppShell title="Follow-ups">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight">Follow-ups</h1>
          <p className="text-sm text-surface-500 mt-0.5">Scheduled post-service check-ins with customers.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => load(status)} className="btn-ghost text-xs border border-surface-200 gap-1.5">
            <I.Refresh className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link to="/ai-ops" className="btn-primary text-xs gap-1.5">
            <I.Bell className="w-3.5 h-3.5" /> Schedule via AI
          </Link>
        </div>
      </div>

      {/* Alert banners — only show when relevant */}
      {!loading && overdueCount > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg mb-3 text-sm text-red-700">
          <I.Alert className="w-4 h-4 shrink-0" />
          <span>
            <strong>{overdueCount}</strong> follow-up{overdueCount !== 1 ? 's are' : ' is'} overdue — these customers haven't been contacted yet.
          </span>
        </div>
      )}
      {!loading && dueTodayCount > 0 && (
        <div className="flex items-center gap-2.5 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg mb-3 text-sm text-amber-700">
          <I.Clock className="w-4 h-4 shrink-0" />
          <span>
            <strong>{dueTodayCount}</strong> follow-up{dueTodayCount !== 1 ? 's are' : ' is'} due today.
          </span>
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-1 flex-wrap mb-4">
        {['', 'scheduled', 'done'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatus(s); load(s) }}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              status === s
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
            }`}
          >
            {s === '' ? 'All' : s === 'scheduled' ? 'Scheduled' : 'Done'}
            {s === 'scheduled' && overdueCount > 0 && (
              <span className="ml-1.5 w-4 h-4 inline-flex items-center justify-center rounded-full bg-red-500 text-white text-2xs font-bold">
                {overdueCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-surface-200 rounded-lg shadow-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(status)} />
        ) : data.length === 0 ? (
          <EmptyState
            title="No follow-ups found"
            description="Follow-ups are scheduled after a service is completed. The AI agent can schedule them automatically."
            action={
              <Link to="/ai-ops" className="btn-primary text-sm gap-1.5">
                <I.Bell className="w-4 h-4" /> Schedule via AI
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Follow-up #</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Technician</th>
                  <th>Scheduled For</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((f) => (
                  <tr
                    key={f._id}
                    className={
                      f.status === 'scheduled' && isOverdue(f.scheduled_for)
                        ? 'bg-red-50/40'
                        : f.status === 'scheduled' && isDueToday(f.scheduled_for)
                          ? 'bg-amber-50/40'
                          : ''
                    }
                  >
                    <td className="font-mono text-xs font-medium text-surface-600">{f.followup_number}</td>
                    <td className="font-medium text-surface-800">{f.customer_name}</td>
                    <td className="capitalize text-surface-600">{(f.service || '—').replace('_', ' ')}</td>
                    <td className="text-surface-500">{f.technician_name || '—'}</td>
                    <td><DateCell date={f.scheduled_for} status={f.status} /></td>
                    <td className="text-surface-500 max-w-xs truncate" title={f.reason}>{f.reason || '—'}</td>
                    <td><StatusBadge status={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && (
        <p className="mt-2 text-xs text-surface-400 text-right">
          {data.length} follow-up{data.length !== 1 ? 's' : ''}
        </p>
      )}
    </AppShell>
  )
}
