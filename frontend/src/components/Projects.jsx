import React, { useRef } from 'react'
import Reveal from './Reveal.jsx'
import { useGithubStats } from '../hooks/useGithubStats.js'
import { SkeletonCard, SkeletonLine } from './Skeleton.jsx'

function TiltCard({ children }) {
  const ref = useRef(null)

  function handleMouseMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    el.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`)
    el.style.setProperty('--tilt-y', `${(x * 6).toFixed(2)}deg`)
  }

  function handleMouseLeave() {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--tilt-x', '0deg')
    el.style.setProperty('--tilt-y', '0deg')
  }

  return (
    <div
      ref={ref}
      className="project-card-tilt"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

function timeAgo(dateStr) {
  if (!dateStr) return null
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days < 1) return 'today'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function GithubStatBadge({ link }) {
  const stats = useGithubStats(link)
  if (!stats) return null
  return (
    <div className="project-card-stats" aria-label="Live GitHub stats">
      <span className="project-stat">★ {stats.stars}</span>
      <span className="project-stat">⑂ {stats.forks}</span>
      {stats.updatedAt && (
        <span className="project-stat project-stat--muted">Updated {timeAgo(stats.updatedAt)}</span>
      )}
    </div>
  )
}

export default function Projects({ profile }) {
  if (!profile) {
    return (
      <section id="projects" className="projects">
        <div className="section-eyebrow">Work</div>
        <SkeletonLine width="260px" height="2.2rem" style={{ marginBottom: '2rem' }} />
        <div className="project-grid">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    )
  }

  return (
    <section id="projects" className="projects">
      <Reveal>
        <p className="section-eyebrow">Work</p>
        <h2 className="section-title">Things I've built</h2>
      </Reveal>

      <div className="project-grid">
        {profile.projects?.map((p, i) => (
          <Reveal key={p.name} direction="scale" delay={i * 100} className="project-card">
            <TiltCard>
              <div className="project-card-glow" aria-hidden="true" />
              <h3 className="project-card-name">{p.name}</h3>
              <p className="project-card-tagline">{p.tagline}</p>
              <p className="project-card-desc">{p.description?.[0]}</p>

              <div className="tag-row project-card-tags">
                {p.skills_used?.slice(0, 5).map((s) => (
                  <span key={s} className="tag tag--sm">
                    {s}
                  </span>
                ))}
              </div>

              {p.link && <GithubStatBadge link={p.link} />}

              <div className="project-card-links">
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer">
                    GitHub →
                  </a>
                )}
                {p.live_demo && (
                  <a href={p.live_demo} target="_blank" rel="noreferrer">
                    Live Demo →
                  </a>
                )}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
