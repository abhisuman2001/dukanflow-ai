/**
 * LoadingState — skeleton rows for tables, and a spinner for general use.
 */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-b border-surface-100">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 bg-surface-100 rounded"
              style={{ flex: c === 0 ? '2' : '1' }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function Spinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4 border-2' : 'w-6 h-6 border-2'
  return (
    <span className={`inline-block rounded-full border-surface-200 border-t-brand-500 animate-spin ${s}`} />
  )
}

export default function LoadingState({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Spinner />
      <p className="text-sm text-surface-400">{message}</p>
    </div>
  )
}
