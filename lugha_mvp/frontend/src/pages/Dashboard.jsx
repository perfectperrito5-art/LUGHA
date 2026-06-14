import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import Nav from '../components/Nav.jsx'
import api from '../api'
import { useAuth } from '../auth.jsx'

const CARDS = [
  { to: '/teach',       icon: '🎙', title: 'Teach AI', desc: 'Contribute words, phrases, and voice recordings.', color: '#1D9E75' },
  { to: '/translate',   icon: '🌍', title: 'AI Translator', desc: 'Translate across African and world languages.', color: '#FFB347' },
  { to: '/heritage',    icon: '📚', title: 'Heritage Library', desc: 'Proverbs, folktales, songs & stories.', color: '#A78BFA' },
  { to: '/play',        icon: '✦', title: 'Cultural Playground', desc: 'Gentle word games that strengthen the knowledge graph.', color: '#FAC775' },
  { to: '/developers',  icon: '⚡', title: 'API & Knowledge', desc: 'Linguistic intelligence endpoints for builders.', color: '#5DCAA5' },
  { to: '/map',         icon: '🗺', title: 'Language Map', desc: 'Vitality scores & at-risk languages.', color: '#5DCAA5' },
  { to: '/leaderboard', icon: '🏆', title: 'Leaderboard', desc: 'Climb the ranks as a language guardian.', color: '#FF6B6B' },
  { to: '/live',        icon: '🔴', title: 'Live Feed', desc: 'Watch Africa preserve languages in real time.', color: '#7F77DD' },
  { to: '/partners',    icon: '👥', title: 'Language Partners', desc: 'Practice with native speakers near you.', color: '#5DCAA5' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [welcome, setWelcome] = useState(location.state?.welcome === true)
  const [global, setGlobal] = useState({ total_words: 0, total_languages: 0, total_contributors: 0, heritage_stories: 0 })
  const [me, setMe] = useState(null)

  useEffect(() => {
    api.get('/contributions/stats').then((r) => setGlobal(r.data))
    api.get('/contributions/me/stats').then((r) => setMe(r.data)).catch(() => {})
  }, [])

  const speaks = me?.speaks?.length ? me.speaks : ['Your languages']
  const learning = me?.learning?.length ? me.learning : []

  return (
    <>
      <Nav />
      <div className="page">
        {welcome && (
          <motion.div
            className="dash-welcome-banner"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <strong>Karibu, @{location.state?.username || user?.username}!</strong>
              <span> Your guardian profile is live — teach AI your first word to begin.</span>
            </div>
            <button type="button" onClick={() => setWelcome(false)} aria-label="Dismiss">×</button>
          </motion.div>
        )}

        <div className="dash-welcome">
          <div>
            <h1>Welcome back, {user?.name} 👋</h1>
            <p className="muted">
              {me?.words_contributed
                ? `You've preserved ${me.words_contributed} words · Rank #${me.rank} globally`
                : 'Start teaching AI your mother tongue today.'}
            </p>
          </div>
          <div className="dash-date">
            {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
          </div>
        </div>

        <div className="prog-grid dash-progress-bar">
          <div className="prog-card">
            <div className="prog-label">Your points</div>
            <div className="prog-val">{me?.points ?? user?.points ?? 0}</div>
            <div className="prog-bar"><div className="prog-fill" style={{ width: `${Math.min(100, ((me?.points ?? 0) / 1500) * 100)}%` }} /></div>
          </div>
          <div className="prog-card">
            <div className="prog-label">Words contributed</div>
            <div className="prog-val">{me?.words_contributed ?? 0}</div>
            <div className="prog-bar"><div className="prog-fill warn" style={{ width: `${Math.min(100, ((me?.words_contributed ?? 0) / 50) * 100)}%` }} /></div>
          </div>
          <div className="prog-card streak">
            <div className="streak-icon">🔥</div>
            <div className="prog-val">{me?.streak_days ?? 0}</div>
            <div className="prog-label">Day streak</div>
          </div>
          <div className="prog-card">
            <div className="prog-label">Community preserved</div>
            <div className="prog-val">{global.total_words}</div>
            <div className="prog-bar"><div className="prog-fill purple" style={{ width: `${Math.min(100, global.total_words / 2)}%` }} /></div>
          </div>
        </div>

        <div className="lang-banner">
          <div>
            <h3>Your language profile</h3>
            <p>{speaks.length} spoken · {learning.length} learning · {global.heritage_stories || 0} heritage stories on Lugha</p>
            <div className="lang-badges">
              {speaks.slice(0, 4).map((l) => <span key={l} className="lang-badge speaks">{l}</span>)}
              {learning.slice(0, 2).map((l) => <span key={l} className="lang-badge learning">{l} →</span>)}
            </div>
          </div>
          <button type="button" className="lang-banner-btn" onClick={() => navigate('/teach')}>
            Teach AI your language →
          </button>
        </div>

        <h2 className="section-title">Your tools</h2>
        <div className="dash-grid">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.to}
              className="dash-card"
              onClick={() => navigate(c.to)}
              style={{ '--card-accent': c.color }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: .35, delay: i * .05 }}
              whileHover={{ scale: 1.015 }}
            >
              <div className="icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  )
}
