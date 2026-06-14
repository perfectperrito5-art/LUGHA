import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '../components/Nav.jsx'
import api from '../api'

function actionLabel(type, word) {
  const map = {
    proverb: 'shared a proverb',
    folktale: 'archived a folktale',
    song: 'preserved a song',
    story: 'shared a story',
    riddle: 'added riddles',
    word: 'taught AI a word',
  }
  const verb = map[type] || 'contributed'
  return `${verb}: ${word}`
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'just now'
  }
}

export default function LiveFeed() {
  const [items, setItems] = useState([])
  const [stats, setStats] = useState({ words_today: 0, active_contributors: 0 })
  const seen = useRef(new Set())

  const toDisplay = (p) => ({
    id: p.id,
    name: p.user_name || 'Guardian',
    initials: p.avatar_initial || (p.user_name || 'G')[0],
    lang: p.language || 'Language',
    action: actionLabel(p.content_type || 'word', p.word),
    country: p.country ? `${p.flag_emoji || ''} ${p.country}`.trim() : '',
    time: formatTime(p.created_at),
  })

  const pushItem = (p) => {
    if (p.id && seen.current.has(p.id)) return
    if (p.id) seen.current.add(p.id)
    const item = toDisplay(p)
    setItems((prev) => [item, ...prev.filter((x) => x.id !== item.id)].slice(0, 40))
  }

  const loadRecent = () => {
    api.get('/live-feed/recent').then((r) => {
      const mapped = r.data.map(toDisplay)
      setItems(mapped)
      mapped.forEach((m) => seen.current.add(m.id))
    })
    api.get('/live-feed/stats').then((r) => setStats(r.data))
  }

  useEffect(() => {
    loadRecent()
    const poll = setInterval(loadRecent, 12000)

    let es
    try {
      es = new EventSource('/api/live-feed/stream')
      es.onmessage = (e) => {
        if (!e.data || e.data.startsWith(':')) return
        try {
          const msg = JSON.parse(e.data)
          if (msg.event_type === 'contribution.created' && msg.payload) {
            pushItem(msg.payload)
            setStats((s) => ({ ...s, words_today: (s.words_today || 0) + 1 }))
          }
        } catch { /* heartbeat */ }
      }
      es.onerror = () => es?.close()
    } catch { /* SSE unsupported */ }

    return () => {
      clearInterval(poll)
      es?.close()
    }
  }, [])

  return (
    <>
      <Nav />
      <div className="page">
        <div className="page-head center-text">
          <span className="live-pill">🔴 LIVE</span>
          <h1>Global Language Preservation</h1>
          <p>Real-time contributions from language guardians across Africa</p>
        </div>

        <div className="feed-stats">
          <div className="stat-box">
            <div className="stat-num">{stats.words_today}</div>
            <div className="stat-label">Words contributed today</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{stats.active_contributors}</div>
            <div className="stat-label">Active contributors (24h)</div>
          </div>
        </div>

        <div className="feed-container">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.div
                key={item.id}
                className="feed-item"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
              >
                <div className="feed-avatar">{item.initials}</div>
                <div className="feed-content">
                  <div className="feed-name">{item.name} {item.country && <span className="feed-country">{item.country}</span>}</div>
                  <div className="feed-action">{item.action} <span className="feed-lang">{item.lang}</span></div>
                  <div className="feed-time">{item.time}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {items.length === 0 && <p className="muted feed-empty">Waiting for the first contribution…</p>}
        </div>
      </div>
    </>
  )
}
