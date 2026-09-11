export default function ErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4">
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-surface-700">Something went wrong</p>
      {message && <p className="mt-1 text-sm text-surface-400 max-w-xs">{message}</p>}
      {onRetry && (
        <button onClick={onRetry} className="mt-4 btn-ghost text-brand-600 hover:text-brand-700">
          Try again
        </button>
      )}
    </div>
  )
}
