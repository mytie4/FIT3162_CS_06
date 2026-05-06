import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationDropdown from './NotificationDropdown'
import './TopBar.css'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clubs': 'Club Management',
  '/events': 'Events',
  '/tasks': 'Tasks',
  '/timeline': 'Timeline',
  '/notifications': 'Notifications',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    markRead,
    markAllRead,
    dismiss,
  } = useNotifications()

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

      <div className="topbar-actions">
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          error={error}
          isOpen={isDropdownOpen}
          onToggle={() => setIsDropdownOpen((prev) => !prev)}
          onClose={() => setIsDropdownOpen(false)}
          onMarkRead={markRead}
          onMarkAllRead={markAllRead}
          onDismiss={dismiss}
          onRefresh={refresh}
        />

        <button className="topbar-sign-out" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </header>
  )
}
