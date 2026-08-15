import React, { useState } from 'react'
import ChatWindow from './ChatWindow.jsx'
import MessageInput from './MessageInput.jsx'
import JDMatcher from './JDMatcher.jsx'
import Reveal from './Reveal.jsx'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function exportChatAsText(messages, candidateName) {
  const lines = messages.map((m) => {
    const who = m.role === 'user' ? 'Recruiter' : candidateName || 'Assistant'
    return `${who}:\n${m.content}\n`
  })
  const header = `Conversation with ${candidateName || 'the candidate'}'s AI representative\n${new Date().toLocaleString()}\n\n`
  const blob = new Blob([header + lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chat-with-${(candidateName || 'candidate').replace(/\s+/g, '-').toLowerCase()}.txt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export default function ChatSection({
  profile,
  connected,
  messages,
  streamingIndex,
  isStreaming,
  onSend,
  onClear,
  mode,
  onModeChange,
}) {
  const [tab, setTab] = useState('chat')

  return (
    <section id="chat" className="chat-section">
      <Reveal>
        <p className="section-eyebrow">Interactive</p>
        <h2 className="section-title">Talk to My Assistant</h2>
        <p className="chat-section-sub">
          Ask about my projects, skills, or paste a job description to check fit. Answers are
          grounded only in my real profile — no exaggeration, no guessing.
        </p>
      </Reveal>

      <Reveal delay={100} className="chat-console">
        <div className="chat-console-header">
          <div className="chat-console-identity">
            <div className="chat-console-avatar">{profile ? initials(profile.name) : ''}</div>
            <div>
              <div className="chat-console-name">
                {profile ? profile.name : 'Loading…'} — Digital Representative
              </div>
              <div className={`status-line ${connected ? 'is-live' : 'is-offline'}`}>
                <span className="status-dot" />
                {connected ? 'AGENT ONLINE' : 'CONNECTING…'}
              </div>
            </div>
          </div>

          <div className="chat-console-actions">
            {tab === 'chat' && (
              <>
                <button
                  className={`pitch-toggle ${mode === 'pitch' ? 'is-active' : ''}`}
                  onClick={() => onModeChange(mode === 'pitch' ? 'chat' : 'pitch')}
                  title="Switch the assistant into a persuasive 'why hire me' register"
                >
                  {mode === 'pitch' ? '★ Pitch mode' : '☆ Why hire me'}
                </button>
                <button
                  className="clear-btn"
                  onClick={() => exportChatAsText(messages, profile?.name)}
                  disabled={messages.length === 0}
                >
                  Export chat
                </button>
              </>
            )}
            <button className="clear-btn" onClick={onClear} disabled={messages.length === 0}>
              Clear chat
            </button>
          </div>
        </div>

        <div className="chat-tabs">
          <button
            className={`chat-tab ${tab === 'chat' ? 'is-active' : ''}`}
            onClick={() => setTab('chat')}
          >
            Chat
          </button>
          <button
            className={`chat-tab ${tab === 'jd' ? 'is-active' : ''}`}
            onClick={() => setTab('jd')}
          >
            Match a JD
          </button>
        </div>

        {tab === 'chat' ? (
          <>
            <ChatWindow
              messages={messages}
              streamingIndex={streamingIndex}
              candidateName={profile?.name}
              onSuggestionClick={onSend}
            />
            <MessageInput onSend={onSend} disabled={isStreaming} />
          </>
        ) : (
          <JDMatcher />
        )}
      </Reveal>
    </section>
  )
}
