import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

const TABS = [
  { to: '/app',         label: 'Home' },
  { to: '/teach',       label: 'Teach AI' },
  { to: '/translate',   label: 'Translate' },
  { to: '/heritage',    label: 'Heritage' },
  { to: '/play',        label: 'Play ✦' },
  { to: '/map',         label: 'Map' },
  { to: '/leaderboard', label: 'Leaders' },
  { to: '/live',         label: 'Live 🔴' },
]

export default function Nav() {
  const { user, logout } = useAuth()
  const loc = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="app-nav">
      <Link to="/app" className="nav-logo">Lugha<span>.</span></Link>
      <div className="nav-tabs">
        {TABS.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={`nav-tab ${loc.pathname === t.to ? 'active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="nav-user">
        <span>{user?.name}</span>
        <div className="avatar">{user?.avatar_initial}</div>
        <button className="btn-logout" onClick={() => { logout(); navigate('/') }}>Sign out</button>
      </div>
    </nav>
  )
}
