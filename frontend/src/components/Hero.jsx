import React, { useEffect, useState, useRef } from 'react'
import { useTypedText } from '../hooks/useTypedText.js'
import { useScrollY } from '../hooks/useScrollY.js'
import NeuralAvatar from './NeuralAvatar.jsx'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const ROLES = [
  'a Software Engineer',
  'a Machine Learning Student',
  'an Agentic Systems Builder',
  'a Full-Stack Developer',
]

export default function Hero({ profile }) {
  const typed = useTypedText(ROLES)
  const [mounted, setMounted] = useState(false)
  const sectionRef = useRef(null)
  const scrollY = useScrollY()

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    return () => clearTimeout(t)
  }, [])

  function scrollToChat() {
    document.getElementById('chat')?.scrollIntoView({ behavior: 'smooth' })
  }

  const entrance = mounted ? 'hero-enter hero-enter--in' : 'hero-enter'

  // Parallax: as the user scrolls down through the hero's own height,
  // content drifts up (slower than scroll) and fades out. Clamped so it
  // never goes below 0 once they've scrolled past the section. Disabled
  // entirely for users who've asked for reduced motion.
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const heroHeight = sectionRef.current?.offsetHeight || 800
  const progress = prefersReduced ? 0 : Math.min(Math.max(scrollY / heroHeight, 0), 1)
  const parallaxY = progress * 90
  const parallaxOpacity = 1 - progress * 1.15

  return (
    <section
      id="home"
      className="hero"
      ref={sectionRef}
      style={{
        transform: `translateY(${parallaxY}px)`,
        opacity: Math.max(parallaxOpacity, 0),
      }}
    >
      <div
        className="hero-glow"
        aria-hidden="true"
        style={{ transform: `translate(-50%, ${progress * 60}px)` }}
      />

      <h1 className={`hero-name ${entrance}`} style={{ transitionDelay: '0ms' }}>
        {profile ? profile.name : '—'}
      </h1>

      {profile?.availability?.status && (
        <div className={`availability-badge ${entrance}`} style={{ transitionDelay: '40ms' }}>
          <span className="availability-dot" aria-hidden="true" />
          {profile.availability.status}
        </div>
      )}

      <h2 className={`hero-role ${entrance}`} style={{ transitionDelay: '160ms' }}>
        I'm <span className="hero-role-typed">{typed}</span>
        <span className="hero-role-cursor">|</span>
      </h2>

      <p className={`hero-subtitle ${entrance}`} style={{ transitionDelay: '240ms' }}>
        Currently building {' '}
        <strong>Generative &amp; Agentic Systems</strong> projects — instead of a resume, talk to my
        digital representative below and ask it anything about my work.
      </p>

      <div className={`hero-actions ${entrance}`} style={{ transitionDelay: '320ms' }}>
        <button className="btn-primary" onClick={scrollToChat}>
          Talk to My Assistant →
        </button>
        <a className="btn-secondary" href="/resume.pdf" download>
          Download Resume
        </a>
        {profile?.social_links?.github && (
          <a
            className="btn-secondary"
            href={profile.social_links.github}
            target="_blank"
            rel="noreferrer"
          >
            View GitHub
          </a>
        )}
      </div>
    </section>
  )
}
