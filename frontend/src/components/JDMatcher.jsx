import React, { useState } from 'react'
import { matchJobDescription } from '../api.js'

const MAX_JD_CHARS = 10000

function scoreTone(score) {
  if (score >= 75) return 'strong'
  if (score >= 45) return 'moderate'
  return 'weak'
}

export default function JDMatcher() {
  const [jd, setJd] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = jd.trim()
    if (!trimmed || loading || trimmed.length > MAX_JD_CHARS) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const data = await matchJobDescription(trimmed)
      setResult(data)
    } catch (err) {
      setError(err.message || 'Could not check fit. Please verify connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleJdChange(e) {
    const val = e.target.value
    if (val.length <= MAX_JD_CHARS) {
      setJd(val)
    }
  }

  const score = result ? Math.max(0, Math.min(100, result.fit_score)) : 0
  const circumference = 2 * Math.PI * 42
  const dash = (score / 100) * circumference
  const charCount = jd.length

  return (
    <div className="jd-matcher">
      <form className="jd-matcher-form" onSubmit={handleSubmit}>
        <div className="jd-textarea-wrap">
          <textarea
            className="jd-matcher-textarea"
            placeholder="Paste a job description here to check candidate fit (up to 10,000 characters)…"
            value={jd}
            onChange={handleJdChange}
            rows={6}
            maxLength={MAX_JD_CHARS}
            disabled={loading}
          />
          <div className="jd-char-count">
            <span className={charCount >= MAX_JD_CHARS ? 'is-max' : ''}>
              {charCount.toLocaleString()} / {MAX_JD_CHARS.toLocaleString()} characters
            </span>
          </div>
        </div>
        <button
          type="submit"
          className="btn-primary jd-matcher-submit"
          disabled={loading || !jd.trim() || charCount > MAX_JD_CHARS}
        >
          {loading ? 'Analyzing Fit…' : 'Check fit'}
        </button>
      </form>

      {error && <div className="jd-matcher-error">{error}</div>}

      {result && (
        <div className={`jd-matcher-result jd-matcher-result--${scoreTone(score)}`}>
          <div className="jd-matcher-score">
            <svg viewBox="0 0 100 100" className="jd-score-ring" aria-hidden="true">
              <circle cx="50" cy="50" r="42" className="jd-score-track" />
              <circle
                cx="50"
                cy="50"
                r="42"
                className="jd-score-fill"
                strokeDasharray={`${dash} ${circumference}`}
              />
            </svg>
            <div className="jd-score-number">
              <span>{score}</span>
              <small>/ 100</small>
            </div>
          </div>

          <div className="jd-matcher-details">
            <p className="jd-matcher-summary">{result.summary}</p>

            {result.strengths?.length > 0 && (
              <div className="jd-matcher-list-block">
                <h4>Strengths</h4>
                <ul className="jd-matcher-list jd-matcher-list--strengths">
                  {result.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.gaps?.length > 0 && (
              <div className="jd-matcher-list-block">
                <h4>Gaps</h4>
                <ul className="jd-matcher-list jd-matcher-list--gaps">
                  {result.gaps.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
