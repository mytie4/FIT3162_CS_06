import { useNavigate } from 'react-router-dom'
import BrandLogo from '../components/common/BrandLogo'
import { useAuth } from '../context/AuthContext'
import './DashboardPage.css'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const handleSignOut = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <BrandLogo className="dashboard-brand-logo" />
          <span className="dashboard-brand-text">Eventure</span>
        </div>
        <button className="btn-sign-out" onClick={handleSignOut}>
          Sign Out
        </button>
      </header>

      <main className="dashboard-content">
        <h1>Dashboard</h1>
        <p>Welcome! This page is under construction.</p>
      </main>
    </div>
  )
}
