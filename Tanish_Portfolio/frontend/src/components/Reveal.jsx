import React from 'react'
import { useInView } from '../hooks/useInView.js'

/**
 * Wraps children in a div that animates into place once it scrolls into
 * the viewport. `delay` (ms) staggers groups of siblings. `direction`
 * controls the entrance style: 'up' (default), 'left', 'right', 'scale'.
 */
export default function Reveal({ children, delay = 0, direction = 'up', className = '' }) {
  const [ref, inView] = useInView()

  return (
    <div
      ref={ref}
      className={`reveal reveal--${direction} ${inView ? 'reveal--visible' : ''} ${className}`}
      style={{ transitionDelay: inView ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}
