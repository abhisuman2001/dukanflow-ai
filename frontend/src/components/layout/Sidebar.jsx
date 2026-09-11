import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'

// ── Icons (inline SVG, no dependency) ────────────────────────────────────────
const Icon = {
  Grid: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
    </svg>
  ),
  Calendar: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
    </svg>
  ),
  Wrench: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l5.654-4.655m5.657-5.657 1.857-.248.921 2.18-1.07 1.07-2.18-.921.248-1.857Zm-5.657 5.657-1.857.248-.921-2.18 1.07-1.07 2.18.921-.248 1.857Z" />
    </svg>
  ),
  Users: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    </svg>
  ),
  Receipt: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 14.25l6-6m4.5-3.493V21.75l-3.75-1.5-3.75 1.5-3.75-1.5-3.75 1.5V4.757c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0c1.1.128 1.907 1.077 1.907 2.185ZM9.75 9h.008v.008H9.75V9Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 4.5h.008v.008h-.008V13.5Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  ),
  Bell: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    </svg>
  ),
  Cpu: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
    </svg>
  ),
  Settings: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  ),
  User: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  ),
  Menu: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  X: (p) => (
    <svg {...p} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  ),
}

// ── DukaanFlow wordmark / logo mark ──────────────────────────────────────────
function LogoMark({ className = '' }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      {/* Abstract flow mark — two interlocking arcs suggesting routing/operations */}
      <rect width="32" height="32" rx="7" fill="#f97316" />
      <path d="M8 22 C8 16 13 14 16 14 C19 14 24 12 24 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M8 16 C10 16 13 17 16 17 C20 17 22 20 22 24" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55" />
    </svg>
  )
}

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV = [
  { to: '/',              label: 'Dashboard',      Icon: Icon.Grid     },
  { to: '/appointments',  label: 'Appointments',   Icon: Icon.Calendar },
  { to: '/technicians',   label: 'Technicians',    Icon: Icon.Wrench   },
  { to: '/customers',     label: 'Customers',      Icon: Icon.Users    },
  { to: '/invoices',      label: 'Invoices',       Icon: Icon.Receipt  },
  { to: '/followups',     label: 'Follow-ups',     Icon: Icon.Bell     },
  { to: '/ai-ops',        label: 'AI Operations',  Icon: Icon.Cpu      },
]

const NAV_BOTTOM = [
  { to: '/settings', label: 'Settings', Icon: Icon.Settings },
]

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ to, label, NavIcon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-item ${isActive ? 'active' : ''}`
      }
      end={to === '/'}
    >
      <NavIcon className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </NavLink>
  )
}

// ── Sidebar component ─────────────────────────────────────────────────────────
export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const sidebarContent = (closeFn = undefined) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-surface-100">
        <LogoMark className="w-7 h-7 shrink-0" />
        <div>
          <span className="font-bold text-surface-900 text-sm tracking-tight leading-none">DukaanFlow</span>
          <p className="text-2xs text-surface-400 leading-none mt-0.5">Operations Platform</p>
        </div>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto scroll-thin">
        <p className="px-3 pt-1 pb-1.5 text-2xs font-semibold text-surface-400 uppercase tracking-wider">
          Operations
        </p>
        {NAV.map(({ to, label, Icon: NavIcon }) => (
          <NavItem key={to} to={to} label={label} NavIcon={NavIcon} onClick={closeFn} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-3 border-t border-surface-100 space-y-0.5">
        {NAV_BOTTOM.map(({ to, label, Icon: NavIcon }) => (
          <NavItem key={to} to={to} label={label} NavIcon={NavIcon} onClick={closeFn} />
        ))}
        {/* Business profile stub */}
        <div className="nav-item mt-1 cursor-default">
          <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center shrink-0">
            <span className="text-2xs font-bold text-brand-600">SR</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-surface-700 truncate leading-none">Sharma Repairs</p>
            <p className="text-2xs text-surface-400 truncate leading-none mt-0.5">Dhanbad, JH</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-3 left-3 z-50 w-9 h-9 flex items-center justify-center rounded-md bg-white border border-surface-200 shadow-card text-surface-600"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Icon.Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-surface-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 bg-white h-full shadow-card-md">
            <button
              className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-surface-500 hover:text-surface-700"
              onClick={() => setMobileOpen(false)}
            >
              <Icon.X className="w-4 h-4" />
            </button>
            {sidebarContent(() => setMobileOpen(false))}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-surface-200 h-screen sticky top-0">
        {sidebarContent()}
      </aside>
    </>
  )
}
