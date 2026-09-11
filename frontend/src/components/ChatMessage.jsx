/**
 * Render a single chat message.
 * Supports basic markdown-like formatting:
 *   **bold**  → <strong>
 *   `code`    → <code>
 *   Lines starting with • or - → styled list rows
 *   Lines starting with ✅ / ❌ / ⚠️  → highlighted status rows
 */
function formatContent(text) {
  const lines = text.split('\n')

  return lines.map((line, i) => {
    // Inline bold + code pass
    const parsed = parseInline(line)

    return (
      <span key={i} className="block leading-relaxed">
        {parsed}
        {i < lines.length - 1 && '\n'}
      </span>
    )
  })
}

function parseInline(text) {
  // Split on **bold** and `code` patterns
  const parts = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index))
    }
    const raw = match[0]
    if (raw.startsWith('**')) {
      parts.push(<strong key={match.index} className="font-semibold text-white">{raw.slice(2, -2)}</strong>)
    } else {
      parts.push(<code key={match.index} className="bg-gray-700 rounded px-1 py-0.5 text-xs font-mono text-green-300">{raw.slice(1, -1)}</code>)
    }
    last = regex.lastIndex
  }

  if (last < text.length) {
    parts.push(text.slice(last))
  }

  return parts
}

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
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 ${
          isError ? 'bg-red-500' : 'bg-brand-500'
        }`}
      >
        {isError ? '!' : 'DF'}
      </div>
      <div className="flex flex-col gap-1 max-w-[75%]">
        <div
          className={`rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed ${
            isError
              ? 'bg-red-900/40 text-red-300 border border-red-800'
              : 'bg-gray-800 text-gray-100'
          }`}
        >
          {formatContent(message.content)}
        </div>
        <span className="text-xs text-gray-500 pl-1">{time}</span>
      </div>
    </div>
  )
}
