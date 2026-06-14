import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../api'
import LanguageTapestry from '../components/LanguageTapestry.jsx'
import AfricaSilhouette from '../components/AfricaSilhouette.jsx'
import { formatWordsStat, formatGuardiansStat } from '../utils/formatStat.js'

export default function Landing() {
  const [live, setLive] = useState({ total_words: 0, total_contributors: 0 })

  useEffect(() => {
    api.get('/contributions/stats').then((r) => setLive(r.data)).catch(() => {})
  }, [])

  return (
    <div className="landing">
      <LanguageTapestry />

      <div className="landing-aurora" />
      <div className="landing-kente" />

      <AfricaSilhouette variant="landing" />

      <nav className="landing-nav">
        <div className="landing-logo">Lugha<span>.</span></div>
        <div className="landing-nav-links">
          <Link to="/login" className="btn-ghost">Sign in</Link>
          <Link to="/register" className="btn-primary">Join the movement</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <motion.div
          className="hero-eyebrow"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5 }}
        >
          <span className="dot" />
          African linguistic heritage · passed from generation to generation
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .1 }}
        >
          Every language<br />is a <em>living inheritance.</em>
        </motion.h1>

        <motion.p className="hero-heritage"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6, delay: .22 }}
        >
          “What your grandmother whispered — your children can still hear.”
        </motion.p>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6, delay: .3 }}
        >
          Africa carries <strong>2000+ living languages</strong> — proverbs, songs, names, and worlds
          that most AI has never learned. Lugha is where speakers become guardians: teaching machines
          your mother tongue, archiving oral culture, and carrying our linguistic future forward.
        </motion.p>

        <motion.div
          className="hero-cta"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, delay: .5 }}
        >
          <Link to="/register" className="btn-hero">Preserve your language →</Link>
          <Link to="/login" className="btn-ghost hero-ghost">I already have an account</Link>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .6, delay: .7 }}
        >
          <div className="hero-stat">
            <div className="hero-stat-num">2K+</div>
            <div className="hero-stat-label">African languages</div>
            <div className="hero-stat-hint">our continent&apos;s voice</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <div className="hero-stat-num">54</div>
            <div className="hero-stat-label">Nations</div>
            <div className="hero-stat-hint">one shared mission</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat live">
            <div className="hero-stat-num">{formatWordsStat(live.total_words)}</div>
            <div className="hero-stat-label">Words preserved</div>
            <div className="hero-stat-hint">on Lugha today</div>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat live">
            <div className="hero-stat-num">{formatGuardiansStat(live.total_contributors)}</div>
            <div className="hero-stat-label">Guardians</div>
            <div className="hero-stat-hint">teaching AI now</div>
          </div>
        </motion.div>

        <motion.p
          className="hero-footnote"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .9 }}
        >
          From oral tradition to open data — built for the Africa Innovation Hackathon
        </motion.p>
      </section>
    </div>
  )
}
