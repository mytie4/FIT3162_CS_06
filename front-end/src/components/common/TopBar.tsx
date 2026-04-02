import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './TopBar.css'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clubs': 'Club Management',
  '/events': 'Events',
  '/tasks': 'Tasks',
  '/timeline': 'Timeline',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    pathname.startsWith(path),
  )?.[1] ?? 'Dashboard'

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <button className="topbar-sign-out" onClick={handleSignOut}>
        Sign Out
      </button>
    </header>
  )
}
