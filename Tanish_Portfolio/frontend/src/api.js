import fallbackProfile from './candidate_profile.json'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Fetches the candidate profile JSON from the backend, falling back to local JSON if backend is offline.
 */
export async function fetchProfile() {
  try {
    const res = await fetch(`${API_BASE}/profile`)
    if (res.ok) return await res.json()
  } catch (err) {
    console.warn('Backend API not reachable, utilizing bundled candidate profile data.')
  }
  return fallbackProfile
}

/**
 * Sends the full conversation history to the backend and streams the
 * assistant's reply back token-by-token via onChunk.
 *
 * @param {{role: 'user'|'assistant', content: string}[]} messages
 * @param {(chunk: string) => void} onChunk - called for each streamed piece of text
 * @param {AbortSignal} [signal] - optional abort signal to cancel the request
 * @param {'chat'|'pitch'} [mode] - 'pitch' switches the assistant into a persuasive
 *   "why hire me" register instead of neutral Q&A
 */
export async function streamChat(messages, onChunk, signal, mode = 'chat') {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode }),
    signal,
  })

  if (!res.ok || !res.body) {
    const detail = await res.json().catch(() => ({}))
    const message =
      typeof detail.detail === 'string'
        ? detail.detail
        : res.status === 422
          ? 'That message was too long or malformed — try shortening it.'
          : res.status === 429
            ? "You're sending messages a bit fast — please wait a moment and try again."
            : `Chat request failed (${res.status})`
    throw new Error(message)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value, { stream: true })
    if (chunk) onChunk(chunk)
  }
}

/**
 * Sends a pasted job description to the backend and returns a structured
 * fit assessment: { fit_score, summary, strengths, gaps }.
 *
 * @param {string} jobDescription
 */
export async function matchJobDescription(jobDescription) {
  const res = await fetch(`${API_BASE}/match-jd`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ job_description: jobDescription }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `Fit check failed (${res.status})`)
  }
  return res.json()
}
