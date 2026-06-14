import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Teach from './pages/Teach.jsx'
import Translator from './pages/Translator.jsx'
import Heritage from './pages/Heritage.jsx'
import HeatMap from './pages/HeatMap.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import LiveFeed from './pages/LiveFeed.jsx'
import Partners from './pages/Partners.jsx'
import Playground from './pages/Playground.jsx'
import Developers from './pages/Developers.jsx'

function Private({ children }) {
  const { user, ready } = useAuth()
  if (!ready) return <div className="loading">Loading…</div>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/app" element={<Private><Dashboard /></Private>} />
      <Route path="/teach" element={<Private><Teach /></Private>} />
      <Route path="/translate" element={<Private><Translator /></Private>} />
      <Route path="/heritage" element={<Private><Heritage /></Private>} />
      <Route path="/map" element={<Private><HeatMap /></Private>} />
      <Route path="/leaderboard" element={<Private><Leaderboard /></Private>} />
      <Route path="/live" element={<Private><LiveFeed /></Private>} />
      <Route path="/play" element={<Private><Playground /></Private>} />
      <Route path="/developers" element={<Private><Developers /></Private>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
