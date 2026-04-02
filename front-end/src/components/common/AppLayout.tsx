import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import './AppLayout.css'

export default function AppLayout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-layout-main">
        <TopBar />
        <div className="app-layout-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
