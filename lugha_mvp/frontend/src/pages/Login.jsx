import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import AfricaSilhouette from '../components/AfricaSilhouette.jsx'
import { apiErrorMessage } from '../utils/apiError.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/app')
    } catch (ex) {
      setErr(apiErrorMessage(ex, 'Login failed'))
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setEmail('demo@lugha.africa')
    setPassword('demo1234')
  }

  return (
    <div className="auth-screen auth-screen--register">
      <div className="auth-register-bg" aria-hidden>
        <div className="auth-register-aurora" />
        <AfricaSilhouette variant="landing" className="africa-silhouette--register" />
      </div>

      <div className="auth-nav auth-nav--register">
        <Link to="/" className="landing-logo">Lugha<span>.</span></Link>
        <Link to="/register" className="auth-nav-link auth-nav-link--compact">Join</Link>
      </div>

      <form className="auth-card auth-card--register auth-card--login" onSubmit={submit}>
        <h1 className="auth-title">Welcome back</h1>

        <div className="form-row">
          <label className="form-label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            className="form-input"
            type="email"
            inputMode="email"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@gmail.com"
            required
            autoComplete="email"
          />
        </div>
        <div className="form-row">
          <label className="form-label" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            className="form-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {err && <div className="err register-err">{err}</div>}

        <button
          type="submit"
          className={`btn-register ready ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          <span className="btn-register-shine" aria-hidden />
          <span className="btn-register-text">
            {loading ? (
              <>
                <span className="btn-register-spinner" aria-hidden />
                Signing in…
              </>
            ) : (
              'Sign in →'
            )}
          </span>
        </button>

        <button type="button" className="auth-demo-link" onClick={fillDemo}>
          Try demo account
        </button>
      </form>
    </div>
  )
}
