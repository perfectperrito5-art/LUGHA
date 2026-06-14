import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Nav from '../components/Nav.jsx'
import api from '../api'
import { useAuth } from '../auth.jsx'

export default function Leaderboard() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [me, setMe] = useState(null)
  const [badges, setBadges] = useState([])
  const [tab, setTab] = useState('global')

  useEffect(() => {
    api.get('/leaderboard').then((r) => setRows(r.data))
    api.get('/leaderboard/me').then((r) => setMe(r.data)).catch(() => {})
    api.get('/badges').then((r) => setBadges(r.data))
  }, [])

  const filtered = tab === 'week'
    ? rows.slice(0, 10)
    : rows

  return (
    <>
      <Nav />
      <div className="page lb-page">
        <div className="lb-hero">
          <div>
            <h2>Language Guardians</h2>
            <p>The keepers of Africa&apos;s living heritage</p>
          </div>
          <div className="lb-hero-rank">
            <div className="lb-your-rank">#{me?.rank ?? '—'}</div>
            <div className="lb-your-label">Your global rank</div>
          </div>
        </div>

        <div className="lb-tabs">
          {['global', 'country', 'week'].map((t) => (
            <button
              key={t}
              type="button"
              className={`lb-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'global' ? 'Global' : t === 'country' ? 'By country' : 'This week'}
            </button>
          ))}
        </div>

        <div className="lb-list">
          {filtered.map((r) => (
            <div key={r.user_id} className={`lb-item ${user?.id === r.user_id ? 'you' : ''}`}>
              <div className={`lb-rank ${r.rank <= 3 ? `rank-${r.rank}` : ''}`}>
                {r.rank === 1 ? '1' : r.rank === 2 ? '2' : r.rank === 3 ? '3' : r.rank}
              </div>
              <div className="lb-avatar" style={{ background: `hsl(${r.user_id * 53 % 360}, 42%, 40%)` }}>
                {r.avatar_initial}
              </div>
              <div className="lb-info">
                <div className="lb-name">{r.name}{user?.id === r.user_id ? ' (You)' : ''}</div>
                <div className="lb-detail">{r.contributions} contributions</div>
              </div>
              <div className="lb-badges-row">
                {r.badges.slice(0, 3).map((b, i) => (
                  <span key={i} className="lb-badge-icon" title={b}>{b.split(' ')[0]}</span>
                ))}
              </div>
              <div className="lb-score">
                <div className="lb-score-num">{r.points}</div>
                <div className="lb-score-label">points</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="muted" style={{ padding: '1.5rem' }}>No contributors yet.</p>}
        </div>

        <p className="lb-tagline">Earn badges, preserve languages, climb the ranks.</p>

        <div className="lb-trophies">
          {badges.map((b) => (
            <motion.div
              key={b.code}
              className="trophy-card"
              whileHover={{ y: -4 }}
            >
              <div className="trophy-icon">{b.icon}</div>
              <div className="trophy-name">{b.name}</div>
              <div className="trophy-desc">{b.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}
