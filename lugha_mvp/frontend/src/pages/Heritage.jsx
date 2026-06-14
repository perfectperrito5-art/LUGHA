import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Nav from '../components/Nav.jsx'
import api from '../api'
import ConfidenceBadge from '../components/ConfidenceBadge.jsx'

const FILTERS = [
  { id: '', label: 'All' },
  { id: 'proverb', label: 'Proverbs' },
  { id: 'folktale', label: 'Folktales' },
  { id: 'song', label: 'Songs' },
  { id: 'story', label: 'Stories' },
  { id: 'riddle', label: 'Riddles' },
  { id: 'word', label: 'Words' },
]

const TYPE_COLORS = { proverb: '#FAC775', folktale: '#5DCAA5', song: '#AFA9EC', story: '#7F77DD', riddle: '#F0997B', word: '#1D9E75' }

export default function Heritage() {
  const [items, setItems] = useState([])
  const [languages, setLanguages] = useState([])
  const [filter, setFilter] = useState('')
  const [langFilter, setLangFilter] = useState('')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ heritage_stories: 0, total_languages: 0, total_contributors: 0 })

  const load = () => {
    const params = { limit: 60 }
    if (filter) params.content_type = filter
    if (langFilter) params.language_id = langFilter
    if (search) params.search = search
    api.get('/contributions', { params }).then((r) => setItems(r.data))
  }

  useEffect(() => {
    api.get('/languages').then((r) => setLanguages(r.data))
    api.get('/contributions/stats').then((r) => setStats(r.data))
  }, [])
  useEffect(load, [filter, langFilter])

  return (
    <>
      <Nav />
      <div className="page">
        <div className="heritage-hero">
          <div className="heritage-hero-bg">𓂀</div>
          <h2>The Heritage Library</h2>
          <p>A living museum of African oral tradition — proverbs, folktales, songs, and stories contributed by communities across the continent.</p>
          <div className="heritage-hero-stats">
            <div><span>{stats.heritage_stories || items.length}</span><small>Stories archived</small></div>
            <div><span>{stats.total_languages}</span><small>Languages represented</small></div>
            <div><span>{stats.total_contributors}</span><small>Contributors</small></div>
          </div>
        </div>

        <div className="heritage-filters">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`filter-btn ${filter === f.id ? 'active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="row" style={{ marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <input
            className="form-input"
            style={{ maxWidth: 280 }}
            placeholder="Search titles & stories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
          />
          <select className="form-input" style={{ maxWidth: 200 }} value={langFilter} onChange={(e) => setLangFilter(e.target.value)}>
            <option value="">All languages</option>
            {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <button type="button" className="btn-ghost" onClick={load}>Search</button>
        </div>

        <div className="heritage-grid rich">
          {items.map((c, i) => {
            const type = c.content_type || c.part_of_speech || 'word'
            const isStory = ['proverb', 'folktale', 'song', 'story', 'riddle'].includes(type)
            return (
              <motion.div
                key={c.id}
                className="heritage-item"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="heritage-item-type">
                  <span className="type-dot" style={{ background: TYPE_COLORS[type] || '#1D9E75' }} />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
                <h3>{c.word}</h3>
                <p className="heritage-item-excerpt">{c.meaning}</p>
                {c.example && isStory && <p className="heritage-meta-line">{c.example}</p>}
                {c.example && !isStory && <p className="her-example">"{c.example}"</p>}
                <div className="heritage-item-foot">
                  <span className="heritage-lang-tag">{c.language.name}</span>
                  <ConfidenceBadge
                    score={c.confidence_score ?? 42}
                    status={c.verification_status || 'pending'}
                    compact
                  />
                  <span className="heritage-meta">by {c.user_name} · ▲ {c.upvotes}</span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {items.length === 0 && <p className="muted">No items yet. Be the first to contribute!</p>}

        <Link to="/teach" className="heritage-upload">
          <div style={{ fontSize: 28 }}>📜</div>
          <p><strong>Contribute to the library</strong> — Upload a proverb, story, or song from your culture</p>
        </Link>
      </div>
    </>
  )
}
