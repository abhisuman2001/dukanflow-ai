const API_BASE = '/api'

/**
 * Send a chat message to the DukaanFlow backend agent.
 * @param {string} message
 * @returns {Promise<string>} The agent's text response
 */
export async function sendMessage(message) {
  const res = await fetch(`${API_BASE}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || `Server error: ${res.status}`)
  }

  const data = await res.json()
  return data.response
}
