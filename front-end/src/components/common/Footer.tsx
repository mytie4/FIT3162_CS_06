import { Link } from 'react-router-dom'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <nav className="footer-nav">
        <Link to="/">Home</Link>
        <Link to="/">Pages</Link>
        <Link to="/">Members</Link>
        <Link to="/">Links</Link>
        <Link to="/login">Log in</Link>
      </nav>
      <p className="footer-copy">&copy; Copyright Eventure oem: all right.</p>
    </footer>
  )
}
