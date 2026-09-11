import { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import AppShell from '../components/layout/AppShell'
import StatusBadge from '../components/ui/StatusBadge'
import EmptyState from '../components/ui/EmptyState'
import ErrorState from '../components/ui/ErrorState'
import { TableSkeleton, Spinner } from '../components/ui/LoadingState'
import {
  fetchTechnicians,
  fetchTechnician,
  createTechnician,
  updateTechnician,
  addUnavailableDate,
  removeUnavailableDate,
} from '../api/data'

// ── Icons ─────────────────────────────────────────────────────────────────────
const I = {
  Plus:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  Refresh:  (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  X:        (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>,
  Check:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>,
  Edit:     (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125" /></svg>,
  Calendar: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>,
  Phone:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.338c0-1.28 1.395-2.077 2.512-1.42l4.384 2.583a1.5 1.5 0 0 1 .39 2.218l-.808 1.075a.75.75 0 0 0-.09.625 12.034 12.034 0 0 0 6.933 6.933.75.75 0 0 0 .625-.09l1.075-.808a1.5 1.5 0 0 1 2.218.39l2.583 4.384c.658 1.117-.14 2.512-1.42 2.512h-.537c-8.284 0-15-6.716-15-15v-.537Z" /></svg>,
  Wrench:   (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.655m5.657-5.657 1.857-.248.921 2.18-1.07 1.07-2.18-.921.248-1.857Z" /></svg>,
  Star:     (p) => <svg {...p} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" /></svg>,
  Trash:    (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>,
  ChevronR: (p) => <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>,
}

const SKILLS_LIST = ['AC', 'refrigerator', 'washing_machine', 'microwave', 'geyser']
const SKILL_FILTER = ['', ...SKILLS_LIST]
const TODAY = new Date().toISOString().slice(0, 10)

// ── Availability status badge ─────────────────────────────────────────────────
function AvailBadge({ status }) {
  const cfg = {
    available:   { cls: 'bg-green-50 text-green-700 border-green-200',   dot: 'bg-green-500',   label: 'Available'   },
    busy:        { cls: 'bg-amber-50 text-amber-700 border-amber-200',   dot: 'bg-amber-500',   label: 'Busy'        },
    unavailable: { cls: 'bg-surface-100 text-surface-500 border-surface-200', dot: 'bg-surface-400', label: 'Unavailable' },
  }[status] || { cls: 'bg-surface-100 text-surface-500 border-surface-200', dot: 'bg-surface-300', label: status }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-2xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

function SkillTag({ skill, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-2xs font-medium bg-surface-100 text-surface-600 border border-surface-200 capitalize">
      {skill.replace('_', ' ')}
      {onRemove && (
        <button onClick={() => onRemove(skill)} className="ml-0.5 hover:text-red-500 leading-none">
          <I.X className="w-2.5 h-2.5" />
        </button>
      )}
    </span>
  )
}

function StarRating({ rating }) {
  const r = parseFloat(rating) || 0
  return (
    <span className="flex items-center gap-1">
      <I.Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <span className="text-xs font-semibold text-surface-700 tabular-nums">{r.toFixed(1)}</span>
    </span>
  )
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

// ── Today's schedule timeline ─────────────────────────────────────────────────
function DayTimeline({ appointments }) {
  if (!appointments || appointments.length === 0) {
    return (
      <div className="flex items-center gap-2 py-4 px-3 bg-green-50 rounded-md border border-green-200">
        <I.Check className="w-4 h-4 text-green-500 shrink-0" />
        <span className="text-sm text-green-700 font-medium">Free today — no appointments scheduled.</span>
      </div>
    )
  }

  // Sort by time_slot
  const sorted = [...appointments].sort((a, b) =>
    (a.time_slot || '').localeCompare(b.time_slot || '')
  )

  return (
    <div className="space-y-0">
      {sorted.map((appt, i) => (
        <div key={appt._id} className="flex gap-3 items-start">
          {/* Time + connector line */}
          <div className="flex flex-col items-center w-16 shrink-0">
            <span className="text-xs tabular-nums text-surface-500 font-medium leading-none mt-0.5">
              {appt.time_slot || '—'}
            </span>
            {i < sorted.length - 1 && (
              <div className="w-px flex-1 bg-surface-200 my-1 min-h-[20px]" />
            )}
          </div>
          {/* Job block */}
          <div className={`flex-1 mb-3 rounded-md border px-3 py-2 ${
            appt.status === 'in_progress'
              ? 'bg-amber-50 border-amber-200'
              : appt.status === 'completed'
                ? 'bg-green-50 border-green-100'
                : 'bg-white border-surface-200'
          }`}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-surface-800 capitalize">
                {(appt.skill || 'Service').replace('_', ' ')}
              </span>
              <StatusBadge status={appt.status} />
            </div>
            <p className="text-xs text-surface-500 mt-0.5">{appt.customer_name}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Technician Form (create / edit) ──────────────────────────────────────────
function TechnicianForm({ initial, onSave, onCancel }) {
  const editing = !!initial
  const [form, setForm] = useState({
    name:             initial?.name             || '',
    phone:            initial?.phone            || '',
    experience_years: initial?.experience_years || '',
    rating:           initial?.rating           || '',
    skills:           initial?.skills           || [],
  })
  const [busy, setBusy]   = useState(false)
  const [err,  setErr]    = useState('')
  const [skillInput, setSkillInput] = useState('')

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const addSkill = (s) => {
    const sk = s.trim()
    if (sk && !form.skills.includes(sk)) set('skills', [...form.skills, sk])
    setSkillInput('')
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.phone.trim()) { setErr('Name and phone are required.'); return }
    setBusy(true); setErr('')
    try {
      const payload = {
        ...form,
        experience_years: form.experience_years ? parseInt(form.experience_years) : 0,
        rating: form.rating ? parseFloat(form.rating) : 0,
      }
      await onSave(payload)
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 pt-1">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-surface-600 mb-1">Full name *</label>
          <input className="df-input text-xs" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="e.g. Ravi Prasad" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Phone *</label>
          <input className="df-input text-xs" value={form.phone} onChange={e => set('phone', e.target.value)} required placeholder="9800000001" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Experience (years)</label>
          <input type="number" min="0" max="50" className="df-input text-xs" value={form.experience_years} onChange={e => set('experience_years', e.target.value)} placeholder="5" />
        </div>
        <div>
          <label className="block text-xs font-medium text-surface-600 mb-1">Rating (0–5)</label>
          <input type="number" step="0.1" min="0" max="5" className="df-input text-xs" value={form.rating} onChange={e => set('rating', e.target.value)} placeholder="4.5" />
        </div>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-xs font-medium text-surface-600 mb-1.5">Skills</label>
        <div className="flex flex-wrap gap-1 mb-2">
          {form.skills.map((s) => (
            <SkillTag key={s} skill={s} onRemove={(sk) => set('skills', form.skills.filter(x => x !== sk))} />
          ))}
        </div>
        <div className="flex gap-2">
          <select
            className="df-select text-xs flex-1"
            value={skillInput}
            onChange={e => setSkillInput(e.target.value)}
          >
            <option value="">Select a skill…</option>
            {SKILLS_LIST.filter(s => !form.skills.includes(s)).map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>
          <button type="button" onClick={() => addSkill(skillInput)} className="btn-ghost text-xs border border-surface-200 px-3">
            Add
          </button>
        </div>
      </div>

      {err && <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{err}</p>}

      <div className="flex gap-2 pt-1 border-t border-surface-100">
        <button type="submit" disabled={busy} className="btn-primary text-xs">
          {busy ? <Spinner size="sm" /> : editing ? 'Save changes' : 'Add technician'}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost text-xs border border-surface-200">Cancel</button>
      </div>
    </form>
  )
}

// ── Detail Drawer ─────────────────────────────────────────────────────────────
function TechnicianDrawer({ techId, onClose, onUpdated }) {
  const [tech, setTech]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr]         = useState(null)
  const [busy, setBusy]       = useState(false)
  const [toast, setToast]     = useState(null)
  const [mode, setMode]       = useState('view') // 'view' | 'edit' | 'unavail'
  const [newDate, setNewDate] = useState('')

  const showToast = (message, type = 'success') => setToast({ message, type })

  const load = useCallback(async () => {
    setLoading(true); setErr(null)
    try { setTech(await fetchTechnician(techId)) }
    catch (e) { setErr(e.message) }
    finally { setLoading(false) }
  }, [techId])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const handleSave = async (payload) => {
    await updateTechnician(techId, payload)
    showToast('Technician updated')
    setMode('view')
    load(); onUpdated()
  }

  const handleAddDate = async (e) => {
    e.preventDefault()
    if (!newDate) return
    setBusy(true)
    try {
      await addUnavailableDate(techId, newDate)
      showToast(`Marked unavailable: ${newDate}`)
      setNewDate('')
      load(); onUpdated()
    } catch (ex) {
      showToast(ex.message, 'error')
    } finally { setBusy(false) }
  }

  const handleRemoveDate = async (date) => {
    setBusy(true)
    try {
      await removeUnavailableDate(techId, date)
      showToast(`Removed: ${date}`)
      load(); onUpdated()
    } catch (ex) {
      showToast(ex.message, 'error')
    } finally { setBusy(false) }
  }

  const upcomingUnavail = (tech?.unavailable_dates || [])
    .filter(d => d >= TODAY)
    .sort()

  return (
    <>
      <div className="fixed inset-0 z-30 bg-surface-900/30" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-md bg-white border-l border-surface-200 shadow-card-md flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-surface-900">Technician Detail</h2>
            {tech && <p className="text-xs text-surface-400 mt-0.5">{tech.name} · {tech.phone}</p>}
          </div>
          <div className="flex items-center gap-1">
            {mode === 'view' && tech && (
              <>
                <button onClick={() => setMode('edit')} className="btn-ghost text-xs gap-1.5 border border-surface-200">
                  <I.Edit className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => setMode('unavail')} className="btn-ghost text-xs gap-1.5 border border-surface-200">
                  <I.Calendar className="w-3.5 h-3.5" /> Set off day
                </button>
              </>
            )}
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-100 text-surface-500 ml-1">
              <I.X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scroll-thin px-5 py-4 space-y-5">
          {loading && <div className="flex justify-center py-12"><Spinner /></div>}
          {err && <ErrorState message={err} onRetry={load} />}

          {!loading && !err && tech && (
            <>
              {/* Edit form */}
              {mode === 'edit' && (
                <div>
                  <p className="text-xs font-semibold text-surface-700 mb-3">Edit technician</p>
                  <TechnicianForm initial={tech} onSave={handleSave} onCancel={() => setMode('view')} />
                </div>
              )}

              {/* Set unavailable date */}
              {mode === 'unavail' && (
                <div className="bg-surface-50 border border-surface-200 rounded-md p-4">
                  <p className="text-xs font-semibold text-surface-700 mb-3">Mark as unavailable</p>
                  <form onSubmit={handleAddDate} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-xs text-surface-500 mb-1">Date</label>
                      <input type="date" className="df-input text-xs" value={newDate} onChange={e => setNewDate(e.target.value)} min={TODAY} required />
                    </div>
                    <button type="submit" disabled={busy} className="btn-primary text-xs">
                      {busy ? <Spinner size="sm" /> : 'Mark off'}
                    </button>
                    <button type="button" onClick={() => setMode('view')} className="btn-ghost text-xs border border-surface-200">Cancel</button>
                  </form>
                </div>
              )}

              {mode === 'view' && (
                <>
                  {/* Profile */}
                  <div className="flex items-center gap-3">
                    <span className="w-11 h-11 rounded-full bg-brand-100 text-brand-700 font-bold text-base flex items-center justify-center shrink-0">
                      {tech.name?.[0] || '?'}
                    </span>
                    <div>
                      <p className="font-bold text-surface-900">{tech.name}</p>
                      <p className="text-xs text-surface-500 flex items-center gap-1 mt-0.5">
                        <I.Phone className="w-3 h-3" /> {tech.phone}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <AvailBadge status={tech.availability_status} />
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Experience', value: tech.experience_years ? `${tech.experience_years} yrs` : '—' },
                      { label: 'Rating',     value: <StarRating rating={tech.rating} /> },
                      { label: "Today's jobs", value: tech.today_appointments?.length ?? 0 },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-surface-50 border border-surface-100 rounded-md px-3 py-2 text-center">
                        <p className="text-2xs text-surface-400 uppercase tracking-wider font-semibold">{label}</p>
                        <p className="mt-1 text-sm font-bold text-surface-800 flex justify-center">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div>
                    <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(tech.skills || []).map(s => <SkillTag key={s} skill={s} />)}
                      {!tech.skills?.length && <span className="text-xs text-surface-400">No skills listed.</span>}
                    </div>
                  </div>

                  {/* Today's schedule */}
                  <div>
                    <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">
                      Today's Schedule — {tech.today}
                    </p>
                    <DayTimeline appointments={tech.today_appointments} />
                  </div>

                  {/* Upcoming appointments */}
                  {tech.upcoming_appointments?.length > 0 && (
                    <div>
                      <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Upcoming jobs</p>
                      <div className="bg-white border border-surface-200 rounded-md overflow-hidden">
                        {tech.upcoming_appointments.map((a) => (
                          <div key={a._id} className="flex items-center justify-between px-3 py-2 border-b border-surface-100 last:border-0 gap-3">
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-surface-800 truncate">{a.customer_name}</p>
                              <p className="text-xs text-surface-400 capitalize">{(a.skill || '').replace('_', ' ')} · {a.date}</p>
                            </div>
                            <StatusBadge status={a.status} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Unavailable dates */}
                  <div>
                    <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Unavailable dates</p>
                    {upcomingUnavail.length === 0 ? (
                      <p className="text-xs text-surface-400 bg-surface-50 rounded px-3 py-2">
                        No upcoming unavailable dates.
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {upcomingUnavail.map((d) => (
                          <div key={d} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-md px-3 py-1.5">
                            <span className={`text-xs tabular-nums font-medium ${d === TODAY ? 'text-red-700' : 'text-surface-700'}`}>
                              {d}
                              {d === TODAY && <span className="ml-2 text-2xs bg-red-200 text-red-700 px-1.5 py-0.5 rounded font-bold">Today</span>}
                            </span>
                            <button
                              onClick={() => handleRemoveDate(d)}
                              disabled={busy}
                              className="text-xs text-red-500 hover:text-red-700 flex items-center gap-0.5 disabled:opacity-50"
                            >
                              <I.Trash className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={() => setMode('unavail')}
                      className="mt-2 text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                    >
                      <I.Plus className="w-3 h-3" /> Add date
                    </button>
                  </div>

                  {/* View appointments link */}
                  <div className="pt-1">
                    <Link
                      to={`/appointments?technician=${encodeURIComponent(tech.name || '')}`}
                      className="flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium"
                    >
                      View all appointments for {tech.name}
                      <I.ChevronR className="w-3 h-3" />
                    </Link>
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

// ── Add Technician modal ──────────────────────────────────────────────────────
function AddTechnicianModal({ onClose, onCreated }) {
  const handleSave = async (payload) => {
    await createTechnician(payload)
    onCreated()
    onClose()
  }
  return (
    <>
      <div className="fixed inset-0 z-30 bg-surface-900/40" onClick={onClose} />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="bg-white border border-surface-200 rounded-lg shadow-card-md w-full max-w-md p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-surface-900">Add technician</h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-100 text-surface-500">
              <I.X className="w-4 h-4" />
            </button>
          </div>
          <TechnicianForm onSave={handleSave} onCancel={onClose} />
        </div>
      </div>
    </>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Technicians() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [skill, setSkill]       = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showAdd, setShowAdd]   = useState(false)
  const [toast, setToast]       = useState(null)
  const showToast = (msg, type = 'success') => setToast({ message: msg, type })

  const load = useCallback((s = skill) => {
    setLoading(true); setError(null)
    fetchTechnicians(s)
      .then((r) => setData(r.technicians || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [skill])

  useEffect(() => { load() }, [])

  const handleSkill = (s) => { setSkill(s); load(s) }

  // Derived status counts for the header
  const available   = data.filter(t => t.availability_status === 'available').length
  const busy        = data.filter(t => t.availability_status === 'busy').length
  const unavailable = data.filter(t => t.availability_status === 'unavailable').length

  return (
    <AppShell title="Technicians">
      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-lg font-bold text-surface-900 tracking-tight">Technicians</h1>
          <p className="text-sm text-surface-500 mt-0.5">Manage your service team, skills and availability.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => load(skill)} className="btn-ghost text-xs border border-surface-200 gap-1.5">
            <I.Refresh className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-xs gap-1.5">
            <I.Plus className="w-3.5 h-3.5" /> Add technician
          </button>
        </div>
      </div>

      {/* ── Status summary strip ── */}
      {!loading && data.length > 0 && (
        <div className="flex gap-3 mb-4">
          {[
            { label: 'Available', count: available,   color: 'text-green-700 bg-green-50 border-green-200'   },
            { label: 'Busy',      count: busy,         color: 'text-amber-700 bg-amber-50 border-amber-200'   },
            { label: 'Off today', count: unavailable,  color: 'text-surface-500 bg-surface-50 border-surface-200' },
          ].map(({ label, count, color }) => (
            <div key={label} className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-semibold ${color}`}>
              <span className="text-sm font-bold">{count}</span>
              <span className="font-medium opacity-75">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Skill filter pills ── */}
      <div className="flex gap-1 flex-wrap mb-4">
        {SKILL_FILTER.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => handleSkill(s)}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              skill === s
                ? 'bg-brand-500 text-white border-brand-500'
                : 'bg-white text-surface-600 border-surface-200 hover:border-surface-300'
            }`}
          >
            {s ? s.replace('_', ' ') : 'All skills'}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-surface-200 rounded-lg shadow-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={() => load(skill)} />
        ) : data.length === 0 ? (
          <EmptyState
            title="No technicians found"
            description={skill ? `No technicians with "${skill.replace('_', ' ')}" skill.` : 'Add your first technician to start assigning jobs.'}
            action={
              <button onClick={() => setShowAdd(true)} className="btn-primary text-sm gap-1.5">
                <I.Plus className="w-4 h-4" /> Add technician
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Skills</th>
                  <th>Experience</th>
                  <th>Rating</th>
                  <th>Today's jobs</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.map((t) => (
                  <tr key={t._id} className="cursor-pointer" onClick={() => setSelectedId(t._id)}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-full bg-surface-100 flex items-center justify-center text-xs font-bold text-surface-600 shrink-0">
                          {t.name?.[0] || '?'}
                        </span>
                        <span className="font-medium text-surface-800">{t.name}</span>
                      </div>
                    </td>
                    <td className="tabular-nums text-surface-500">{t.phone}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(t.skills || []).map((s) => <SkillTag key={s} skill={s} />)}
                      </div>
                    </td>
                    <td className="text-surface-600 tabular-nums">
                      {t.experience_years ? `${t.experience_years} yrs` : '—'}
                    </td>
                    <td><StarRating rating={t.rating} /></td>
                    <td>
                      <span className={`text-sm font-bold tabular-nums ${t.todays_job_count > 0 ? 'text-amber-600' : 'text-surface-400'}`}>
                        {t.todays_job_count ?? 0}
                      </span>
                    </td>
                    <td><AvailBadge status={t.availability_status} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedId(t._id)}
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

      {!loading && !error && (
        <p className="mt-2 text-xs text-surface-400 text-right">
          {data.length} technician{data.length !== 1 ? 's' : ''}
          {skill && ` · filtered by "${skill.replace('_', ' ')}"`}
        </p>
      )}

      {/* Detail drawer */}
      {selectedId && (
        <TechnicianDrawer
          techId={selectedId}
          onClose={() => setSelectedId(null)}
          onUpdated={() => load(skill)}
        />
      )}

      {/* Add modal */}
      {showAdd && (
        <AddTechnicianModal
          onClose={() => setShowAdd(false)}
          onCreated={() => { load(skill); showToast('Technician added successfully') }}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </AppShell>
  )
}
