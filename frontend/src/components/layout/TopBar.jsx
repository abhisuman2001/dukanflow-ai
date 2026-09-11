/**
 * TopBar — page-level top bar showing current page context + live status.
 */
export default function TopBar({ title }) {
  const now = new Date().toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-surface-200 sticky top-0 z-10">
      <div className="md:hidden w-8" />{/* spacer for mobile hamburger */}
      <h2 className="text-sm font-semibold text-surface-700 truncate">{title}</h2>
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-xs text-surface-400">{now}</span>
        <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
          Live
        </span>
      </div>
    </header>
  )
}
