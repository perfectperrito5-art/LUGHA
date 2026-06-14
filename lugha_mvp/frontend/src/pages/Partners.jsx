import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Nav from '../components/Nav.jsx'
import api from '../api'
import { useAuth } from '../auth.jsx'

export default function Partners() {
  const { user } = useAuth()
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/partners')
      .then((r) => setPartners(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Nav />
      <div className="page">
        <div className="page-head">
          <h1>Language Partners</h1>
          <p>Connect with native speakers across Africa — matched by the languages you speak and want to learn.</p>
        </div>

        <div className="partners-hero">
          <div>
            <h2>Your exchange profile</h2>
            <p>Lugha matches you with guardians who complement your language journey.</p>
          </div>
          <div className="partners-you">
            <div className="avatar lg">{user?.avatar_initial}</div>
            <span>{user?.name}</span>
          </div>
        </div>

        {loading && <p className="muted">Finding partners…</p>}

        <div className="partners-grid">
          {partners.map((p, i) => (
            <motion.div
              key={p.user_id}
              className="partner-card"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="partner-top">
                <div className="avatar" style={{ background: `hsl(${p.user_id * 47 % 360}, 45%, 42%)` }}>
                  {p.avatar_initial}
                </div>
                <div>
                  <div className="partner-name">{p.name}</div>
                  <div className="partner-meta">{p.flag_emoji} {p.country} · {p.points} pts</div>
                </div>
                <div className="match-score">{p.match_score >= 4 ? '★★★' : p.match_score >= 2 ? '★★' : '★'}</div>
              </div>
              <p className="partner-reason">{p.reason}</p>
              <div className="partner-langs">
                {p.languages.map((l) => (
                  <span key={l} className="lang-badge speaks">{l}</span>
                ))}
              </div>
              <button type="button" className="btn-partner" onClick={() => alert(`Demo: start chat with ${p.name} — ship this post-hackathon!`)}>
                Connect →
              </button>
            </motion.div>
          ))}
        </div>

        {!loading && partners.length === 0 && (
          <div className="empty-partners">
            <p>Add languages you&apos;re learning in your profile to unlock partner matches.</p>
          </div>
        )}
      </div>
    </>
  )
}
