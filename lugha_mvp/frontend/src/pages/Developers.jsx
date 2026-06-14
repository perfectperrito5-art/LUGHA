import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav.jsx'
import api from '../api'

export default function Developers() {
  const [manifest, setManifest] = useState(null)
  const [sample, setSample] = useState(null)

  useEffect(() => {
    api.get('').then((r) => setManifest(r.data)).catch(() => {})
    api.get('/v1/knowledge/entries', { params: { limit: 3, min_confidence: 40 } })
      .then((r) => setSample(r.data))
      .catch(() => {})
  }, [])

  return (
    <>
      <Nav />
      <div className="page dev-page">
        <div className="dev-hero">
          <p className="playground-eyebrow">API-first infrastructure</p>
          <h1>{manifest?.name || 'Lugha API'}</h1>
          <p className="muted">{manifest?.description}</p>
          <div className="dev-links">
            <a href="http://localhost:8000/docs" target="_blank" rel="noreferrer" className="btn-primary">
              OpenAPI docs →
            </a>
            <Link to="/heritage" className="btn-ghost">Browse knowledge</Link>
          </div>
        </div>

        {manifest?.endpoints?.map((group) => (
          <section key={group.group} className="dev-section">
            <h2>{group.group}</h2>
            <code className="dev-base">{group.base}</code>
            <ul className="dev-routes">
              {group.routes.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        ))}

        {sample?.items?.length > 0 && (
          <section className="dev-section">
            <h2>Live knowledge sample</h2>
            <p className="muted">GET /api/v1/knowledge/entries — confidence-weighted, not absolute truth.</p>
            <pre className="dev-json">{JSON.stringify(sample.items[0], null, 2)}</pre>
          </section>
        )}

        <section className="dev-section dev-philosophy">
          <h2>Design philosophy</h2>
          <ul>
            <li>Every endpoint surfaces or produces linguistic assets</li>
            <li>Confidence scores reflect community verification, not single authority</li>
            <li>Games generate vocabulary, proverb, and dialect signals without feeling like data entry</li>
          </ul>
        </section>
      </div>
    </>
  )
}
