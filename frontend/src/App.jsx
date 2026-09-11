import { Routes, Route, Navigate } from 'react-router-dom'

import Dashboard    from './pages/Dashboard'
import Appointments from './pages/Appointments'
import Technicians  from './pages/Technicians'
import Customers    from './pages/Customers'
import Invoices     from './pages/Invoices'
import FollowUps    from './pages/FollowUps'
import AIOperations from './pages/AIOperations'
import Settings     from './pages/Settings'

export default function App() {
  return (
    <Routes>
      <Route path="/"              element={<Dashboard />}    />
      <Route path="/appointments"  element={<Appointments />} />
      <Route path="/technicians"   element={<Technicians />}  />
      <Route path="/customers"     element={<Customers />}    />
      <Route path="/invoices"      element={<Invoices />}     />
      <Route path="/followups"     element={<FollowUps />}    />
      <Route path="/ai-ops"        element={<AIOperations />} />
      <Route path="/settings"      element={<Settings />}     />
      {/* Catch-all */}
      <Route path="*"              element={<Navigate to="/" replace />} />
    </Routes>
  )
}
