import React from 'react'

export default function Footer({ name }) {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} {name || ''}</span>
      <span className="site-footer-tag">Built with React, FastAPI &amp; Groq</span>
    </footer>
  )
}
