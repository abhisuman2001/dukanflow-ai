const QUICK_ACTIONS = [
  'Look up a customer',
  'Book a new appointment',
  'Check technician availability',
  'Generate an invoice',
  'Schedule a follow-up',
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col p-4 gap-6 hidden md:flex">
      {/* Logo */}
      <div className="flex items-center gap-2 pt-2">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
          D
        </div>
        <span className="font-bold text-white text-base tracking-tight">DukaanFlow</span>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Quick Actions
        </p>
        <ul className="space-y-1">
          {QUICK_ACTIONS.map((action) => (
            <li key={action}>
              <button
                className="w-full text-left text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors"
                onClick={() => {
                  // Dispatch a custom event that App.jsx listens to — keeps sidebar decoupled
                  window.dispatchEvent(new CustomEvent('df:quick-action', { detail: action }))
                }}
              >
                {action}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-auto text-xs text-gray-600">
        <p>DukaanFlow v0.1</p>
        <p>AI Ops Agent</p>
      </div>
    </aside>
  )
}
