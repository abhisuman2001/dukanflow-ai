import { useState, useRef, useEffect, useCallback } from 'react'
import ChatMessage from './components/ChatMessage'
import ChatInput from './components/ChatInput'
import Sidebar from './components/Sidebar'
import { sendMessage } from './api/agent'

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Namaste! I\'m DukaanFlow, your AI operations assistant for appliance repair. I can help you manage customers, schedule appointments, assign technicians, generate invoices, and more. How can I help you today?',
  timestamp: new Date(),
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // Listen for sidebar quick-action clicks
  useEffect(() => {
    const handler = (e) => handleSend(e.detail)
    window.addEventListener('df:quick-action', handler)
    return () => window.removeEventListener('df:quick-action', handler)
  }, [loading])

  async function handleSend(text) {
    if (!text.trim() || loading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const reply = await sendMessage(text)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-ai',
          role: 'assistant',
          content: reply,
          timestamp: new Date(),
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + '-err',
          role: 'error',
          content: err.message || 'Something went wrong. Please try again.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900">
          <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm">
            DF
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm">DukaanFlow Agent</h1>
            <p className="text-xs text-gray-400">AI Operations Assistant</p>
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-xs text-green-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
            Online
          </span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto chat-scroll px-4 py-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                DF
              </div>
              <div className="bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                <span className="flex gap-1 items-center h-5">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} disabled={loading} />
      </div>
    </div>
  )
}
