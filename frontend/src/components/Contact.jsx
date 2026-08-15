import React from 'react'
import Reveal from './Reveal.jsx'

export default function Contact({ profile }) {
  if (!profile) return null

  return (
    <section id="contact" className="contact">
      <div className="contact-glow" aria-hidden="true" />
      <Reveal>
        <p className="section-eyebrow">Get in touch</p>
        <h2 className="section-title">Let's work together</h2>
        <p className="contact-sub">
          Prefer email over chat? I'm just as reachable the old-fashioned way.
        </p>

        <a
          className="contact-email"
          href={`https://mail.google.com/mail/?view=cm&fs=1&to=${profile.contact?.email}`}
          target="_blank"
          rel="noreferrer"
        >
          {profile.contact?.email}
        </a>

        {import.meta.env.VITE_CALENDLY_URL && (
          <a
            className="btn-primary contact-book-btn"
            href={import.meta.env.VITE_CALENDLY_URL}
            target="_blank"
            rel="noreferrer"
          >
            Book a call →
          </a>
        )}

        <div className="contact-links">
          {profile.social_links?.linkedin && (
            <a href={profile.social_links.linkedin} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          )}
          {profile.social_links?.github && (
            <a href={profile.social_links.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          )}
        </div>
      </Reveal>
    </section>
  )
}
