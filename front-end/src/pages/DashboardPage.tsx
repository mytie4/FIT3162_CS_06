import { useNavigate } from 'react-router-dom'
import './DashboardPage.css'

export default function DashboardPage() {
  const navigate = useNavigate()

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <span className="dashboard-brand">Eventure</span>
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
