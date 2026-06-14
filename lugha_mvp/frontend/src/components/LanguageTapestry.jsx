import { useMemo } from 'react'
import { buildTapestryLayout, buildTapestryLinks } from '../data/generateTapestryLayout.js'

export default function LanguageTapestry() {
  const items = useMemo(() => buildTapestryLayout(), [])
  const links = useMemo(() => buildTapestryLinks(items), [items])

  return (
    <div className="lang-tapestry" aria-hidden>
      <svg className="tapestry-links" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="link-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5DCAA5" stopOpacity="0" />
            <stop offset="50%" stopColor="#5DCAA5" stopOpacity="1" />
            <stop offset="100%" stopColor="#5DCAA5" stopOpacity="0" />
          </linearGradient>
        </defs>
        {links.map((ln, i) => (
          <line
            key={i}
            x1={ln.x1}
            y1={ln.y1}
            x2={ln.x2}
            y2={ln.y2}
            stroke="url(#link-grad)"
            strokeOpacity={ln.opacity}
            strokeWidth="0.08"
          />
        ))}
      </svg>

      <div className="tapestry-words">
        {items.map((w) => (
          <span
            key={w.id}
            className={`tapestry-word cluster-${w.cluster}`}
            style={{
              left: `${w.x}%`,
              top: `${w.y}%`,
              '--tw-rotate': `${w.rotate}deg`,
              '--tw-size': `${w.size}px`,
              '--tw-opacity': w.opacity,
              color: w.color,
              fontWeight: w.weight,
              animationDelay: w.delay,
              animationDuration: w.duration || '8s',
            }}
          >
            {w.name}
          </span>
        ))}
      </div>

      <div className="tapestry-vignette" />
      <div className="tapestry-grain" />
    </div>
  )
}
