import AppShell from '../components/layout/AppShell'
import PageHeader from '../components/ui/PageHeader'

export default function Settings() {
  return (
    <AppShell title="Settings">
      <PageHeader title="Settings" description="Business profile and configuration." />
      <div className="bg-white border border-surface-200 rounded-lg shadow-card p-6 max-w-lg">
        <h3 className="text-sm font-semibold text-surface-800 mb-4">Business Profile</h3>
        <div className="space-y-4">
          {[
            { label: 'Business Name', value: 'Sharma Repairs', type: 'text' },
            { label: 'Location',      value: 'Dhanbad, Jharkhand', type: 'text' },
            { label: 'Contact Phone', value: '9876500000', type: 'tel' },
          ].map(({ label, value, type }) => (
            <div key={label}>
              <label className="block text-xs font-medium text-surface-600 mb-1">{label}</label>
              <input defaultValue={value} type={type} className="df-input" readOnly />
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs text-surface-400">Settings management coming in a future update.</p>
      </div>
    </AppShell>
  )
}
