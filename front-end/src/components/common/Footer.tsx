import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <nav className="footer-nav">
        <Link to="/dashboard">Home</Link>
        <Link to="/clubs">Pages</Link>
        <Link to="/clubs">Members</Link>
        <Link to="/events">Links</Link>
        <Link to="/login">Log in</Link>
      </nav>
      <p className="footer-copy">
        &copy; {new Date().getFullYear()} Eventure. All rights reserved.
      </p>
    </footer>
  )
}
