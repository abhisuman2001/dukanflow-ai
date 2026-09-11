/**
 * MetricCard — compact KPI tile for the dashboard.
 * Intentionally data-dense, not decorative.
 */
export default function MetricCard({ label, value, sub, icon: Icon, accent = false }) {
  return (
    <div className={`metric-card flex items-start justify-between gap-3 ${accent ? 'border-brand-200' : ''}`}>
      <div className="min-w-0">
        <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider truncate">{label}</p>
        <p className={`mt-1 text-2xl font-bold tracking-tight ${accent ? 'text-brand-600' : 'text-surface-900'}`}>
          {value ?? '—'}
        </p>
        {sub && <p className="mt-0.5 text-xs text-surface-400">{sub}</p>}
      </div>
      {Icon && (
        <div className={`shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${accent ? 'bg-brand-50' : 'bg-surface-100'}`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-brand-500' : 'text-surface-500'}`} />
        </div>
      )}
    </div>
  )
}
