/**
 * AIOperations — the DukaanFlow chat agent interface.
 * Preserves all Day 1–3 chat functionality inside the new app shell.
 * The sidebar is provided by AppShell; the chat fills the remaining space.
 */
import { useState, useRef, useEffect } from 'react'
import AppShell from '../components/layout/AppShell'
import ChatMessage from '../components/ChatMessage'
import ChatInput from '../components/ChatInput'
import { sendMessage } from '../api/agent'

const QUICK_ACTIONS = [
  {
    label: 'Full booking demo',
    prompt:
      'Run the complete service request workflow: customer phone 9876543210, AC repair, date 2026-09-15 at 10:00 AM. Go step by step: find customer, check technician, book, assign, notify.',
  },
  {
    label: 'Look up customer',
    prompt: 'Look up customer with phone number 9876543210.',
  },
  {
    label: 'Check availability',
    prompt: 'Check which technicians are available for AC repair on 2026-09-15.',
  },
  {
    label: 'New service request',
    prompt: 'New service request: Customer Priya Singh (9876543211) needs washing machine repair on 2026-09-16.',
  },
  {
    label: 'Update job status',
    prompt: 'Update job status to completed.',
  },
  {
    label: 'Generate invoice',
    prompt: 'Generate an invoice for the completed job.',
  },
  {
    label: 'Schedule follow-up',
    prompt: 'Schedule a follow-up for 2026-09-20, reason: Post-service quality check.',
  },
]

const WELCOME = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Namaste! I'm DukaanFlow, your AI operations assistant. I can book appointments, update job status, generate invoices, schedule follow-ups, and more. What do you need?",
  timestamp: new Date(),
}

export default function AIOperations() {
  const [messages, setMessages] = useState([WELCOME])
  const [loading, setLoading]   = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Support legacy sidebar quick-action events from old code
  useEffect(() => {
    const handler = (e) => handleSend(e.detail)
    window.addEventListener('df:quick-action', handler)
    return () => window.removeEventListener('df:quick-action', handler)
  }, [loading])

  async function handleSend(text) {
    if (!text.trim() || loading) return
    const userMsg = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)
    try {
      const reply = await sendMessage(text)
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }])
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: Date.now().toString() + '-err',
        role: 'error',
        content: err.message || 'Something went wrong.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell title="AI Operations">
      {/* Full-height chat container inside the main area */}
      <div className="flex gap-4 h-[calc(100vh-8rem)]">

        {/* Chat panel */}
        <div className="flex flex-col flex-1 min-w-0 bg-gray-950 rounded-lg border border-gray-800 overflow-hidden">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
            <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
              DF
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-none">DukaanFlow Agent</p>
              <p className="text-xs text-gray-400 mt-0.5">AI Operations Assistant · Day 4</p>
            </div>
            <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              Online
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto chat-scroll px-4 py-4 space-y-4">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {loading && (
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  DF
                </div>
                <div className="bg-gray-800 rounded-xl px-4 py-3">
                  <span className="flex gap-1 items-center h-4">
                    {['-0.3s', '-0.15s', '0s'].map((d) => (
                      <span key={d} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: d }} />
                    ))}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <ChatInput onSend={handleSend} disabled={loading} />
        </div>

        {/* Quick actions sidebar */}
        <div className="hidden lg:flex flex-col w-52 shrink-0 gap-3">
          <div className="bg-white border border-surface-200 rounded-lg shadow-card p-3">
            <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Quick prompts</p>
            <div className="space-y-1">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  disabled={loading}
                  onClick={() => handleSend(a.prompt)}
                  className="w-full text-left text-xs text-surface-600 hover:text-surface-900 hover:bg-surface-50 px-2.5 py-2 rounded transition-colors border border-transparent hover:border-surface-200 disabled:opacity-40"
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-surface-200 rounded-lg shadow-card p-3">
            <p className="text-2xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Workflow</p>
            <ol className="space-y-1.5">
              {[
                'Find customer',
                'Check technician',
                'Book appointment',
                'Assign technician',
                'Notify customer',
                'Update job status',
                'Generate invoice',
                'Schedule follow-up',
              ].map((s, i) => (
                <li key={s} className="flex items-start gap-2 text-xs text-surface-500">
                  <span className="w-4 h-4 rounded-full bg-surface-100 text-surface-500 text-2xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
