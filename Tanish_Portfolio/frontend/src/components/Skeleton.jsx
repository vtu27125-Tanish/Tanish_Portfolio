import React from 'react'

export function SkeletonLine({ width = '100%', height = '1rem', className = '' }) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`skeleton-card ${className}`} aria-hidden="true">
      <SkeletonLine width="40%" height="1.4rem" />
      <SkeletonLine width="75%" height="1rem" style={{ marginTop: '0.75rem' }} />
      <SkeletonLine width="90%" height="0.9rem" style={{ marginTop: '0.5rem' }} />
      <SkeletonLine width="60%" height="0.9rem" style={{ marginTop: '0.5rem' }} />
      <div className="skeleton-tags" style={{ display: 'flex', gap: '8px', marginTop: '1rem' }}>
        <SkeletonLine width="60px" height="24px" />
        <SkeletonLine width="80px" height="24px" />
        <SkeletonLine width="70px" height="24px" />
      </div>
    </div>
  )
}

export function SkeletonProfile() {
  return (
    <div className="skeleton-profile-wrap">
      <div className="skeleton-hero">
        <SkeletonLine width="200px" height="1.2rem" />
        <SkeletonLine width="70%" height="2.8rem" style={{ margin: '1rem 0' }} />
        <SkeletonLine width="85%" height="1.1rem" />
        <SkeletonLine width="60%" height="1.1rem" style={{ marginTop: '0.5rem' }} />
      </div>
      <div className="skeleton-grid">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
