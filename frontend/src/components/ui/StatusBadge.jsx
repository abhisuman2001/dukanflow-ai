/**
 * StatusBadge — compact pill for job/invoice/followup statuses.
 * Clean, high-contrast, no-glows.
 */
const CONFIG = {
  // Appointment statuses
  scheduled:   { dot: 'bg-blue-500',   pill: 'bg-blue-50  text-blue-700  border-blue-200',  label: 'Scheduled'   },
  assigned:    { dot: 'bg-violet-500', pill: 'bg-violet-50 text-violet-700 border-violet-200', label: 'Assigned'  },
  in_progress: { dot: 'bg-amber-500',  pill: 'bg-amber-50 text-amber-700  border-amber-200', label: 'In Progress' },
  completed:   { dot: 'bg-green-500',  pill: 'bg-green-50 text-green-700  border-green-200', label: 'Completed'  },
  cancelled:   { dot: 'bg-surface-400',pill: 'bg-surface-100 text-surface-500 border-surface-200', label: 'Cancelled' },
  confirmed:   { dot: 'bg-teal-500',   pill: 'bg-teal-50  text-teal-700   border-teal-200',  label: 'Confirmed'  },
  // Invoice
  generated:   { dot: 'bg-green-500',  pill: 'bg-green-50 text-green-700  border-green-200', label: 'Generated'  },
  // Followup
  done:        { dot: 'bg-surface-400',pill: 'bg-surface-100 text-surface-500 border-surface-200', label: 'Done' },
}

export default function StatusBadge({ status }) {
  const key = (status || '').toLowerCase().replace(/ /g, '_')
  const cfg = CONFIG[key] || {
    dot: 'bg-surface-400',
    pill: 'bg-surface-100 text-surface-600 border-surface-200',
    label: status || '—',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-2xs font-semibold border ${cfg.pill}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}
