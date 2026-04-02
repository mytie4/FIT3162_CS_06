import { useState } from 'react'
import './JoinClubModal.css'

interface JoinClubModalProps {
  onClose: () => void
}

export default function JoinClubModal({ onClose }: JoinClubModalProps) {
  const [joinCode, setJoinCode] = useState('')

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleJoin = () => {
    onClose()
  }

  return (
    <div className="join-overlay" onClick={handleOverlayClick}>
      <div className="join-card">
        <h2 className="join-card-title">Join a club with a code</h2>

        <input
          className="join-card-input"
          type="text"
          placeholder="Enter join code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
        />

        <button className="join-card-btn" onClick={handleJoin}>
          Join Club
        </button>
      </div>
    </div>
  )
}
