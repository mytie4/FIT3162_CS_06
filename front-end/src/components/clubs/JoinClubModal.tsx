import { useState } from 'react'
import './JoinClubModal.css'

interface JoinClubModalProps {
  onClose: () => void
}

export default function JoinClubModal({ onClose }: JoinClubModalProps) {
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

    const handleJoin = async () => {
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/clubs/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ joinCode })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }
      onClose()
      alert("Successfully joined club")
    } catch (err: unknown) {
  if (err instanceof Error) {
    setError(err.message)
  } else {
    setError("Something went wrong")
  }
}
  }

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
        />

        <button className="join-card-btn" onClick={handleJoin}>
          Join Club
        </button>
      </div>
    </div>
  )
}
