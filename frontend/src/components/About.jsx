import React from 'react'
import Reveal from './Reveal.jsx'
import { SkeletonCard, SkeletonLine } from './Skeleton.jsx'

const PROFICIENCY_MAP = {
  // Advanced (4/4)
  'Python': { level: 'Advanced', dots: 4 },
  'Java': { level: 'Advanced', dots: 4 },
  'JavaScript': { level: 'Advanced', dots: 4 },
  'REST API': { level: 'Advanced', dots: 4 },
  'Gemini API': { level: 'Advanced', dots: 4 },
  'Prompt Engineering': { level: 'Advanced', dots: 4 },
  'Agentic AI': { level: 'Advanced', dots: 4 },
  'HTML5': { level: 'Advanced', dots: 4 },
  'CSS3': { level: 'Advanced', dots: 4 },
  'Git': { level: 'Advanced', dots: 4 },
  'GitHub': { level: 'Advanced', dots: 4 },
  'MySQL 8.0': { level: 'Advanced', dots: 4 },
  'Data Structures & Algorithms': { level: 'Advanced', dots: 4 },
  'OOP': { level: 'Advanced', dots: 4 },
  'DBMS': { level: 'Advanced', dots: 4 },

  // Intermediate (3/4)
  'SQL': { level: 'Intermediate', dots: 3 },
  'SQL Optimization': { level: 'Intermediate', dots: 3 },
  'Tailwind CSS': { level: 'Intermediate', dots: 3 },
  'Scikit-learn': { level: 'Intermediate', dots: 3 },
  'NumPy': { level: 'Intermediate', dots: 3 },
  'Pandas': { level: 'Intermediate', dots: 3 },
  'Bootstrap 5': { level: 'Intermediate', dots: 3 },
  'PHP': { level: 'Intermediate', dots: 3 },
  'PHP 8': { level: 'Intermediate', dots: 3 },
  'MVC': { level: 'Intermediate', dots: 3 },
  'VS Code': { level: 'Intermediate', dots: 3 },
  'Operating Systems': { level: 'Intermediate', dots: 3 },
  'Computer Networks': { level: 'Intermediate', dots: 3 },

  // Proficient (2/4)
  'NLTK': { level: 'Proficient', dots: 2 },
  'TF-IDF': { level: 'Proficient', dots: 2 },
  'Matplotlib': { level: 'Proficient', dots: 2 },
  'MySQL Workbench': { level: 'Proficient', dots: 2 },
  'XAMPP': { level: 'Proficient', dots: 2 },
  'Agile/Scrum': { level: 'Proficient', dots: 2 },
}

function getSkillMeta(skill) {
  return PROFICIENCY_MAP[skill] || { level: 'Proficient', dots: 3 }
}

function SkillProficiencyDots({ dots }) {
  return (
    <span className="skill-dots" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={`skill-dot ${i <= dots ? 'is-filled' : ''}`}
        />
      ))}
    </span>
  )
}

export default function About({ profile }) {
  if (!profile) {
    return (
      <section id="about" className="about">
        <div className="section-eyebrow">About</div>
        <SkeletonLine width="240px" height="2.2rem" style={{ marginBottom: '1.5rem' }} />
        <SkeletonLine width="90%" height="1.1rem" />
        <SkeletonLine width="75%" height="1.1rem" style={{ marginTop: '0.5rem', marginBottom: '2.5rem' }} />
        <div className="about-grid">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </section>
    )
  }

  const skillGroups = Object.entries(profile.skills || {}).filter(([, v]) => v.length)

  return (
    <section id="about" className="about">
      <Reveal>
        <p className="section-eyebrow">About</p>
        <h2 className="section-title">Who I am</h2>
        <p className="about-objective">{profile.career_objective}</p>
      </Reveal>

      <div className="about-grid">
        <Reveal direction="left" className="about-block">
          <h3 className="about-block-title">Education</h3>
          {profile.education?.map((edu, i) => (
            <div key={i} className="about-edu-item">
              <div className="about-edu-degree">{edu.degree}</div>
              <div className="about-edu-meta">
                {edu.institution} · {edu.duration}
              </div>
            </div>
          ))}
        </Reveal>

        <div className="about-block">
          <h3 className="about-block-title">Skills & Proficiency</h3>
          <div className="about-skills">
            {skillGroups.map(([category, items], i) => (
              <Reveal key={category} direction="right" delay={i * 70} className="skill-group">
                <span className="skill-group-label">
                  {category.replace(/_/g, ' ')}
                </span>
                <div className="tag-row">
                  {items.map((s) => {
                    const meta = getSkillMeta(s)
                    return (
                      <span key={s} className="tag tag--with-dots" title={`${s} — ${meta.level}`}>
                        <span className="tag-text">{s}</span>
                        <SkillProficiencyDots dots={meta.dots} />
                      </span>
                    )
                  })}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {profile.certifications?.length > 0 && (
        <div className="about-block about-block--full">
          <h3 className="about-block-title">Certifications</h3>
          <div className="cert-list">
            {profile.certifications.map((c, i) => (
              <Reveal key={c.name} delay={i * 60} className="cert-item">
                <span className="cert-name">{c.name}</span>
                <span className="cert-issuer">{c.issuer}</span>
                {c.verify_link ? (
                  <a
                    className="cert-verify-badge cert-verify-badge--linked"
                    href={c.verify_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    ✓ Verified
                  </a>
                ) : (
                  <span className="cert-verify-badge">Certificate</span>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
