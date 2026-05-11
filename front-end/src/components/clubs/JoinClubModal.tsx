import { useState } from 'react'
import './JoinClubModal.css'
import { useAuth } from '../../context/AuthContext'
import { joinClubByCode } from '../../api/clubs.api'

interface JoinClubModalProps {
  onClose: () => void
  onJoined?: () => void
}

export default function JoinClubModal({ onClose, onJoined }: JoinClubModalProps) {
  const { token } = useAuth()
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  const handleJoin = async () => {
    setError(null)

    if (!token) {
      setError('You must be logged in to join a club.')
      return
    }

    const code = joinCode.trim()
    if (!/^\d{6}$/.test(code)) {
      setError('Join code must be exactly 6 digits.')
      return
    }

    setLoading(true)

    try {
      await joinClubByCode(code, token)

      setSuccess('Successfully joined club!')
      setError(null)
      setTimeout(() => {
        onJoined?.()
        onClose()
      }, 1200)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Something went wrong')
      }
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || success !== null

  return (
    <div className="join-overlay" onClick={handleOverlayClick}>
      <div className="join-card">
        <h2 className="join-card-title">Join a club with a code</h2>

        <input
          className="join-card-input"
          type="text"
          placeholder="Enter join code"
          aria-label="Join code"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          disabled={isDisabled}
        />
        {error && <p className="join-error">{error}</p>}
        {success && <p className="join-success">{success}</p>}
        <button className="join-card-btn" onClick={handleJoin} disabled={isDisabled}>
          {loading ? 'Joining...' : 'Join Club'}
        </button>
      </div>
    </div>
  )
}
