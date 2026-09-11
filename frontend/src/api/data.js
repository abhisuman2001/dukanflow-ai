const BASE = '/api/data'

async function get(path) {
  const res = await fetch(BASE + path)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

async function post(path, body = {}) {
  const res = await fetch(BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

async function patch(path, body = {}) {
  const res = await fetch(BASE + path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `Error ${res.status}`)
  }
  return res.json()
}

// ── Reads ─────────────────────────────────────────────────────────────────────
export const fetchDashboard = () => get('/dashboard')

export const fetchAppointments = (params = {}) => {
  const q = new URLSearchParams()
  if (params.status)     q.set('status',     params.status)
  if (params.search)     q.set('search',     params.search)
  if (params.date)       q.set('date',       params.date)
  if (params.technician) q.set('technician', params.technician)
  if (params.skill)      q.set('skill',      params.skill)
  return get(`/appointments?${q}`)
}

export const fetchAppointment = (id) => get(`/appointments/${id}`)

export const fetchCustomers   = (search = '') => get(`/customers?search=${encodeURIComponent(search)}`)
export const fetchTechnicians = (skill  = '') => get(`/technicians?skill=${encodeURIComponent(skill)}`)
export const fetchTechnician  = (id)          => get(`/technicians/${id}`)
export const createTechnician = (body)        => post('/technicians', body)
export const updateTechnician = (id, body)    => patch(`/technicians/${id}`, body)
export const addUnavailableDate    = (id, date) => post(`/technicians/${id}/unavailable`, { date })
export const removeUnavailableDate = (id, date) => {
  return fetch(`/api/data/technicians/${id}/unavailable/${encodeURIComponent(date)}`, { method: 'DELETE' })
    .then(async (res) => {
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.detail || `Error ${res.status}`) }
      return res.json()
    })
}
export const fetchInvoices    = (status = '') => get(`/invoices?status=${encodeURIComponent(status)}`)
export const fetchFollowups   = (status = '') => get(`/followups?status=${encodeURIComponent(status)}`)

// ── Mutations ─────────────────────────────────────────────────────────────────
export const updateAppointmentStatus = (id, status) =>
  patch(`/appointments/${id}/status`, { status })

export const generateInvoiceForAppointment = (id) =>
  post(`/appointments/${id}/invoice`)

export const scheduleFollowupForAppointment = (id, followup_date, reason) =>
  post(`/appointments/${id}/followup`, { followup_date, reason })
