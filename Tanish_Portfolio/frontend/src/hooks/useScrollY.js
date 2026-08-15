import { useEffect, useState, useRef } from 'react'

/**
 * Returns the current window.scrollY, updated via rAF-throttled scroll
 * listener so it's cheap enough to drive continuous parallax effects.
 */
export function useScrollY() {
  const [scrollY, setScrollY] = useState(typeof window !== 'undefined' ? window.scrollY : 0)
  const ticking = useRef(false)

  useEffect(() => {
    function onScroll() {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY)
          ticking.current = false
        })
        ticking.current = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return scrollY
}
