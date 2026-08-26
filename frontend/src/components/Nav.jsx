import React, { useEffect, useState } from 'react'

const SECTIONS = ['home', 'about', 'projects', 'chat']

export default function Nav({ name }) {
  const [active, setActive] = useState('home')

  const logoName = name
    ? (name.split(' ').find((w) => w.length > 2) || name.split(' ')[0]).replace(/\.$/, '')
    : 'Tanish'

  useEffect(() => {
    function handleScroll() {
      const scrollPos = window.scrollY + window.innerHeight * 0.3
      let current = 'home'
      for (const id of SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= scrollPos) {
          current = id
        }
      }
      setActive(current)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function scrollTo(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="nav">
      <button className="nav-logo" onClick={() => scrollTo('home')}>
        {logoName}<span className="nav-logo-dot">.</span>
      </button>
      <div className="nav-links">
        <button className={active === 'home' ? 'is-active' : ''} onClick={() => scrollTo('home')}>
          Home
        </button>
        <button className={active === 'about' ? 'is-active' : ''} onClick={() => scrollTo('about')}>
          About
        </button>
        <button
          className={active === 'projects' ? 'is-active' : ''}
          onClick={() => scrollTo('projects')}
        >
          Projects
        </button>

      </div>
    </nav>
  )
}
