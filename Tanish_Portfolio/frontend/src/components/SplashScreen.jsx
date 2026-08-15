import React, { useState, useEffect } from 'react'

const LOADING_STEPS = [
  { at: 15, text: 'Initializing system kernel...' },
  { at: 40, text: 'Loading N. Tanish candidate profile data...' },
  { at: 70, text: 'Connecting AI Representative & Agentic AI services...' },
  { at: 90, text: 'Applying Rose Quartz × Emerald Depths theme system...' },
  { at: 100, text: 'System ready. Launching portfolio...' },
]

export default function SplashScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [statusText, setStatusText] = useState('Initializing system kernel...')
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    const duration = 2200 // 2.2s total boot time
    const intervalTime = 30
    const step = 100 / (duration / intervalTime)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + step, 100)

        // Update status text based on progress
        const currentStep = LOADING_STEPS.slice().reverse().find((s) => next >= s.at)
        if (currentStep) {
          setStatusText(currentStep.text)
        }

        if (next >= 100) {
          clearInterval(timer)
          setTimeout(() => {
            setIsFadingOut(true)
            setTimeout(() => {
              onComplete()
            }, 600) // match fadeOut animation duration
          }, 300)
        }

        return next
      })
    }, intervalTime)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className={`splash-screen ${isFadingOut ? 'splash-screen--fade-out' : ''}`}>
      <div className="splash-ambient-glow" aria-hidden="true" />
      
      <div className="splash-content">
        <h1 className="splash-logo">
          TANISH<span className="splash-logo-dot">.</span>
        </h1>
        <p className="splash-subheading">Candidate Console &amp; AI Representative</p>

        {/* Progress Bar */}
        <div className="splash-progress-track">
          <div
            className="splash-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Percentage & Status Text */}
        <div className="splash-status-row">
          <span className="splash-status-text">{statusText}</span>
          <span className="splash-percent">{Math.round(progress)}%</span>
        </div>
      </div>
    </div>
  )
}
