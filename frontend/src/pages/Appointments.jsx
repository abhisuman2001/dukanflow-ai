import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { TableSkeleton, Spinner } from '../components/ui/LoadingState'
import {
  fetchAppointments,
  fetchAppointment,
  updateAppointmentStatus,
  generateInvoiceForAppointment,
  scheduleFollowupForAppointment,
} from '../api/data'

// ── Icons ─────────────────────────────────────────────────────────────────────
const I = {
  Plus:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Search:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>,
  X:        (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>,
  Refresh:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  Wrench:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.655m5.657-5.657 1.857-.248.921 2.18-1.07 1.07-2.18-.921.248-1.857Zm-5.657 5.657-1.857.248-.921-2.18 1.07-1.07 2.18.921-.248 1.857Z" /></svg>,
  Receipt:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185Z" /></svg>,
  Bell:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" /></svg>,
  Check:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
  Alert:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>,
  ChevronR: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>,
  Filter:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" /></svg>,
  User:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>,
}

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ['', 'scheduled', 'assigned', 'in_progress', 'completed', 'cancelled', 'confirmed']
const SKILLS   = ['', 'AC', 'refrigerator', 'washing_machine', 'microwave', 'geyser']

// Valid forward transitions
const NEXT_STATUSES = {
  scheduled:   ['assigned', 'in_progress', 'cancelled'],
  confirmed:   ['assigned', 'in_progress', 'cancelled'],
  assigned:    ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed:   [],
  cancelled:   [],
}

// ── Toast notification ────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast])
  if (!toast) return null
  const colors = {
    success: 'bg-green-600 text-white',
    error:   'bg-red-600 text-white',
    info:    'bg-surface-800 text-white',
  }
  return (
    <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-card-md text-sm font-medium ${colors[toast.type] || colors.info}`}>
      {toast.type === 'success' && <I.Check className="w-4 h-4 shrink-0" />}
      {toast.type === 'error'   && <I.Alert className="w-4 h-4 shrink-0" />}
      {toast.message}
      <button onClick={onDismiss} className="ml-2 opacity-70 hover:opacity-100"><I.X className="w-3.5 h-3.5" /></button>
    </div>
  )
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', danger = false, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-900/50" onClick={onCancel} />
      <div className="relative bg-white rounded-lg shadow-card-md border border-surface-200 w-full max-w-sm p-5">
        <h3 className="text-sm font-semibold text-surface-900 mb-1.5">{title}</h3>
        <p className="text-sm text-surface-500 mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="btn-ghost text-xs border border-surface-200">Cancel</button>
          <button
            onClick={onConfirm}
            className={`px-3.5 py-2 rounded-md text-xs font-medium transition-colors ${
              danger ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-brand-500 text-white hover:bg-brand-600'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Detail row inside drawer ──────────────────────────────────────────────────
function DetailRow({ label, value, mono = false }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-surface-100 last:border-0">
      <span className="text-xs text-surface-500 shrink-0">{label}</span>
      <span className={`text-xs text-surface-800 text-right ${mono ? 'font-mono' : 'font-medium'}`}>
        {value || '—'}
      </span>
    </div>
  )
}

// ── Activity entry in drawer ──────────────────────────────────────────────────
const ACTION_LABELS = {
  customer_lookup:     'Customer lookup',
  technician_assigned: 'Technician assigned',
  job_status_updated:  'Status updated',
  invoice_generated:   'Invoice generated',
  followup_scheduled:  'Follow-up scheduled',
}
function ActivityRow({ entry }) {
  const time = entry.ts
    ? new Date(entry.ts).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })
    : ''
  return (
    <div className="flex items-start gap-2.5 py-2 border-b border-surface-100 last:border-0">
      <div className="w-1.5 h-1.5 rounded-full bg-surface-300 mt-1.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-surface-700">{entry.description}</p>
        <p className="text-2xs text-surface-400 mt-0.5">{time}</p>
      </div>
    </div>
  )
}

