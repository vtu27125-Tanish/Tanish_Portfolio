import React from 'react'

export default function ThemeSelector({ currentTheme, onSelectTheme }) {
  const isRose = currentTheme === 'rose' || currentTheme === 'light'
  const isEmerald = !isRose

  return (
    <div className="theme-selector-container">
      <div className="theme-selector-header">
        <h3 className="theme-selector-title">Select Color Palette</h3>
        <p className="theme-selector-subtitle">
          Switch between Rose Quartz &amp; Emerald Depths
        </p>
      </div>

      <div className="theme-cards-grid">
        {/* Rose Quartz Theme Card */}
        <button
          type="button"
          className={`theme-card theme-card--rose ${isRose ? 'is-active' : ''}`}
          onClick={() => onSelectTheme('rose')}
          aria-label="Select Rose Quartz theme"
        >
          <div className="theme-card-body">
            <h4 className="theme-card-name">Rose Quartz</h4>
            <div className="theme-card-pill">#FFB7C5 | #C5A3FF</div>
          </div>
          {isRose && (
            <div className="theme-card-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Active Theme
            </div>
          )}
        </button>

        {/* Emerald Depths Theme Card */}
        <button
          type="button"
          className={`theme-card theme-card--emerald ${isEmerald ? 'is-active' : ''}`}
          onClick={() => onSelectTheme('emerald')}
          aria-label="Select Emerald Depths theme"
        >
          <div className="theme-card-body">
            <h4 className="theme-card-name">Emerald Depths</h4>
            <div className="theme-card-pill">#1B4332 | #004D40</div>
          </div>
          {isEmerald && (
            <div className="theme-card-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Active Theme
            </div>
          )}
        </button>
      </div>
    </div>
  )
}
