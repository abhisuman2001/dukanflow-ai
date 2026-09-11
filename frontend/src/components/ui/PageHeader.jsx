/**
 * PageHeader — consistent page title + actions strip.
 */
export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-lg font-bold text-surface-900 tracking-tight">{title}</h1>
        {description && <p className="mt-0.5 text-sm text-surface-500">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
