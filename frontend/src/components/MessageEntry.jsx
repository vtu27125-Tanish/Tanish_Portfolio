import React, { useEffect, useState } from 'react'
import Markdown from './Markdown.jsx'

const THINKING_STEPS = [
  'Reading the question…',
  'Checking projects…',
  'Reviewing skills…',
  'Drafting a grounded answer…',
]

function ThinkingLine() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % THINKING_STEPS.length)
    }, 900)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="thinking-line">
      {THINKING_STEPS[step]}
      <span className="typing-indicator" aria-hidden="true">
        ●●●
      </span>
    </span>
  )
}

export default function MessageEntry({ role, content, streaming }) {
  const [copied, setCopied] = useState(false)
  const [speaking, setSpeaking] = useState(false)

  const isUser = role === 'user'
  const showThinking = streaming && !isUser && content.length === 0

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  function handleSpeechToggle() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return

    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    
    // Strip markdown formatting symbols for natural speech reading
    const cleanText = content
      .replace(/[*_#`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.rate = 1.0
    utterance.pitch = 1.0

    const voices = window.speechSynthesis.getVoices()
    const preferredVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Karen'))
      ) || voices.find((v) => v.lang.startsWith('en'))

    if (preferredVoice) utterance.voice = preferredVoice

    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)

    setSpeaking(true)
    window.speechSynthesis.speak(utterance)
  }

  const supportsSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window

  return (
    <div className={`log-entry ${isUser ? 'log-entry--user' : 'log-entry--agent'}`}>
      <div className="log-entry-meta">
        <span className="log-entry-prefix">{isUser ? '>> YOU' : '>> AGENT'}</span>
        {streaming && !showThinking && (
          <span className="typing-indicator" aria-label="Agent is typing">
            ●●●
          </span>
        )}
      </div>
      <div className="log-entry-content">
        {showThinking ? (
          <ThinkingLine />
        ) : isUser ? (
          content
        ) : (
          <Markdown text={content} />
        )}
        {streaming && !showThinking && (
          <span className="cursor-blink" aria-hidden="true">
            ▍
          </span>
        )}
      </div>
      {!streaming && content && !isUser && (
        <div className="log-entry-actions">
          {supportsSpeech && (
            <button
              className={`tts-btn ${speaking ? 'is-speaking' : ''}`}
              onClick={handleSpeechToggle}
              title={speaking ? 'Stop speaking' : 'Read aloud'}
              aria-label={speaking ? 'Stop speaking' : 'Read response aloud'}
            >
              {speaking ? '🔊 Stop' : '🔊 Listen'}
            </button>
          )}
          <button className="copy-btn" onClick={handleCopy} aria-label="Copy response">
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </div>
  )
}
