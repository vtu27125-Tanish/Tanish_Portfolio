import React from 'react'
import Reveal from './Reveal.jsx'

// Real skills from the resume, given a compact badge label + brand-ish color.
const ORBIT_SKILLS = [
  { label: 'Py', name: 'Python', color: '#3776AB', row: 1 },
  { label: 'Java', name: 'Java', color: '#E76F00', row: 1 },
  { label: 'JS', name: 'JavaScript', color: '#F7DF1E', dark: true, row: 1 },
  { label: 'SQL', name: 'SQL', color: '#4479A1', row: 1 },
  { label: 'PHP', name: 'PHP', color: '#777BB4', row: 1 },
  { label: '⚡', name: 'FastAPI', color: '#009688', row: 2 },
  { label: 'DB', name: 'MySQL', color: '#00758F', row: 2 },
  { label: 'Git', name: 'Git', color: '#F05032', row: 2 },
  { label: 'ML', name: 'Gemini API', color: '#8E75FF', row: 2 },
  { label: '{ }', name: 'REST API', color: '#4FD1C5', row: 2 },
]

const ROW1 = ORBIT_SKILLS.filter((s) => s.row === 1)
const ROW2 = ORBIT_SKILLS.filter((s) => s.row === 2)

function badgePosition(index, total, row) {
  // Spread badges across an arc; row 1 sits further out / higher, row 2 closer / lower.
  const spread = row === 1 ? 100 : 66
  const startX = 50 - spread / 2
  const step = total > 1 ? spread / (total - 1) : 0
  const x = startX + step * index
  const y = row === 1 ? 8 : 26
  return { x, y }
}

function Badge({ skill, index, total, globalIdx }) {
  const { x, y } = badgePosition(index, total, skill.row)
  const floatDelay = `${(globalIdx * 0.3) % 2.4}s`

  return (
    <div
      className="orbit-badge"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        '--badge-color': skill.color,
        animationDelay: floatDelay,
      }}
      title={skill.name}
    >
      <span className={skill.dark ? 'orbit-badge-label orbit-badge-label--dark' : 'orbit-badge-label'}>
        {skill.label}
      </span>
    </div>
  )
}

export default function SkillsOrbit({ profile }) {
  if (!profile) return null

  const initialsMark = profile.name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <section className="orbit-section">
      <Reveal>
        <h2 className="orbit-headline">
          I'm currently looking to join a{' '}
          <span className="orbit-headline-accent">cross-functional team</span>
        </h2>
        <p className="orbit-subline">
          that values shipping real, working products — not just prototypes
        </p>
      </Reveal>

      <Reveal direction="scale" delay={100} className="orbit-visual">
        {/* Animated Connecting Energy Beams */}
        <svg className="orbit-lines" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="orbitBeamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFB7C5" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#C5A3FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#42d19b" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {ORBIT_SKILLS.map((skill, i) => {
            const rowItems = skill.row === 1 ? ROW1 : ROW2
            const idx = rowItems.indexOf(skill)
            const { x, y } = badgePosition(idx, rowItems.length, skill.row)
            const pathD = `M ${x} ${y + 3} Q ${50 + (x - 50) * 0.3} ${(y + 44) / 2} 50 44`
            const animDelay = `${(i * 0.25) % 2}s`

            return (
              <g key={skill.name}>
                {/* Background static guide line */}
                <path
                  d={pathD}
                  stroke="var(--border)"
                  strokeWidth="0.2"
                  fill="none"
                  opacity="0.4"
                />
                {/* Animated flowing light beam path */}
                <path
                  className="orbit-beam-path"
                  d={pathD}
                  stroke="url(#orbitBeamGrad)"
                  strokeWidth="0.45"
                  fill="none"
                  filter="url(#glowFilter)"
                  style={{ animationDelay: animDelay }}
                />
              </g>
            )
          })}
        </svg>

        {/* Floating Skill Badges */}
        {ORBIT_SKILLS.map((skill, globalIdx) => (
          <Badge
            key={skill.name}
            skill={skill}
            index={(skill.row === 1 ? ROW1 : ROW2).indexOf(skill)}
            total={(skill.row === 1 ? ROW1 : ROW2).length}
            globalIdx={globalIdx}
          />
        ))}

        {/* Animated 3D Orbiting Rings */}
        <div className="orbit-rings" aria-hidden="true">
          <div className="orbit-ring orbit-ring--1" />
          <div className="orbit-ring orbit-ring--2" />
          <div className="orbit-ring orbit-ring--3" />
        </div>

        {/* Animated Pulsing Core Node */}
        <div className="orbit-core" title={`${profile.name} — Center Node`}>
          <div className="orbit-core-sonar-ring orbit-core-sonar-1" aria-hidden="true" />
          <div className="orbit-core-sonar-ring orbit-core-sonar-2" aria-hidden="true" />
          <div className="orbit-core-spin-ring" aria-hidden="true" />
          <div className="orbit-core-glow" aria-hidden="true" />
          <span className="orbit-core-mark">{initialsMark}</span>
        </div>
      </Reveal>
    </section>
  )
}
