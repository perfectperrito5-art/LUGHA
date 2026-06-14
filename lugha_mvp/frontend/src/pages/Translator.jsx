import { useEffect, useState } from 'react'
import Nav from '../components/Nav.jsx'
import api from '../api'

const LANGS = ['English','Swahili','Yoruba','Zulu','Amharic','Hausa','Igbo','Wolof','Twi','Lingala','Shona','Xhosa','Sukuma']

const EXAMPLES = [
  { text: 'Habari za asubuhi?', src: 'Swahili', tgt: 'English' },
  { text: 'Ubuntu ungumuntu ngabantu', src: 'Zulu', tgt: 'English' },
  { text: 'The rain does not fall on one roof alone', src: 'English', tgt: 'Swahili' },
  { text: 'Good morning', src: 'English', tgt: 'Yoruba' },
]

export default function Translator() {
  const [src, setSrc] = useState('English')
  const [tgt, setTgt] = useState('Swahili')
  const [text, setText] = useState('Good morning')
  const [out, setOut] = useState('')
  const [provider, setProvider] = useState('')
  const [loading, setLoading] = useState(false)

  const translate = async () => {
    if (!text.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post('/translate', { text, source_lang: src, target_lang: tgt })
      setOut(data.translated)
      setProvider(data.provider)
    } catch { setOut('Translation failed.') }
    finally { setLoading(false) }
  }

  const swap = () => { setSrc(tgt); setTgt(src); setText(out); setOut(text) }

  useEffect(() => { translate() /* eslint-disable-next-line */ }, [])

  return (
    <>
      <Nav />
      <div className="page">
        <div className="page-head">
          <h1>AI Translator</h1>
          <p>Powered by community contributions + your choice of OpenAI / Gemini / mock.</p>
        </div>

        <div className="trans-card">
          <div className="trans-row">
            <select className="form-input" value={src} onChange={e=>setSrc(e.target.value)}>
              {LANGS.map(l => <option key={l}>{l}</option>)}
            </select>
            <button className="trans-swap" onClick={swap} title="Swap">⇄</button>
            <select className="form-input" value={tgt} onChange={e=>setTgt(e.target.value)}>
              {LANGS.map(l => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div className="trans-row" style={{gridTemplateColumns:'1fr 1fr', gap:16}}>
            <div className="trans-area">
              <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Type something…" />
            </div>
            <div>
              <div className="trans-output">{out || (loading ? 'Translating…' : '—')}</div>
              {provider && <div className="trans-meta"><span>Provider: <b>{provider}</b></span><span>{src} → {tgt}</span></div>}
            </div>
          </div>

          <button className="btn-primary" onClick={translate} disabled={loading} style={{marginTop:'1rem'}}>
            {loading ? 'Translating…' : 'Translate'}
          </button>

          <div className="trans-examples">
            {EXAMPLES.map((ex, i) => (
              <button key={i} className="trans-ex-btn"
                onClick={() => { setText(ex.text); setSrc(ex.src); setTgt(ex.tgt); setTimeout(translate, 50) }}>
                {ex.text} ({ex.src} → {ex.tgt})
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
