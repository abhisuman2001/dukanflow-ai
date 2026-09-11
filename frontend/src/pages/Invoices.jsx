import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { TableSkeleton } from '../components/ui/LoadingState'
import { fetchInvoices } from '../api/data'

const I = {
  Refresh:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  Receipt:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" /></svg>,
  Download: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>,
}

function fmt(n) {
  return typeof n === 'number'
    ? '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2 })
    : '—'
}

// Compact summary tile
function SummaryTile({ label, value, sub, accent }) {
  return (
    <div className={`bg-white border rounded-lg px-4 py-3 shadow-card ${accent ? 'border-brand-200' : 'border-surface-200'}`}>
      <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">{label}</p>
      <p className={`text-xl font-bold mt-1 tracking-tight ${accent ? 'text-brand-600' : 'text-surface-900'}`}>{value}</p>
      {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function Invoices() {
  const [data, setData]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [status, setStatus] = useState('')

  const load = (s = status) => {
    setLoading(true); setError(null)
    fetchInvoices(s)
      .then((r) => setData(r.invoices || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const totalRevenue  = data.reduce((s, i) => s + (i.total    || 0), 0)
  const totalTax      = data.reduce((s, i) => s + (i.tax      || 0), 0)
  const totalSubtotal = data.reduce((s, i) => s + (i.subtotal || 0), 0)

  return (
    <AppShell title="Invoices">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight">Invoices</h1>
          <p className="text-sm text-surface-500 mt-0.5">Generated invoices and revenue summary.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => load(status)} className="btn-ghost text-xs border border-surface-200 gap-1.5">
            <I.Refresh className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link to="/ai-ops" className="btn-primary text-xs gap-1.5">
            <I.Receipt className="w-3.5 h-3.5" /> Generate via AI
          </Link>
        </div>
      </div>

      {/* Summary tiles — only show when we have data */}
      {!loading && !error && data.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <SummaryTile label="Total Revenue" value={fmt(totalRevenue)} sub={`${data.length} invoices`} accent />
          <SummaryTile label="Subtotal"      value={fmt(totalSubtotal)} sub="Before tax" />
          <SummaryTile label="GST (18%)"     value={fmt(totalTax)} sub="Tax collected" />
        </div>
      )}

      {/* Status filter */}
      <div className="flex gap-1 flex-wrap mb-4">
        {['', 'generated', 'paid', 'cancelled'].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatus(s); load(s) }}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              status === s
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
            }`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-surface-200 rounded-lg shadow-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(status)} />
        ) : data.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="Invoices are generated when a job is marked completed. Use the AI agent to generate an invoice."
            action={
              <Link to="/ai-ops" className="btn-primary text-sm gap-1.5">
                <I.Receipt className="w-4 h-4" /> Generate via AI
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="df-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Technician</th>
                    <th>Subtotal</th>
                    <th>GST 18%</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((inv) => (
                    <tr key={inv._id}>
                      <td className="font-mono text-xs text-surface-600 font-medium">{inv.invoice_number}</td>
                      <td className="font-medium text-surface-800">{inv.customer_name}</td>
                      <td className="capitalize text-surface-600">{(inv.service || '—').replace('_', ' ')}</td>
                      <td className="text-surface-500">{inv.technician_name || '—'}</td>
                      <td className="tabular-nums text-surface-600">{fmt(inv.subtotal)}</td>
                      <td className="tabular-nums text-surface-400">{fmt(inv.tax)}</td>
                      <td className="tabular-nums font-semibold text-surface-900">{fmt(inv.total)}</td>
                      <td className="tabular-nums text-surface-400 text-xs">
                        {inv.created_at ? inv.created_at.slice(0, 10) : '—'}
                      </td>
                      <td><StatusBadge status={inv.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer totals bar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-100 bg-surface-50">
              <span className="text-xs text-surface-500">
                {data.length} invoice{data.length !== 1 ? 's' : ''}
                {status && ` · ${status}`}
              </span>
              <div className="flex items-center gap-6">
                <span className="text-xs text-surface-400">
                  Subtotal <span className="font-semibold text-surface-700 ml-1">{fmt(totalSubtotal)}</span>
                </span>
                <span className="text-xs text-surface-400">
                  GST <span className="font-semibold text-surface-700 ml-1">{fmt(totalTax)}</span>
                </span>
                <span className="text-xs text-surface-600 font-semibold">
                  Total <span className="text-surface-900 text-sm ml-1">{fmt(totalRevenue)}</span>
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
