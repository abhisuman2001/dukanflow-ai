import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { TableSkeleton, Spinner } from '../components/ui/LoadingState'
import { fetchCustomers } from '../api/data'

const I = {
  Search:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
  Plus:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Refresh: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  X:       (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>,
  Phone:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.28 1.395-2.077 2.512-1.42l4.384 2.583a1.5 1.5 0 0 1 .39 2.218l-.808 1.075a.75.75 0 0 0-.09.625 12.034 12.034 0 0 0 6.933 6.933.75.75 0 0 0 .625-.09l1.075-.808a1.5 1.5 0 0 1 2.218.39l2.583 4.384c.658 1.117-.14 2.512-1.42 2.512h-.537c-8.284 0-15-6.716-15-15v-.537Z" /></svg>,
}

function Avatar({ name }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?'
  return (
    <span className="inline-flex w-7 h-7 rounded-full bg-brand-100 text-brand-700 text-xs font-bold items-center justify-center shrink-0 select-none">
      {initials}
    </span>
  )
}

function PreferredTimeBadge({ value }) {
  if (!value) return <span className="text-surface-400">—</span>
  const colors = {
    morning: 'bg-amber-50 text-amber-700 border-amber-200',
    evening: 'bg-violet-50 text-violet-700 border-violet-200',
    afternoon: 'bg-blue-50 text-blue-700 border-blue-200',
  }
  const cls = colors[value.toLowerCase()] || 'bg-surface-100 text-surface-600 border-surface-200'
  return (
    <span className={`inline-block px-2 py-0.5 rounded border text-2xs font-semibold capitalize ${cls}`}>
      {value}
    </span>
  )
}

export default function Customers() {
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [search, setSearch]   = useState('')
  const [applied, setApplied] = useState('')

  const load = useCallback((q = applied) => {
    setLoading(true); setError(null)
    fetchCustomers(q)
      .then((r) => setData(r.customers || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [applied])

  useEffect(() => { load('') }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setApplied(search)
    load(search)
  }

  const clearSearch = () => {
    setSearch(''); setApplied('')
    load('')
  }

  return (
    <AppShell title="Customers">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight">Customers</h1>
          <p className="text-sm text-surface-500 mt-0.5">Registered service customers.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => load(applied)} className="btn-ghost text-xs border border-surface-200 gap-1.5">
            <I.Refresh className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link to="/ai-ops" className="btn-primary text-xs gap-1.5">
            <I.Plus className="w-3.5 h-3.5" /> Register via AI
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative">
          <I.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
          <input
            className="df-input pl-8 text-xs w-64"
            placeholder="Search by name or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-ghost text-xs border border-surface-200">Search</button>
        {applied && (
          <button type="button" onClick={clearSearch} className="btn-ghost text-xs flex items-center gap-1">
            <I.X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </form>

      {/* Table */}
      <div className="bg-white border border-surface-200 rounded-lg shadow-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(applied)} />
        ) : data.length === 0 ? (
          <EmptyState
            title={applied ? `No results for "${applied}"` : 'No customers yet'}
            description={applied
              ? 'Try a different name or phone number.'
              : 'Customers are created when a booking is made via the AI agent.'}
            action={
              !applied && (
                <Link to="/ai-ops" className="btn-primary text-sm gap-1.5">
                  <I.Plus className="w-4 h-4" /> Register via AI
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Preferred Time</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <Avatar name={c.name} />
                        <span className="font-medium text-surface-800">{c.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="flex items-center gap-1.5 tabular-nums text-surface-600">
                        <I.Phone className="w-3 h-3 text-surface-400 shrink-0" />
                        {c.phone}
                      </span>
                    </td>
                    <td className="text-surface-500">{c.email || '—'}</td>
                    <td className="text-surface-500 max-w-xs truncate">{c.address || '—'}</td>
                    <td><PreferredTimeBadge value={c.preferred_time} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && (
        <p className="mt-2 text-xs text-surface-400 text-right">
          {data.length} customer{data.length !== 1 ? 's' : ''}
          {applied && ` matching "${applied}"`}
        </p>
      )}
    </AppShell>
  )
}
