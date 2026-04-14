import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardList,
  ChevronDown,
} from 'lucide-react'
import logoSrc from '../../assets/Logo.svg'
import './Sidebar.css'

type NavItem = {
  label: string
  path: string
  icon: React.ReactNode
  hasSubmenu: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, hasSubmenu: false },
  { label: 'Clubs',     path: '/clubs',     icon: <Users size={20} />,           hasSubmenu: false },
  { label: 'Events',    path: '/events',    icon: <CalendarDays size={20} />,     hasSubmenu: false },
  { label: 'Tasks',     path: '/tasks',     icon: <ClipboardList size={20} />,    hasSubmenu: false },
]

export default function Sidebar() {
  const location = useLocation()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  const toggleSubmenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <aside className="sidebar">
      {/* Brand header */}
      <div className="sidebar-brand">
        <img src={logoSrc} alt="Eventure" className="sidebar-brand-logo" />
        <span className="sidebar-brand-name">Eventure</span>
      </div>
      <hr className="sidebar-divider" />

      {/* Navigation */}
      <ul className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path)

          return (
            <li key={item.label}>
              <NavLink
                to={item.path}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                onClick={(e) => {
                  if (item.hasSubmenu) {
                    e.preventDefault()
                    toggleSubmenu(item.label)
                  }
                }}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{item.label}</span>
                {item.hasSubmenu && (
                  <span
                    className={`sidebar-chevron ${openMenus[item.label] ? 'open' : ''}`}
                  >
                    <ChevronDown size={16} />
                  </span>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
