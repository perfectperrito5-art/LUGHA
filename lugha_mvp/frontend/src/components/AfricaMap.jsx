import { useState } from 'react'
import { COUNTRY_MAP } from '../data/countryMap.js'
import { AFRICA_MARKERS } from '../data/africaOutline.js'
import AfricaSilhouette from './AfricaSilhouette.jsx'

const HEALTH_LABEL = { high: 'Thriving', mid: 'Growing', low: 'At risk' }

const MARKER_ALIAS = { 'DR Congo': 'Dem. Rep. Congo' }

const MARKER_SIZES = {
  Nigeria: 11, Algeria: 10, Ethiopia: 10, 'South Africa': 10, Kenya: 9.5,
  Tanzania: 9.5, Egypt: 8.5, Mali: 8.5, default: 8,
}

export default function AfricaMap({ defaultCountry = 'Tanzania', liveCounts = {} }) {
  const [selected, setSelected] = useState(defaultCountry)
  const data = COUNTRY_MAP[selected] || {
    sub: 'Africa', health: 'growing', langs: 12, contribs: 400, words: '8,000', audio: '2,400',
    languages: [['Language A', 'mid']],
  }
  const live = liveCounts[selected]

  const markers = Object.keys(COUNTRY_MAP)
    .map((country) => {
      const pt = AFRICA_MARKERS[country] || AFRICA_MARKERS[MARKER_ALIAS[country]]
      if (!pt) return null
      return {
        country,
        cx: pt.cx,
        cy: pt.cy,
        r: MARKER_SIZES[country] || MARKER_SIZES.default,
      }
    })
    .filter(Boolean)

  return (
    <div className="map-layout">
      <div className="map-svg-wrap">
        <AfricaSilhouette variant="map" className="africa-svg" />
        <svg viewBox="0 0 480 520" className="africa-markers-svg">
          {markers.map((m) => {
            const c = COUNTRY_MAP[m.country]
            const health = c?.health || 'growing'
            return (
              <circle
                key={m.country}
                className={`country-dot ${health} ${selected === m.country ? 'selected' : ''}`}
                cx={m.cx}
                cy={m.cy}
                r={m.r}
                onClick={() => setSelected(m.country)}
              />
            )
          })}
        </svg>
        <p className="map-tip">Click any country to explore its languages</p>
      </div>
      <div className="country-panel">
        <h3>{selected}</h3>
        <p className="country-sub">{data.sub}</p>
        {live != null && live > 0 && (
          <p className="live-badge">🔴 {live} live contributions on Lugha</p>
        )}
        <div className="country-stat-row"><span>Languages</span><strong>{data.langs}</strong></div>
        <div className="country-stat-row"><span>Contributors</span><strong>{data.contribs.toLocaleString()}</strong></div>
        <div className="country-stat-row"><span>Words preserved</span><strong>{data.words}</strong></div>
        <div className="country-stat-row"><span>Audio samples</span><strong>{data.audio}</strong></div>
        <div className="lang-list-title">Featured languages</div>
        {data.languages.map(([lang, health]) => (
          <div key={lang} className="lang-row">
            <span>{lang}</span>
            <span className={`health-pill ${health}`}>{HEALTH_LABEL[health] || health}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
