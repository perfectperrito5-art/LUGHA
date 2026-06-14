import { useEffect, useState, useRef } from 'react'
import Nav from '../components/Nav.jsx'
import api from '../api'
import { useAuth } from '../auth.jsx'
import { blobToDataUrl, getRecorderMimeType, MAX_AUDIO_BYTES } from '../utils/audio.js'

export default function Teach() {
  const { user, setUser } = useAuth()
  const [languages, setLanguages] = useState([])
  const [me, setMe] = useState(null)
  const [form, setForm] = useState({
    language_id: '', word: '', meaning: '', example: '', part_of_speech: 'noun', content_type: 'word', region: '',
  })
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioStatus, setAudioStatus] = useState(null)
  const mediaRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])
  const audioBlobRef = useRef(null)

  useEffect(() => {
    api.get('/languages').then((r) => {
      setLanguages(r.data)
      setForm((f) => ({ ...f, language_id: r.data[0]?.id || '' }))
    })
    api.get('/contributions/me/stats').then((r) => setMe(r.data)).catch(() => {})
  }, [])

  const langName = languages.find((l) => String(l.id) === String(form.language_id))?.name || 'Language'

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  const clearAudio = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    audioBlobRef.current = null
    setAudioUrl(null)
    setAudioStatus(null)
  }

  const toggleRecord = async () => {
    if (recording) {
      mediaRef.current?.stop()
      setRecording(false)
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = getRecorderMimeType()
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data?.size) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        const type = rec.mimeType || mime || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type })
        stopStream()
        if (!blob.size) {
          setAudioStatus({ type: 'err', text: 'No audio captured — try again' })
          return
        }
        audioBlobRef.current = blob
        setAudioUrl(URL.createObjectURL(blob))
        const kb = Math.round(blob.size / 1024)
        setAudioStatus({ type: 'ok', text: `Saved · ${kb} KB` })
      }
      rec.start(250)
      mediaRef.current = rec
      setRecording(true)
      setAudioStatus({ type: 'rec', text: 'Listening… tap to stop' })
      setTimeout(() => {
        if (mediaRef.current?.state === 'recording') toggleRecord()
      }, 12000)
    } catch {
      setAudioStatus({ type: 'err', text: 'Allow microphone access to record' })
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    let audioData = null
    const blob = audioBlobRef.current
    if (blob) {
      if (blob.size > MAX_AUDIO_BYTES) {
        setAudioStatus({ type: 'err', text: 'Recording too long — keep it under ~15 seconds' })
        setLoading(false)
        return
      }
      try {
        audioData = await blobToDataUrl(blob)
      } catch {
        setAudioStatus({ type: 'err', text: 'Could not process audio — try re-recording' })
        setLoading(false)
        return
      }
    }
    try {
      const payload = {
        ...form,
        language_id: Number(form.language_id),
        content_type: form.part_of_speech === 'proverb' ? 'proverb' : form.content_type,
        audio_url: audioData,
      }
      const { data } = await api.post('/contributions', payload)
      setToast({ word: data.word, lang: data.language.name })
      setForm((f) => ({ ...f, word: '', meaning: '', example: '', region: '' }))
      clearAudio()
      setUser({ ...user, points: (user.points || 0) + 10 })
      api.get('/contributions/me/stats').then((r) => setMe(r.data))
      setTimeout(() => setToast(null), 4500)
    } catch (err) {
      const detail = err?.response?.data?.detail
      setAudioStatus({
        type: 'err',
        text: typeof detail === 'string' ? detail : 'Could not save — check connection',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Nav />
      <div className="page teach-page">
        <div className="page-head teach-head">
          <h1>Teach AI</h1>
          <p className="muted">One word at a time — your voice matters.</p>
        </div>

        <form className="teach-steps" onSubmit={submit}>
          <div className="teach-card">
            <label className="form-label" htmlFor="teach-lang">Language</label>
            <select id="teach-lang" className="form-input" value={form.language_id} onChange={(e) => setForm({ ...form, language_id: e.target.value })} required>
              {languages.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>

          <div className="teach-card">
            <label className="form-label" htmlFor="teach-word">Word or phrase</label>
            <div className="form-grid-2 teach-word-row">
              <input id="teach-word" className="form-input" value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} placeholder="Ng'wana" required />
              <select className="form-input" value={form.part_of_speech} onChange={(e) => setForm({ ...form, part_of_speech: e.target.value })} aria-label="Type">
                {['noun', 'verb', 'phrase', 'proverb'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <input className="form-input teach-field-gap" value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} placeholder="Meaning" required />
            <input className="form-input teach-field-gap" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} placeholder="Example (optional)" />
            <input className="form-input teach-field-gap" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} placeholder="Region (optional)" />
          </div>

          <div className="teach-card teach-audio-card">
            <label className="form-label">Pronunciation</label>
            <div className="teach-audio-actions">
              <button type="button" className={`record-btn ${recording ? 'recording' : ''} ${audioUrl ? 'saved' : ''}`} onClick={toggleRecord}>
                <span className={`record-dot ${recording ? 'pulse' : ''}`} />
                {recording ? 'Stop' : audioUrl ? 'Re-record' : 'Tap to record'}
              </button>
              {audioUrl && (
                <button type="button" className="record-clear" onClick={clearAudio}>Remove</button>
              )}
            </div>
            {audioStatus && (
              <p className={`audio-status audio-status--${audioStatus.type}`}>{audioStatus.text}</p>
            )}
            {audioUrl && <audio src={audioUrl} controls className="audio-preview" playsInline />}
          </div>

          {(form.word || form.meaning) && (
            <div className="submit-preview">
              <div className="preview-word">{form.word || '…'}</div>
              <div className="preview-lang">{langName}</div>
              {form.meaning && <div className="preview-meaning">{form.meaning}</div>}
            </div>
          )}

          <button type="submit" className="btn-register ready teach-submit" disabled={loading}>
            {loading ? 'Saving…' : 'Contribute →'}
          </button>
        </form>

        {toast && (
          <div className="toast">
            <div className="icon">✨</div>
            <div><strong>{toast.word}</strong> saved · +10 pts</div>
          </div>
        )}

        {me && (
          <div className="teach-impact-compact">
            <span>{me.words_contributed ?? 0} words</span>
            <span>{me.points ?? 0} pts</span>
            <span>{me.streak_days ?? 0}🔥 streak</span>
          </div>
        )}
      </div>
    </>
  )
}
