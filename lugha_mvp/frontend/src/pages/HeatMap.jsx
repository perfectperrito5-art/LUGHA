import { useEffect, useState } from 'react'
import Nav from '../components/Nav.jsx'
import AfricaMap from '../components/AfricaMap.jsx'
import api from '../api'

export default function HeatMap() {
  const [heatmap, setHeatmap] = useState([])
  const [liveCounts, setLiveCounts] = useState({})

  useEffect(() => {
    api.get('/contributions/heatmap').then((r) => {
      setHeatmap(r.data)
      const counts = {}
      r.data.forEach((d) => { counts[d.country] = d.contributions })
      setLiveCounts(counts)
    })
  }, [])

  return (
    <>
      <Nav />
      <div className="page map-page">
        <div className="map-header-row">
          <div>
            <h1>African Language Heat Map</h1>
            <p>Explore language vitality, contributors, and at-risk languages across the continent.</p>
          </div>
          <div className="map-legend">
            <span><i className="dot thriving" /> Thriving</span>
            <span><i className="dot growing" /> Growing</span>
            <span><i className="dot atrisk" /> At risk</span>
          </div>
        </div>

        <AfricaMap defaultCountry="Tanzania" liveCounts={liveCounts} />

        {heatmap.length > 0 && (
          <>
            <h2 className="section-title" style={{ marginTop: '2.5rem' }}>Live Lugha contributions</h2>
            <div className="heat-grid">
              {heatmap.map((d) => (
                <div key={d.iso_code} className="heat-card">
                  <div className="heat-pulse" />
                  <div className="heat-flag">{d.flag_emoji}</div>
                  <div className="heat-country">{d.country}</div>
                  <div className="heat-count">{d.contributions}</div>
                  <div className="heat-label">on Lugha</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
