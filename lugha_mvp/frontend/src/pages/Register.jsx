import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../auth.jsx'
import AfricaSilhouette from '../components/AfricaSilhouette.jsx'
import SearchCombobox from '../components/SearchCombobox.jsx'
import LanguagePicker from '../components/LanguagePicker.jsx'
import EmailField from '../components/EmailField.jsx'
import PasswordField from '../components/PasswordField.jsx'
import { validateEmail } from '../utils/validateEmail.js'
import { apiErrorMessage } from '../utils/apiError.js'

const USERNAME_RE = /^[a-zA-Z0-9_]{3,40}$/

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [countryId, setCountryId] = useState(null)
  const [countries, setCountries] = useState([])
  const [speaks, setSpeaks] = useState(new Set())
  const [learning, setLearning] = useState(new Set())
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const [usernameBlur, setUsernameBlur] = useState(false)

  useEffect(() => {
    api.get('/languages/countries').then((r) => setCountries(r.data)).catch(() => {})
  }, [])

  const selectedCountry = useMemo(
    () => countries.find((c) => c.id === countryId) || null,
    [countries, countryId],
  )

  const usernameOk = USERNAME_RE.test(username)
  const emailCheck = validateEmail(email)

  const steps = useMemo(() => ({
    name: name.trim().length >= 2,
    username: usernameOk,
    country: Boolean(countryId),
    email: emailCheck.ok,
    password: password.length >= 8,
  }), [name, usernameOk, countryId, emailCheck.ok, password])

  const readyCount = Object.values(steps).filter(Boolean).length
  const allReady = readyCount === Object.keys(steps).length

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!allReady) {
      setErr('Fill in the highlighted essentials above.')
      return
    }
    setLoading(true)
    try {
      await register({
        name: name.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim(),
        password,
        country_id: countryId,
        speaks: [...speaks],
        learning: [...learning],
      })
      navigate('/app', { state: { welcome: true, username: username.trim().toLowerCase() } })
    } catch (ex) {
      setErr(apiErrorMessage(ex, 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-screen auth-screen--register">
      <div className="auth-register-bg" aria-hidden>
        <div className="auth-register-aurora" />
        <AfricaSilhouette variant="landing" className="africa-silhouette--register" />
      </div>

      <div className="auth-nav auth-nav--register">
        <Link to="/" className="landing-logo">Lugha<span>.</span></Link>
        <Link to="/login" className="auth-nav-link auth-nav-link--compact">Sign in</Link>
      </div>

      <form className="auth-card auth-card--register" onSubmit={submit} noValidate>
        <div className="register-progress" aria-label={`${readyCount} of 5 complete`}>
          {Object.values(steps).map((done, i) => (
            <span key={i} className={`register-progress-dot ${done ? 'done' : ''}`} />
          ))}
        </div>

        <h1 className="auth-title">Join Lugha</h1>

        <div className="form-row">
          <label className="form-label" htmlFor="reg-name">Full name</label>
          <input
            id="reg-name"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Amara Mwangi"
            required
            autoComplete="name"
          />
        </div>

        <div className="form-row">
          <label className="form-label" htmlFor="reg-username">Username</label>
          <input
            id="reg-username"
            className={`form-input ${usernameBlur && username && !usernameOk ? 'input-invalid' : ''} ${usernameOk ? 'input-valid' : ''}`}
            value={username}
            onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
            onBlur={() => setUsernameBlur(true)}
            placeholder="amara_speaks"
            minLength={3}
            maxLength={40}
            required
            autoComplete="username"
          />
          {usernameBlur && username && !usernameOk && (
            <p className="field-feedback err">Letters, numbers, _ only · 3–40 chars</p>
          )}
        </div>

        <div className="form-row">
          <SearchCombobox
            label="Country"
            items={countries}
            value={countryId}
            onChange={setCountryId}
            placeholder="Search country…"
            required
            maxVisible={6}
            emptyQueryMessage="Type to filter 54 nations"
            noResultsMessage="No match — try another spelling"
            filterItem={(c, q) =>
              c.name.toLowerCase().includes(q) || (c.region || '').toLowerCase().includes(q)
            }
            leadingIcon={selectedCountry ? (
              <span className="search-combo-flag">{selectedCountry.flag_emoji}</span>
            ) : null}
            getKey={(c) => c.id}
            getLabel={(c) => c.name}
            renderOption={(c) => (
              <span className="combo-option-row">
                <span className="combo-option-flag">{c.flag_emoji}</span>
                <span className="combo-option-text">
                  <span className="combo-option-name">{c.name}</span>
                  <span className="combo-option-meta">{c.region}</span>
                </span>
              </span>
            )}
          />
        </div>

        <EmailField value={email} onChange={setEmail} required />
        <PasswordField value={password} onChange={setPassword} required />

        <details className="auth-optional">
          <summary>Languages (optional)</summary>
          <div className="auth-optional-body">
            <LanguagePicker
              label="You speak"
              selectedIds={speaks}
              onChange={setSpeaks}
              placeholder="Add language…"
            />
            <LanguagePicker
              label="Learning"
              selectedIds={learning}
              onChange={setLearning}
              placeholder="Add language…"
            />
          </div>
        </details>

        {err && <div className="err register-err">{err}</div>}

        <div className="register-submit-zone">
          <button
            type="submit"
            className={`btn-register ${allReady ? 'ready' : 'pending'} ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            <span className="btn-register-shine" aria-hidden />
            <span className="btn-register-text">
              {loading ? (
                <>
                  <span className="btn-register-spinner" aria-hidden />
                  Creating…
                </>
              ) : (
                'Create account →'
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