// ── Schedule Follow-up form ───────────────────────────────────────────────────
function FollowUpForm({ appointmentId, onSuccess, onCancel }) {
  const [date, setDate]     = useState('')
  const [reason, setReason] = useState('')
  const [busy, setBusy]     = useState(false)
  const [err, setErr]       = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!date || !reason.trim()) { setErr('Date and reason are required.'); return }
    setBusy(true); setErr('')
    try {
      const r = await scheduleFollowupForAppointment(appointmentId, date, reason.trim())
      onSuccess(r)
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 pt-2">
      <div>
        <label className="block text-xs font-medium text-surface-600 mb-1">Follow-up date</label>
        <input type="date" className="df-input text-xs" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div>
        <label className="block text-xs font-medium text-surface-600 mb-1">Reason</label>
        <input className="df-input text-xs" placeholder="e.g. Post-service quality check"
          value={reason} onChange={e => setReason(e.target.value)} required />
      </div>
      {err && <p className="text-xs text-red-600">{err}</p>}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={busy} className="btn-primary text-xs">
          {busy ? <Spinner size="sm" /> : 'Schedule Follow-up'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-xs border border-surface-200">Cancel</button>
      </div>
    </form>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function AppointmentDrawer({ appointmentId, onClose, onUpdated }) {
  const [appt, setAppt]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr]         = useState(null)
  const [busy, setBusy]       = useState(false)
  const [confirm, setConfirm] = useState(null)   // { action, label, danger, onConfirm }
  const [showFup, setShowFup] = useState(false)
  const [toast, setToast]     = useState(null)
  const drawerRef             = useRef()

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback(async () => {
    setLoading(true); setErr(null)
    try { setAppt(await fetchAppointment(appointmentId)) }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }, [appointmentId])

  useEffect(() => { load() }, [load])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const doStatusChange = async (newStatus) => {
    setBusy(true)
    try {
      await updateAppointmentStatus(appointmentId, newStatus)
      showToast(`Status updated to "${newStatus}"`)
      await load()
      onUpdated()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setBusy(false)
      setConfirm(null)
    }
  }

  const requestStatusChange = (newStatus) => {
    if (newStatus === 'cancelled') {
      setConfirm({
        title: 'Cancel appointment?',
        message: 'This will mark the appointment as cancelled. This action cannot be undone easily.',
        confirmLabel: 'Yes, cancel it',
        danger: true,
        onConfirm: () => doStatusChange(newStatus),
      })
    } else {
      doStatusChange(newStatus)
    }
  }

  const doGenerateInvoice = async () => {
    setBusy(true)
    try {
      await generateInvoiceForAppointment(appointmentId)
      showToast('Invoice generated successfully')
      await load()
      onUpdated()
    } catch (e) {
      showToast(e.message, 'error')
    } finally {
      setBusy(false)
      setConfirm(null)
    }
  }

  const nextStatuses = appt ? (NEXT_STATUSES[appt.status] || []) : []
  const canInvoice   = appt?.status === 'completed' && !appt?.invoice
  const canFollowup  = !appt?.followup

  const statusLabel = {
    assigned:    'Mark Assigned',
    in_progress: 'Start Job',
    completed:   'Mark Completed',
    cancelled:   'Cancel Job',
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-30 bg-surface-900/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-white border-l border-surface-200 shadow-card-md flex flex-col overflow-hidden"
        role="dialog"
        aria-label="Appointment details"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div>
            <h2 className="text-sm font-bold text-surface-900">Appointment Details</h2>
            {appt && (
              <p className="text-xs text-surface-400 mt-0.5">
                {appt.customer_name} · {appt.date}
              </p>
            )}
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-100 text-surface-500">
            <I.X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 space-y-5">
          {loading && (
            <div className="flex justify-center py-12"><Spinner /></div>
          )}
          {err && <ErrorState message={err} onRetry={load} />}

          {!loading && !err && appt && (
            <>
              {/* Status + quick actions */}
              <div className="flex items-center gap-3">
                <StatusBadge status={appt.status} />
                {busy && <Spinner size="sm" />}
              </div>

              {/* Status flow buttons */}
              {nextStatuses.length > 0 && (
                <div>
                  <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Change Status</p>
                  <div className="flex flex-wrap gap-2">
                    {nextStatuses.map((s) => (
                      <button
                        key={s}
                        disabled={busy}
                        onClick={() => requestStatusChange(s)}
                        className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors disabled:opacity-50 ${
                          s === 'cancelled'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-surface-200 text-surface-700 hover:bg-surface-50 hover:border-surface-300'
                        }`}
                      >
                        {statusLabel[s] || s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer info */}
              <div>
                <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Customer</p>
                <div className="bg-surface-50 rounded-md px-3 py-1">
                  <DetailRow label="Name"    value={appt.customer_name} />
                  <DetailRow label="Phone"   value={appt.customer_phone} mono />
                </div>
              </div>

              {/* Service info */}
              <div>
                <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Service</p>
                <div className="bg-surface-50 rounded-md px-3 py-1">
                  <DetailRow label="Type"      value={(appt.skill || '').replace('_', ' ')} />
                  <DetailRow label="Date"      value={appt.date} mono />
                  <DetailRow label="Time slot" value={appt.time_slot} />
                  <DetailRow label="Notes"     value={appt.notes} />
                </div>
              </div>

              {/* Technician */}
              <div>
                <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Technician</p>
                <div className="bg-surface-50 rounded-md px-3 py-1">
                  {appt.technician_name ? (
                    <DetailRow label="Name" value={appt.technician_name} />
                  ) : (
                    <div className="py-2 flex items-center gap-2">
                      <I.Alert className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-xs text-amber-600 font-medium">No technician assigned yet</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div>
                <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Timeline</p>
                <div className="bg-surface-50 rounded-md px-3 py-1">
                  <DetailRow label="Created"    value={appt.created_at ? appt.created_at.slice(0, 19).replace('T', ' ') : '—'} mono />
                  <DetailRow label="Updated"    value={appt.updated_at ? appt.updated_at.slice(0, 19).replace('T', ' ') : '—'} mono />
                </div>
              </div>

              {/* Invoice section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">Invoice</p>
                  {canInvoice && (
                    <button
                      disabled={busy}
                      onClick={() => setConfirm({
                        title: 'Generate invoice?',
                        message: `Generate invoice for ${appt.customer_name}? This creates a permanent record.`,
                        confirmLabel: 'Generate',
                        onConfirm: doGenerateInvoice,
                      })}
                      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium disabled:opacity-50"
                    >
                      <I.Receipt className="w-3.5 h-3.5" /> Generate Invoice
                    </button>
                  )}
                </div>
                {appt.invoice ? (
                  <div className="bg-green-50 border border-green-200 rounded-md px-3 py-1">
                    <DetailRow label="Invoice #" value={appt.invoice.invoice_number} mono />
                    <DetailRow label="Total"     value={`₹${appt.invoice.total?.toLocaleString('en-IN')}`} />
                    <DetailRow label="Status"    value={appt.invoice.status} />
                  </div>
                ) : (
                  <p className="text-xs text-surface-400 bg-surface-50 rounded-md px-3 py-2">
                    {appt.status === 'completed'
                      ? 'No invoice generated yet.'
                      : 'Available after job is completed.'}
                  </p>
                )}
              </div>

              {/* Follow-up section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider">Follow-up</p>
                  {canFollowup && !showFup && (
                    <button
                      onClick={() => setShowFup(true)}
                      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      <I.Bell className="w-3.5 h-3.5" /> Schedule
                    </button>
                  )}
                </div>
                {appt.followup ? (
                  <div className="bg-teal-50 border border-teal-200 rounded-md px-3 py-1">
                    <DetailRow label="Follow-up #" value={appt.followup.followup_number} mono />
                    <DetailRow label="Date"         value={appt.followup.scheduled_for} />
                    <DetailRow label="Reason"       value={appt.followup.reason} />
                    <DetailRow label="Status"       value={appt.followup.status} />
                  </div>
                ) : showFup ? (
                  <FollowUpForm
                    appointmentId={appointmentId}
                    onSuccess={(r) => {
                      showToast(`Follow-up ${r.followup_number} scheduled`)
                      setShowFup(false)
                      load()
                      onUpdated()
                    }}
                    onCancel={() => setShowFup(false)}
                  />
                ) : (
                  <p className="text-xs text-surface-400 bg-surface-50 rounded-md px-3 py-2">
                    No follow-up scheduled.
                  </p>
                )}
              </div>

              {/* Activity history */}
              {appt.activity?.length > 0 && (
                <div>
                  <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-1">Activity History</p>
                  <div className="bg-surface-50 rounded-md px-3">
                    {appt.activity.map((e) => <ActivityRow key={e._id} entry={e} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer footer */}
        <div className="px-5 py-3 border-t border-surface-100 bg-surface-50 flex items-center justify-between">
          <Link to="/ai-ops" className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
            Open in AI Agent <I.ChevronR className="w-3 h-3" />
          </Link>
          <button onClick={onClose} className="btn-ghost text-xs border border-surface-200">Close</button>
        </div>
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        danger={confirm?.danger}
        onConfirm={confirm?.onConfirm}
        onCancel={() => setConfirm(null)}
      />

      {/* Toast */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </>
  )
}

// ── Main Appointments page ────────────────────────────────────────────────────
export default function Appointments() {
  const [data, setData]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [selectedId, setSelectedId] = useState(null)

  // Filter state
  const [search,     setSearch]     = useState('')
  const [status,     setStatus]     = useState('')
  const [date,       setDate]       = useState('')
  const [techFilter, setTechFilter] = useState('')
  const [skill,      setSkill]      = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const activeFilters = [search, status, date, techFilter, skill].filter(Boolean).length

  const load = useCallback((overrides = {}) => {
    setLoading(true); setError(null)
    const params = {
      search:     overrides.search     ?? search,
      status:     overrides.status     ?? status,
      date:       overrides.date       ?? date,
      technician: overrides.technician ?? techFilter,
      skill:      overrides.skill      ?? skill,
    }
    fetchAppointments(params)
      .then((r) => setData(r.appointments || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [search, status, date, techFilter, skill])

  useEffect(() => { load() }, [])

  const applyFilters = () => load()

  const clearFilters = () => {
    setSearch(''); setStatus(''); setDate(''); setTechFilter(''); setSkill('')
    fetchAppointments({})
      .then((r) => setData(r.appointments || []))
      .catch((e) => setError(e.message))
  }

  const handleStatusPill = (s) => {
    const next = status === s ? '' : s
    setStatus(next)
    load({ status: next })
  }

  return (
    <AppShell title="Appointments">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight">Appointments</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage scheduled service jobs and technician assignments.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => load()} className="btn-ghost text-xs border border-surface-200 gap-1.5">
            <I.Refresh className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link to="/ai-ops" className="btn-primary text-xs gap-1.5">
            <I.Plus className="w-3.5 h-3.5" /> New appointment
          </Link>
        </div>
      </div>

      {/* ── Filter bar ── */}
      <div className="mb-4 space-y-2">
        {/* Status pills + search row */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <I.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-surface-400 pointer-events-none" />
            <input
              className="df-input pl-8 pr-3 py-1.5 text-xs w-48"
              placeholder="Customer, technician…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && load()}
            />
          </div>

          {/* Status pills */}
          <div className="flex gap-1 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s || 'all'}
                onClick={() => handleStatusPill(s)}
                className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                  status === s
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
                }`}
              >
                {s ? s.replace('_', ' ') : 'All'}
              </button>
            ))}
          </div>

          {/* More filters toggle */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`btn-ghost text-xs border gap-1.5 ${showFilters ? 'border-brand-300 text-brand-600' : 'border-surface-200'}`}
          >
            <I.Filter className="w-3.5 h-3.5" />
            Filters
            {activeFilters > 0 && (
              <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-2xs flex items-center justify-center font-bold">
                {activeFilters}
              </span>
            )}
          </button>

          {activeFilters > 0 && (
            <button onClick={clearFilters} className="text-xs text-surface-400 hover:text-surface-600 flex items-center gap-1">
              <I.X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Expanded filter row */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 items-end pt-1">
            <div>
              <label className="block text-2xs text-surface-500 mb-1 font-medium">Date</label>
              <input
                type="date" className="df-input text-xs py-1.5"
                value={date} onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-2xs text-surface-500 mb-1 font-medium">Service type</label>
              <select
                className="df-select text-xs py-1.5 w-36"
                value={skill} onChange={(e) => setSkill(e.target.value)}
              >
                {SKILLS.map((s) => (
                  <option key={s} value={s}>{s || 'All services'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-2xs text-surface-500 mb-1 font-medium">Technician</label>
              <input
                className="df-input text-xs py-1.5 w-36"
                placeholder="Name…"
                value={techFilter} onChange={(e) => setTechFilter(e.target.value)}
              />
            </div>
            <button onClick={applyFilters} className="btn-primary text-xs py-1.5">
              Apply
            </button>
          </div>
        )}
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-surface-200 rounded-lg shadow-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={7} cols={7} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load()} />
        ) : data.length === 0 ? (
          <EmptyState
            title={activeFilters ? 'No appointments match your filters' : 'No appointments yet'}
            description={
              activeFilters
                ? 'Try adjusting your filters to see results.'
                : 'Create your first service appointment to start managing today\'s operations.'
            }
            action={
              activeFilters ? (
                <button onClick={clearFilters} className="btn-ghost text-sm border border-surface-200">
                  Clear filters
                </button>
              ) : (
                <Link to="/ai-ops" className="btn-primary text-sm gap-1.5">
                  <I.Plus className="w-4 h-4" /> New appointment
                </Link>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Technician</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr
                    key={a._id}
                    className="cursor-pointer"
                    onClick={() => setSelectedId(a._id)}
                  >
                    <td>
                      <p className="tabular-nums text-surface-800 font-medium text-xs">{a.date}</p>
                      <p className="tabular-nums text-surface-400 text-xs">{a.time_slot || '—'}</p>
                    </td>
                    <td>
                      <p className="font-medium text-surface-800">{a.customer_name}</p>
                      <p className="text-xs text-surface-400 tabular-nums">{a.customer_phone}</p>
                    </td>
                    <td className="capitalize text-surface-600">
                      {(a.skill || '—').replace('_', ' ')}
                    </td>
                    <td>
                      {a.technician_name ? (
                        <span className="text-surface-700">{a.technician_name}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                          <I.Alert className="w-3 h-3" /> Unassigned
                        </span>
                      )}
                    </td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="text-xs text-surface-400 tabular-nums">
                      {a.created_at ? a.created_at.slice(0, 10) : '—'}
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedId(a._id)}
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

      {/* Record count */}
      {!loading && !error && (
        <p className="mt-2 text-xs text-surface-400 text-right">
          {data.length} record{data.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Detail Drawer ── */}
      {selectedId && (
        <AppointmentDrawer
          appointmentId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={() => load()}
        />
      )}

    </AppShell>
  )
}
