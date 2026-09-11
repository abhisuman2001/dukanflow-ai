import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { TableSkeleton, Spinner } from '../components/ui/LoadingState'
import {
  fetchCustomers,
  fetchCustomerByPhone,
  createCustomer,
  updateCustomer,
} from '../api/data'

// ── Icons ─────────────────────────────────────────────────────────────────────
const I = {
  Search:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
  Plus:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Refresh:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  X:        (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>,
  Edit:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>,
  Phone:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.28 1.395-2.077 2.512-1.42l4.384 2.583a1.5 1.5 0 0 1 .39 2.218l-.808 1.075a.75.75 0 0 0-.09.625 12.034 12.034 0 0 0 6.933 6.933.75.75 0 0 0 .625-.09l1.075-.808a1.5 1.5 0 0 1 2.218.39l2.583 4.384c.658 1.117-.14 2.512-1.42 2.512h-.537c-8.284 0-15-6.716-15-15v-.537Z" /></svg>,
  Mail:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>,
  Location: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>,
  Clock:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  Check:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>,
  ChevronR: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>,
  Receipt:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" /></svg>,
  Calendar: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>,
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'sm' }) {
  const initials = name
    ? name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
    : '?'
  const sz = size === 'lg'
    ? 'w-11 h-11 text-base'
    : 'w-7 h-7 text-xs'
  return (
    <span className={`inline-flex rounded-full bg-brand-100 text-brand-700 font-bold items-center justify-center shrink-0 select-none ${sz}`}>
      {initials}
    </span>
  )
}

