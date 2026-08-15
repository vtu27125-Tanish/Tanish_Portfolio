import React, { useState, useRef, useEffect } from 'react'

const SUGGESTIONS = [
  "What's your strongest project?",
  'Do you know FastAPI?',
  'Are you open to internships?',
  'Walk me through your skills.',
]

const MAX_CHAR_LIMIT = 4000

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export default function MessageInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const [listening, setListening] = useState(false)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const SpeechRecognitionCtor = getSpeechRecognition()

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop?.()
    }
  }, [])

  function resizeTextarea() {
    const el = textareaRef.current
    if (el) {
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 160) + 'px'
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled || trimmed.length > MAX_CHAR_LIMIT) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  function handleChange(e) {
    const nextVal = e.target.value
    if (nextVal.length <= MAX_CHAR_LIMIT) {
      setValue(nextVal)
      resizeTextarea()
    }
  }

  function handleSuggestion(text) {
    if (disabled) return
    onSend(text)
  }

  function toggleVoice() {
    if (!SpeechRecognitionCtor || disabled) return

    if (listening) {
      recognitionRef.current?.stop()
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setValue((prev) => {
        const combined = prev ? `${prev} ${transcript}` : transcript
        return combined.slice(0, MAX_CHAR_LIMIT)
      })
      requestAnimationFrame(resizeTextarea)
    }
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setListening(true)
  }

  const charCount = value.length
  const showCharWarning = charCount > 2500

  return (
    <div className="input-area">
      <div className="input-suggestions" role="group" aria-label="Suggested questions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="suggestion-chip suggestion-chip--persistent"
            onClick={() => handleSuggestion(s)}
            disabled={disabled}
          >
            {s}
          </button>
        ))}
      </div>

      <form className="input-bar" onSubmit={handleSubmit}>
        {SpeechRecognitionCtor && (
          <button
            type="button"
            className={`mic-btn ${listening ? 'is-listening' : ''}`}
            onClick={toggleVoice}
            disabled={disabled}
            aria-label={listening ? 'Stop voice input' : 'Start voice input'}
            title={listening ? 'Listening… click to stop' : 'Ask by voice'}
          >
            {listening ? '●' : '🎙'}
          </button>
        )}
        <div className="input-textarea-wrapper" style={{ flex: 1, position: 'relative' }}>
          <textarea
            ref={textareaRef}
            className="input-textarea"
            placeholder={disabled ? 'Waiting for response…' : 'Ask about skills, projects, or paste a JD…'}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={MAX_CHAR_LIMIT}
            disabled={disabled}
          />
          {showCharWarning && (
            <span
              className={`char-counter ${charCount >= MAX_CHAR_LIMIT ? 'char-counter--limit' : ''}`}
            >
              {charCount} / {MAX_CHAR_LIMIT}
            </span>
          )}
        </div>
        <button
          type="submit"
          className="send-btn"
          disabled={disabled || !value.trim() || charCount > MAX_CHAR_LIMIT}
        >
          {disabled ? '···' : 'Send'}
        </button>
      </form>
    </div>
  )
}
