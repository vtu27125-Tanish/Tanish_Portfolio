import React from 'react'

function initials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Sidebar({ profile, connected }) {
  if (!profile) {
    return (
      <aside className="sidebar">
        <div className="sidebar-loading">Loading dossier…</div>
      </aside>
    )
  }

  const topSkills = [
    ...(profile.skills?.programming_languages || []),
    ...(profile.skills?.ai_and_ml || []),
  ].slice(0, 8)

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="avatar">{initials(profile.name)}</div>
        <div>
          <h1 className="candidate-name">{profile.name}</h1>
          <div className={`status-line ${connected ? 'is-live' : 'is-offline'}`}>
            <span className="status-dot" />
            {connected ? 'AGENT ONLINE' : 'CONNECTING…'}
          </div>
        </div>
      </div>

      <p className="objective">{profile.career_objective}</p>

      <div className="sidebar-section">
        <h2 className="section-label">Education</h2>
        {profile.education?.map((edu, i) => (
          <div key={i} className="education-item">
            <div className="education-degree">{edu.degree}</div>
            <div className="education-meta">
              {edu.institution} · {edu.duration}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-section">
        <h2 className="section-label">Core Stack</h2>
        <div className="tag-row">
          {topSkills.map((skill) => (
            <span key={skill} className="tag">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <h2 className="section-label">Projects</h2>
        <div className="project-chip-list">
          {profile.projects?.map((p) => (
            <a
              key={p.name}
              className="project-chip"
              href={p.link || undefined}
              target="_blank"
              rel="noreferrer"
            >
              <span className="project-chip-name">{p.name}</span>
              <span className="project-chip-tagline">{p.tagline}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        {profile.social_links?.github && (
          <a href={profile.social_links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        )}
        {profile.social_links?.linkedin && (
          <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        )}
      </div>
    </aside>
  )
}
