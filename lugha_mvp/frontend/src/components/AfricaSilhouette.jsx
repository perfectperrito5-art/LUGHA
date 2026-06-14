import { AFRICA_VIEWBOX, AFRICA_PATHS } from '../data/africaOutline.js'

/**
 * Accurate Africa continent silhouette (Natural Earth 110m).
 * variant: 'landing' — decorative background | 'map' — interactive heat map base
 */
export default function AfricaSilhouette({ variant = 'landing', className = '' }) {
  const isLanding = variant === 'landing'
  const gid = isLanding ? 'landing-africa' : 'map-africa'

  return (
    <svg
      className={`africa-silhouette ${isLanding ? 'africa-silhouette--landing' : 'africa-silhouette--map'} ${className}`}
      viewBox={AFRICA_VIEWBOX}
      fill="none"
      aria-hidden={isLanding}
      role={isLanding ? undefined : 'img'}
      aria-label={isLanding ? undefined : 'Map of Africa'}
    >
      <defs>
        <linearGradient id={`${gid}-stroke`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5DCAA5" stopOpacity={isLanding ? 0.45 : 0.55} />
          <stop offset="100%" stopColor="#1D9E75" stopOpacity={isLanding ? 0.2 : 0.35} />
        </linearGradient>
        <radialGradient id={`${gid}-fill`} cx="48%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#1D9E75" stopOpacity={isLanding ? 0.14 : 0.22} />
          <stop offset="100%" stopColor="#0a1324" stopOpacity="0" />
        </radialGradient>
        {isLanding && (
          <filter id={`${gid}-glow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      <g className="africa-landmass" filter={isLanding ? `url(#${gid}-glow)` : undefined}>
        {AFRICA_PATHS.map(({ name, d }) => (
          <path
            key={name}
            className={isLanding ? 'africa-land-path' : 'africa-base'}
            d={d}
            stroke={`url(#${gid}-stroke)`}
            strokeWidth={isLanding ? 0.65 : 0.9}
            strokeLinejoin="round"
            fill={`url(#${gid}-fill)`}
          />
        ))}
      </g>
    </svg>
  )
}
