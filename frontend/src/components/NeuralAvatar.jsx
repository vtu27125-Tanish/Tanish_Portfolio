import React, { useEffect, useRef } from 'react'

// A living particle mesh orbiting the avatar core: nodes drift inside a
// disc, nearby nodes link up into faint neural-net lines, and the whole
// field gently pulls toward the cursor when it's nearby. Reads as an
// "AI thinking" signature rather than a decorative spinner.
export default function NeuralAvatar({ label }) {
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    let width = 0
    let height = 0
    let radius = 0
    let cx = 0
    let cy = 0
    const pointer = { x: 0, y: 0, active: false }

    const NODE_COUNT = 22
    const LINK_DIST = 46
    let nodes = []

    function styleColor(name, fallback) {
      const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
      return v || fallback
    }

    function hexToRgb(hex) {
      const m = hex.replace('#', '')
      const bigint = parseInt(m.length === 3 ? m.split('').map((c) => c + c).join('') : m, 16)
      return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
    }

    let liveRgb = [244, 236, 214]
    let signalRgb = [244, 236, 214]

    function resize() {
      const rect = wrap.getBoundingClientRect()
      width = rect.width
      height = rect.height
      radius = width / 2 - 4
      cx = width / 2
      cy = height / 2
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function initNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.sqrt(Math.random()) * radius
        return {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: Math.random() * 1.3 + 0.9,
        }
      })
    }

    function step() {
      ctx.clearRect(0, 0, width, height)

      for (const n of nodes) {
        // gentle pull toward pointer when hovering, else ambient drift
        if (pointer.active) {
          const dx = pointer.x - n.x
          const dy = pointer.y - n.y
          const d = Math.hypot(dx, dy) || 1
          if (d < 60) {
            n.vx += (dx / d) * 0.006
            n.vy += (dy / d) * 0.006
          }
        }

        n.x += n.vx
        n.y += n.vy
        n.vx *= 0.995
        n.vy *= 0.995

        // contain within the disc — reflect off the boundary
        const dx = n.x - cx
        const dy = n.y - cy
        const dist = Math.hypot(dx, dy)
        if (dist > radius) {
          const nx = dx / dist
          const ny = dy / dist
          n.x = cx + nx * radius
          n.y = cy + ny * radius
          const dot = n.vx * nx + n.vy * ny
          n.vx -= 2 * dot * nx
          n.vy -= 2 * dot * ny
        }
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < LINK_DIST) {
            const alpha = (1 - d / LINK_DIST) * 0.35
            ctx.strokeStyle = `rgba(${signalRgb[0]}, ${signalRgb[1]}, ${signalRgb[2]}, ${alpha})`
            ctx.lineWidth = 0.7
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      // nodes
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${liveRgb[0]}, ${liveRgb[1]}, ${liveRgb[2]}, 0.85)`
        ctx.shadowColor = `rgba(${liveRgb[0]}, ${liveRgb[1]}, ${liveRgb[2]}, 0.9)`
        ctx.shadowBlur = 6
        ctx.fill()
      }
      ctx.shadowBlur = 0

      if (!prefersReduced) {
        rafRef.current = requestAnimationFrame(step)
      }
    }

    function onPointerMove(e) {
      const rect = wrap.getBoundingClientRect()
      pointer.x = e.clientX - rect.left
      pointer.y = e.clientY - rect.top
      pointer.active = true
    }
    function onPointerLeave() {
      pointer.active = false
    }

    const live = styleColor('--live', '#f8f3e4')
    const signal = styleColor('--signal', '#f4ecd6')
    liveRgb = hexToRgb(live)
    signalRgb = hexToRgb(signal)

    resize()
    initNodes()
    step()
    if (prefersReduced) {
      // draw a single static frame for reduced-motion users
      ctx.clearRect(0, 0, width, height)
      for (const n of nodes) {
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${liveRgb[0]}, ${liveRgb[1]}, ${liveRgb[2]}, 0.7)`
        ctx.fill()
      }
    }

    wrap.addEventListener('pointermove', onPointerMove)
    wrap.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('resize', resize)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      wrap.removeEventListener('pointermove', onPointerMove)
      wrap.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="neural-avatar-wrap" ref={wrapRef}>
      <canvas className="neural-canvas" ref={canvasRef} aria-hidden="true" />
      <div className="neural-core" aria-hidden="true" />
      <div className="hero-avatar">{label}</div>
    </div>
  )
}