function fmt(n) {
  return typeof n === 'number' ? '₹' + n.toLocaleString('en-IN') : null
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3200)
    return () => clearTimeout(t)
  }, [toast])
  if (!toast) return null
  const cls = toast.type === 'error' ? 'bg-red-600' : 'bg-surface-900'
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg text-white text-sm font-medium shadow-card-md ${cls}`}>
      {toast.type === 'success' && <I.Check className="w-4 h-4 shrink-0" />}
      {toast.message}
      <button onClick={onDismiss}><I.X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" /></button>
    </div>
  )
}

// ── Customer form (add / edit) ────────────────────────────────────────────────
function CustomerForm({ initial, onSave, onCancel }) {
  const editing = !!initial
  const [form, setForm] = useState({
    name:           initial?.name           || '',
    phone:          initial?.phone          || '',
    email:          initial?.email          || '',
    address:        initial?.address        || '',
    preferred_time: initial?.preferred_time || '',
  })
  const [busy, setBusy] = useState(false)
  const [err,  setErr]  = useState('')

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { setErr('Name and phone are required.'); return }
    setBusy(true); setErr('')
    try { await onSave(form) }
    catch (ex) { setErr(ex.message) }
    finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-3 pt-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-surface-600 mb-1">Full name *</label>
          <input className="df-input text-xs" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rahul Sharma" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Phone *</label>
          <input
            className={`df-input text-xs ${editing ? 'bg-surface-50 text-surface-400 cursor-not-allowed' : ''}`}
            value={form.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="9876543210"
            required
            readOnly={editing}
          />
          {editing && <p className="text-2xs text-surface-400 mt-0.5">Phone number cannot be changed.</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Email</label>
          <input type="email" className="df-input text-xs" value={form.email} onChange={e => set('email', e.target.value)} placeholder="optional" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-surface-600 mb-1">Address</label>
          <input className="df-input text-xs" value={form.address} onChange={e => set('address', e.target.value)} placeholder="City, Area" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Preferred time</label>
          <select className="df-select text-xs" value={form.preferred_time} onChange={e => set('preferred_time', e.target.value)}>
            <option value="">Not specified</option>
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
          </select>
        </div>
      </div>
      {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{err}</p>}
      <div className="flex gap-2 pt-2 border-t border-surface-100">
        <button type="submit" disabled={busy} className="btn-primary text-xs">
          {busy ? <Spinner size="sm" /> : editing ? 'Save changes' : 'Add customer'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-xs border border-surface-200">Cancel</button>
      </div>
    </form>
  )
}

// ── Service history row ───────────────────────────────────────────────────────
function HistoryRow({ job }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-surface-100 last:border-0">
      {/* Date */}
      <div className="w-20 shrink-0">
        <p className="text-xs font-medium text-surface-700 tabular-nums">{job.date}</p>
        {job.time_slot && <p className="text-2xs text-surface-400">{job.time_slot}</p>}
      </div>

      {/* Service + technician */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-surface-800 capitalize">
          {(job.skill || 'Service').replace('_', ' ')}
        </p>
        <p className="text-2xs text-surface-400 truncate">
          {job.technician || 'No technician'}
        </p>
      </div>

      {/* Invoice */}
      <div className="text-right shrink-0">
        {job.invoice_number ? (
          <p className="text-xs font-mono text-surface-500">{job.invoice_number}</p>
        ) : null}
        {job.invoice_total ? (
          <p className="text-xs font-semibold text-surface-700">{fmt(job.invoice_total)}</p>
        ) : null}
      </div>

      {/* Status */}
      <div className="shrink-0">
        <StatusBadge status={job.status} />
      </div>
    </div>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function CustomerDrawer({ phone, onClose, onUpdated }) {
  const [customer, setCustomer] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [err, setErr]           = useState(null)
  const [mode, setMode]         = useState('view')  // 'view' | 'edit'
  const [toast, setToast]       = useState(null)
  const [historyLimit, setHistoryLimit] = useState(5)

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback(async () => {
    setLoading(true); setErr(null)
    try { setCustomer(await fetchCustomerByPhone(phone)) }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }, [phone])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const handleSave = async (form) => {
    await updateCustomer(phone, form)
    showToast('Customer updated successfully')
    setMode('view')
    load(); onUpdated()
  }

  const history = customer?.service_history || []
  const upcoming = customer?.upcoming || []
  const visibleHistory = history.slice(0, historyLimit)

  return (
    <>
      <div className="fixed inset-0 z-30 bg-surface-900/30" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-white border-l border-surface-200 shadow-card-md flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 shrink-0">
          <h2 className="text-sm font-bold text-surface-900">Customer Detail</h2>
          <div className="flex items-center gap-1.5">
            {mode === 'view' && customer && (
              <button onClick={() => setMode('edit')} className="btn-ghost text-xs gap-1.5 border border-surface-200">
                <I.Edit className="w-3.5 h-3.5" /> Edit
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-100 text-surface-500">
              <I.X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 space-y-5">
          {loading && <div className="flex justify-center py-12"><Spinner /></div>}
          {err && <ErrorState message={err} onRetry={load} />}

          {!loading && !err && customer && (
            <>
              {/* Edit form */}
              {mode === 'edit' && (
                <div>
                  <p className="text-xs font-semibold text-surface-700 mb-3">Edit customer</p>
                  <CustomerForm initial={customer} onSave={handleSave} onCancel={() => setMode('view')} />
                </div>
              )}

              {mode === 'view' && (
                <>
                  {/* Profile header */}
                  <div className="flex items-start gap-3">
                    <Avatar name={customer.name} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-surface-900 text-base leading-snug">{customer.name}</h3>

                      {/* Contact info */}
                      <div className="mt-1.5 space-y-1">
                        <p className="flex items-center gap-1.5 text-xs text-surface-600">
                          <I.Phone className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                          {customer.phone}
                        </p>
                        {customer.email && (
                          <p className="flex items-center gap-1.5 text-xs text-surface-600">
                            <I.Mail className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                            {customer.email}
                          </p>
                        )}
                        {customer.address && (
                          <p className="flex items-center gap-1.5 text-xs text-surface-600">
                            <I.Location className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                            {customer.address}
                          </p>
                        )}
                        {customer.preferred_time && (
                          <p className="flex items-center gap-1.5 text-xs text-surface-500">
                            <I.Clock className="w-3.5 h-3.5 text-surface-400 shrink-0" />
                            Prefers <span className="capitalize font-medium ml-0.5">{customer.preferred_time}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Job count badge */}
                    <div className="shrink-0 text-center bg-surface-50 border border-surface-200 rounded-md px-3 py-2">
                      <p className="text-xl font-bold text-surface-900 tabular-nums">{customer.total_jobs}</p>
                      <p className="text-2xs text-surface-400 font-medium">Total jobs</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Link
                      to={`/appointments?search=${encodeURIComponent(customer.phone)}`}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-surface-200 rounded-md text-xs font-medium text-surface-700 hover:bg-surface-50 transition-colors"
                    >
                      <I.Calendar className="w-3.5 h-3.5" /> View appointments
                    </Link>
                    <Link
                      to="/ai-ops"
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-500 text-white rounded-md text-xs font-medium hover:bg-brand-600 transition-colors"
                    >
                      <I.Plus className="w-3.5 h-3.5" /> New appointment
                    </Link>
                  </div>

                  {/* Upcoming appointment */}
                  {upcoming.length > 0 && (
                    <div>
                      <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Upcoming</p>
                      <div className="space-y-1.5">
                        {upcoming.map((u, i) => (
                          <div key={i} className="flex items-center gap-3 bg-brand-50 border border-brand-200 rounded-md px-3 py-2">
                            <I.Calendar className="w-4 h-4 text-brand-500 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-brand-800 capitalize">
                                {(u.skill || 'Service').replace('_', ' ')}
                              </p>
                              <p className="text-2xs text-brand-600">{u.date} · {u.time_slot || 'No time set'}</p>
                            </div>
                            <StatusBadge status={u.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Service history */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">
                        Service history
                        {history.length > 0 && (
                          <span className="ml-1.5 font-bold text-surface-700">{history.length}</span>
                        )}
                      </p>
                    </div>

                    {history.length === 0 ? (
                      <div className="bg-surface-50 border border-surface-200 rounded-md px-4 py-5 text-center">
                        <p className="text-sm font-medium text-surface-600">No service history yet.</p>
                        <p className="text-xs text-surface-400 mt-1">Book an appointment to get started.</p>
                      </div>
                    ) : (
                      <div className="bg-white border border-surface-200 rounded-md overflow-hidden">
                        {/* Column headers */}
                        <div className="flex items-center gap-3 px-3 py-2 bg-surface-50 border-b border-surface-200">
                          <span className="w-20 shrink-0 text-2xs font-semibold text-surface-400 uppercase tracking-wider">Date</span>
                          <span className="flex-1 text-2xs font-semibold text-surface-400 uppercase tracking-wider">Service</span>
                          <span className="text-right text-2xs font-semibold text-surface-400 uppercase tracking-wider">Invoice</span>
                          <span className="w-16 shrink-0 text-2xs font-semibold text-surface-400 uppercase tracking-wider text-right">Status</span>
                        </div>
                        <div className="px-3">
                          {visibleHistory.map((job, i) => (
                            <HistoryRow key={i} job={job} />
                          ))}
                        </div>
                        {history.length > historyLimit && (
                          <div className="px-3 py-2 border-t border-surface-100 bg-surface-50">
                            <button
                              onClick={() => setHistoryLimit(l => l + 10)}
                              className="text-xs text-brand-600 hover:text-brand-700 font-medium"
                            >
                              Show {Math.min(10, history.length - historyLimit)} more…
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  )
}

// ── Add Customer modal ────────────────────────────────────────────────────────
function AddCustomerModal({ onClose, onCreated }) {
  const handleSave = async (form) => {
    await createCustomer(form)
    onCreated()
    onClose()
  }
  return (
    <>
      <div className="fixed inset-0 z-30 bg-surface-900/40" onClick={onClose} />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="bg-white border border-surface-200 rounded-lg shadow-card-md w-full max-w-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-surface-900">Add customer</h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-100 text-surface-500">
              <I.X className="w-4 h-4" />
            </button>
          </div>
          <CustomerForm onSave={handleSave} onCancel={onClose} />
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Customers() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [search, setSearch]     = useState('')
  const [applied, setApplied]   = useState('')
  const [selectedPhone, setSelectedPhone] = useState(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [toast, setToast]       = useState(null)
  const showToast = (msg, type = 'success') => setToast({ message: msg, type })

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

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight">Customers</h1>
          <p className="text-sm text-surface-500 mt-0.5">Customer records and service history.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => load(applied)} className="btn-ghost text-xs border border-surface-200 gap-1.5">
            <I.Refresh className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs gap-1.5">
            <I.Plus className="w-3.5 h-3.5" /> Add customer
          </button>
        </div>
      </div>

      {/* ── Search ── */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative">
          <I.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
          <input
            className="df-input pl-8 text-xs w-72"
            placeholder="Search by name, phone or email…"
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

      {/* ── Table ── */}
      <div className="bg-white border border-surface-200 rounded-lg shadow-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={6} cols={7} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(applied)} />
        ) : data.length === 0 ? (
          <EmptyState
            title={applied ? `No results for "${applied}"` : 'No customers yet'}
            description={applied
              ? 'Try a different name, phone number or email.'
              : 'Add your first customer or book a service via the AI agent.'}
            action={
              !applied
                ? <button onClick={() => setShowAdd(true)} className="btn-primary text-sm gap-1.5"><I.Plus className="w-4 h-4" /> Add customer</button>
                : <button onClick={clearSearch} className="btn-ghost text-sm border border-surface-200">Clear search</button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Address</th>
                  <th>Jobs</th>
                  <th>Last service</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => (
                  <tr
                    key={c._id}
                    className="cursor-pointer"
                    onClick={() => setSelectedPhone(c.phone)}
                  >
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
                    <td className="text-surface-500 max-w-[180px] truncate">{c.address || '—'}</td>
                    <td>
                      <span className={`text-sm font-bold tabular-nums ${c.total_jobs > 0 ? 'text-surface-800' : 'text-surface-400'}`}>
                        {c.total_jobs ?? 0}
                      </span>
                    </td>
                    <td>
                      {c.last_service_date ? (
                        <div>
                          <p className="text-xs font-medium text-surface-700 tabular-nums">{c.last_service_date}</p>
                          <p className="text-2xs text-surface-400 capitalize">{(c.last_service_skill || '').replace('_', ' ')}</p>
                        </div>
                      ) : (
                        <span className="text-surface-400 text-xs">No history</span>
                      )}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedPhone(c.phone)}
                        className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-0.5"
                      >
                        View <I.ChevronR className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Count */}
      {!loading && !error && (
        <p className="mt-2 text-xs text-surface-400 text-right">
          {data.length} customer{data.length !== 1 ? 's' : ''}
          {applied && ` matching "${applied}"`}
        </p>
      )}

      {/* Detail drawer */}
      {selectedPhone && (
        <CustomerDrawer
          phone={selectedPhone}
          onClose={() => setSelectedPhone(null)}
          onUpdated={() => load(applied)}
        />
      )}

      {/* Add modal */}
      {showAdd && (
        <AddCustomerModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { load(applied); showToast('Customer added successfully') }}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </AppShell>
  )
}
