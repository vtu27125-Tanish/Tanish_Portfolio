import React from 'react'
import Reveal from './Reveal.jsx'

export default function ScheduleCard({ profile }) {
  if (!profile) return null

  const stats = [
    { label: 'Projects', value: profile.projects?.length || 0 },
    { label: 'Certifications', value: profile.certifications?.length || 0 },
    { label: 'Focus', value: 'Machine Learning' },
  ]

  return (
    <section id="schedule" className="schedule">
      <Reveal direction="scale" className="schedule-card">
        <div className="schedule-banner">
          <div className="schedule-banner-scanline" aria-hidden="true" />
          <div className="schedule-banner-code" aria-hidden="true">
            <span>const candidate = {'{'}</span>
            <span>&nbsp;&nbsp;role: "ML Engineer",</span>
            <span>&nbsp;&nbsp;status: "open_to_work",</span>
            <span>&nbsp;&nbsp;stack: ["Python", "React", "FastAPI"]</span>
            <span>{'}'};</span>
            <span>SELECT * FROM candidates WHERE available = true;</span>
          </div>
          <div className="schedule-banner-fade" aria-hidden="true" />
        </div>

        <div className="schedule-avatar-wrap">
          <div className="schedule-avatar-ring" aria-hidden="true" />
          <div className="schedule-avatar-glow" aria-hidden="true" />
          <img className="schedule-avatar" src="/profile.jpg" alt={profile.name} />
        </div>

        <div className="schedule-body">
          <h3 className="schedule-name">{profile.name}</h3>
          <p className="schedule-sub">{profile.career_objective}</p>

          <div className="schedule-stats">
            {stats.map((s) => (
              <div key={s.label} className="schedule-stat">
                <span className="schedule-stat-value">{s.value}</span>
                <span className="schedule-stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="schedule-socials">
            {profile.social_links?.github && (
              <a
                href={profile.social_links.github}
                target="_blank"
                rel="noreferrer"
                className="schedule-social-btn"
                aria-label="GitHub"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.4 7.86 10.93.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.23 2.77.11 3.06.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.4-5.28 5.69.42.36.78 1.08.78 2.17 0 1.57-.01 2.83-.01 3.22 0 .3.2.66.79.55A10.52 10.52 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
                </svg>
              </a>
            )}
            {profile.social_links?.linkedin && (
              <a
                href={profile.social_links.linkedin}
                target="_blank"
                rel="noreferrer"
                className="schedule-social-btn"
                aria-label="LinkedIn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
                </svg>
              </a>
            )}
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.contact?.email}`}
              target="_blank"
              rel="noreferrer"
              className="schedule-social-btn"
              aria-label="Email"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
                <path d="M3 6.5l9 6.5 9-6.5" />
              </svg>
            </a>
          </div>

          <div className="schedule-verified">
            <span className="schedule-verified-icon">✓</span>
            PORTFOLIO VERIFIED PROFILE
          </div>
        </div>
      </Reveal>
    </section>
  )
}
