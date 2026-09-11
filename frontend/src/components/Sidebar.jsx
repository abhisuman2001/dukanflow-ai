const QUICK_ACTIONS = [
  {
    label: '🔖 Book Appointment',
    prompt:
      'A customer called. Phone: 9876543210. They need AC repair on 2026-09-15. Please run the full booking workflow.',
  },
  {
    label: '🔍 Look Up Customer',
    prompt: 'Look up customer with phone number 9876543210.',
  },
  {
    label: '🔧 Check Technician Availability',
    prompt: 'Check which technicians are available for AC repair on 2026-09-15.',
  },
  {
    label: '📋 New Service Request',
    prompt:
      'New service request: Customer Priya Singh (9876543211) needs washing machine repair on 2026-09-16.',
  },
  {
    label: '📅 Schedule Follow-up',
    prompt: 'Schedule a follow-up reminder for customer 9876543210.',
  },
]

function dispatch(prompt) {
  window.dispatchEvent(new CustomEvent('df:quick-action', { detail: prompt }))
}

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

      {/* Hero workflow button */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Hero Workflow
        </p>
        <button
          className="w-full text-left text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg px-3 py-2.5 transition-colors flex items-center gap-2"
          onClick={() =>
            dispatch(
              'Run the complete service request workflow: customer phone 9876543210, AC repair, date 2026-09-15 at 10:00 AM. Go step by step: find customer, check technician, book, assign, notify.',
            )
          }
        >
          <span className="text-base">🚀</span>
          Full Booking Demo
        </button>
      </div>

      {/* Quick actions */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
          Quick Actions
        </p>
        <ul className="space-y-1">
          {QUICK_ACTIONS.map((action) => (
            <li key={action.label}>
              <button
                className="w-full text-left text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors"
                onClick={() => dispatch(action.prompt)}
              >
                {action.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Workflow legend */}
      <div className="rounded-lg bg-gray-800 px-3 py-3 text-xs text-gray-400 space-y-1">
        <p className="font-semibold text-gray-300 mb-1.5">Workflow steps</p>
        {[
          '1. Find customer',
          '2. Check technician',
          '3. Book appointment',
          '4. Assign technician',
          '5. Notify customer',
        ].map((step) => (
          <p key={step}>{step}</p>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-auto text-xs text-gray-600">
        <p>DukaanFlow v0.3</p>
        <p>AI Ops Agent · Day 3</p>
      </div>
    </aside>
  )
}
