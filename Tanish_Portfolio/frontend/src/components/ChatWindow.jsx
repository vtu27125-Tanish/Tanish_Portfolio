import React, { useEffect, useRef } from 'react'
import MessageEntry from './MessageEntry.jsx'

export default function ChatWindow({ messages, streamingIndex, candidateName, onSuggestionClick }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, streamingIndex])

  if (messages.length === 0) {
    return (
      <div className="chat-window">
        <div className="empty-state">
          <div className="empty-state-title">No transmissions yet</div>
          <p className="empty-state-body">
            Ask about {candidateName || 'the candidate'}'s projects, skills, or paste a job
            description to check fit — or tap a suggestion below.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window">
      {messages.map((m, i) => (
        <MessageEntry
          key={i}
          role={m.role}
          content={m.content}
          streaming={i === streamingIndex}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
