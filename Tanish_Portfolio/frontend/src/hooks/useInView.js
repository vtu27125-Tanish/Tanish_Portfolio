import { useEffect, useRef, useState } from 'react'

/**
 * Returns a ref to attach to an element and a boolean that flips to true
 * once the element scrolls into view. Stays true afterward (no re-hiding
 * on scroll-away), which reads as more polished than flicker-on-rescroll.
 */
export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect users who've asked for reduced motion — show immediately.
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}
