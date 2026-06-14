import { useCallback, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Nav from '../components/Nav.jsx'
import api from '../api'
import { apiErrorMessage } from '../utils/apiError.js'

const GAME_ROUTES = {
  word_roots: '/v1/games/word-roots/round',
  proverb_circle: '/v1/games/proverb-circle/round',
  guardian_ear: '/v1/games/guardian-ear/round',
}

const GAMES = [
  { id: 'word_roots', title: 'Word Roots', tagline: 'Recognise a word from the mother tongue', icon: '🌱' },
  { id: 'proverb_circle', title: 'Proverb Circle', tagline: 'Complete the wisdom of elders', icon: '🪘' },
  { id: 'guardian_ear', title: "Guardian's Ear", tagline: 'Confirm what your community still speaks', icon: '👂' },
]

function feedbackType(data) {
  if (data.correct === true) return 'win'
  if (data.correct === false) return 'gentle'
  return 'info'
}

function trimOption(text, max = 100) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max).trim()}…` : text
}

export default function Playground() {
  const [session, setSession] = useState(null)
  const [sessionErr, setSessionErr] = useState('')
  const [active, setActive] = useState(null)
  const [round, setRound] = useState(null)
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [roundsPlayed, setRoundsPlayed] = useState(0)

  const loadSession = useCallback(() => {
    setSessionErr('')
    return api.get('/v1/games/session')
      .then((r) => setSession(r.data))
      .catch((ex) => {
        setSessionErr(apiErrorMessage(ex, 'Could not load playground'))
      })
  }, [])

  useEffect(() => { loadSession() }, [loadSession])

  const startGame = async (gameId) => {
    setActive(gameId)
    setRound(null)
    setFeedback(null)
    setLoading(true)
    try {
      const { data } = await api.get(GAME_ROUTES[gameId])
      setRound(data)
    } catch (ex) {
      setFeedback({
        type: 'info',
        message: apiErrorMessage(ex, 'Not enough content yet — try teaching a word first!'),
      })
      setActive(null)
    } finally {
      setLoading(false)
    }
  }

  const answer = async (selectedId, verdict) => {
    if (!round) return
    setLoading(true)
    try {
      const body = { round_id: round.round_id }
      if (verdict) body.verdict = verdict
      else body.selected_id = selectedId
      const { data } = await api.post('/v1/games/answer', body)
      setFeedback({ type: feedbackType(data), ...data })
      setRoundsPlayed((n) => n + 1)
      setRound(null)
      loadSession()
    } catch (ex) {
      setFeedback({
        type: 'info',
        message: apiErrorMessage(ex, 'Could not save — try again'),
      })
    } finally {
      setLoading(false)
    }
  }

  const nextRound = () => {
    setFeedback(null)
    if (active) startGame(active)
  }

  const leave = () => {
    setActive(null)
    setRound(null)
    setFeedback(null)
  }

  const gameInfo = GAMES.find((g) => g.id === active)
  const games = session?.available?.length ? session.available : GAMES

  return (
    <>
      <Nav />
      <div className="page playground-page">
        <div className="playground-hero">
          <p className="playground-eyebrow">Cultural playground</p>
          <h1>Play with purpose</h1>
          <p className="muted playground-intro">
            Explore words and wisdom — gently, at your pace.
            <em> Leave anytime. No pressure.</em>
          </p>
          {session && (
            <div className="playground-session-pills">
              <span>{session.games_played_today + roundsPlayed} rounds today</span>
              <span>{session.session_points} pts</span>
            </div>
          )}
          {sessionErr && (
            <p className="playground-session-err">
              {sessionErr}
              <button type="button" onClick={loadSession}>Retry</button>
            </p>
          )}
        </div>

        {!active && !feedback && (
          <div className="playground-grid">
            {games.map((g, i) => (
              <motion.button
                key={g.id}
                type="button"
                className="playground-card"
                onClick={() => startGame(g.id)}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="playground-card-icon">{g.icon}</span>
                <h3>{g.title}</h3>
                <p>{g.tagline}</p>
                <span className="playground-card-cta">Play a round →</span>
              </motion.button>
            ))}
          </div>
        )}

        {active && (
          <div className="playground-stage">
            <div className="playground-stage-head">
              <button type="button" className="playground-back" onClick={leave}>← Back</button>
              <span>{gameInfo?.icon} {gameInfo?.title}</span>
            </div>

            <AnimatePresence mode="wait">
              {loading && !round && !feedback && (
                <motion.p key="load" className="playground-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  Gathering words from the continent…
                </motion.p>
              )}

              {round && !feedback && (
                <motion.div
                  key={`round-${round.round_id}`}
                  className="playground-round"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="playground-lang">
                    {round.language_flag && <span>{round.language_flag}</span>}
                    {round.language}
                  </div>
                  <h2 className="playground-prompt">{round.prompt}</h2>
                  {round.sub_prompt && (
                    <p className="playground-sub">{trimOption(round.sub_prompt, 200)}</p>
                  )}
                  {round.meta?.example && (
                    <p className="playground-example">"{trimOption(round.meta.example, 120)}"</p>
                  )}
                  {round.meta?.region && (
                    <p className="playground-region">{round.meta.region}</p>
                  )}

                  <div className={`playground-options ${round.game_type === 'guardian_ear' ? 'guardian' : ''}`}>
                    {(round.options || []).map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`playground-opt ${opt.id === 'skip' ? 'skip' : ''}`}
                        disabled={loading}
                        onClick={() => (
                          round.game_type === 'guardian_ear'
                            ? answer(null, opt.id)
                            : answer(opt.id)
                        )}
                      >
                        {trimOption(opt.text, round.game_type === 'guardian_ear' ? 80 : 100)}
                      </button>
                    ))}
                  </div>
                  {round.meta?.hint && <p className="playground-hint">{round.meta.hint}</p>}
                </motion.div>
              )}

              {feedback && (
                <motion.div
                  key="fb"
                  className={`playground-feedback playground-feedback--${feedback.type}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="playground-feedback-msg">{feedback.message}</p>
                  {feedback.reveal && (
                    <p className="playground-reveal">{trimOption(feedback.reveal, 160)}</p>
                  )}
                  {feedback.confidence_score != null && (
                    <p className="playground-conf">Confidence now {feedback.confidence_score}%</p>
                  )}
                  {feedback.points_awarded > 0 && (
                    <p className="playground-pts">+{feedback.points_awarded} pts</p>
                  )}
                  <div className="playground-feedback-actions">
                    {active && (
                      <button type="button" className="btn-primary" onClick={nextRound}>Another round</button>
                    )}
                    <button type="button" className="btn-ghost" onClick={leave}>
                      {active ? 'Done for now' : 'Back to games'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!active && feedback && (
          <div className={`playground-feedback playground-feedback--${feedback.type}`}>
            <p className="playground-feedback-msg">{feedback.message}</p>
            <button type="button" className="btn-ghost" onClick={() => setFeedback(null)} style={{ marginTop: 12 }}>
              Back to games
            </button>
          </div>
        )}
      </div>
    </>
  )
}
