export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  const isError = message.role === 'error'

  const time = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  if (isUser) {
    return (
      <div className="flex justify-end items-end gap-2">
        <span className="text-xs text-gray-500 mb-1">{time}</span>
        <div className="max-w-[70%] bg-brand-500 text-white rounded-2xl rounded-br-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
          isError ? 'bg-red-500' : 'bg-brand-500'
        }`}
      >
        {isError ? '!' : 'DF'}
      </div>
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
            isError
              ? 'bg-red-900/40 text-red-300 border border-red-800'
              : 'bg-gray-800 text-gray-100'
          }`}
        >
          {message.content}
        </div>
        <span className="text-xs text-gray-500 pl-1">{time}</span>
      </div>
    </div>
  )
}
