import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppShell({ title, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto scroll-thin p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
