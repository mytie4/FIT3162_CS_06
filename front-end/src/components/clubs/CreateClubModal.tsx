import { useState } from 'react'
import './CreateClubModal.css'
import { useAuth } from '../../context/AuthContext'
import { createClub } from '../../api/clubs.api'
import type { Club } from '../../types/clubs.types'

interface CreateClubModalProps {
  onClose: () => void
  onCreated: (club: Club) => void  // NEW
}

const clubTypes = ['Club', 'Social', 'Hobby', 'Cultural', 'Academic', 'Sports', 'Technology']

export default function CreateClubModal({ onClose, onCreated }: CreateClubModalProps) {
  const { token } = useAuth()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState<string>(clubTypes[0])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose()
  }

  const handleCreate = async () => {
    if (!token) {
      setError('You must be logged in to create a club.')
      return
    }

    const trimmed = name.trim()
    if (trimmed.length < 2) {
      setError('Club name must be at least 2 characters.')
      return
    }
    if (trimmed.length > 80) {
      setError('Club name must be 80 characters or fewer.')
      return
    }

    if (!type) {
      setError('Please choose a club type.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const club = await createClub(
        {
          name: trimmed,
          description: description || undefined,
          type,
        },
        token,
      )
      onCreated(club)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-overlay" onClick={handleOverlayClick}>
      <div className="create-card">
        <div className="create-field">
          <label className="create-label" htmlFor="club-name">Name</label>
          <input
            id="club-name"
            className="create-input"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="create-field">
          <label className="create-label" htmlFor="club-type">Type</label>
          <div className="create-type-select">
            <span className="create-type-badge">{type}</span>
            <select
              id="club-type"
              className="create-type-native"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={isSubmitting}
              required
            >
              {clubTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <svg className="create-type-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>

        <div className="create-field">
          <label className="create-label" htmlFor="club-description">Description</label>
          <textarea
            id="club-description"
            className="create-textarea"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting} />
        </div>

        {error && (
          <p style={{ color: 'red', fontSize: '0.85rem', margin: '0 0 8px' }}>
            {error}
          </p>
        )}

        <button
          className="create-submit-btn"
          onClick={handleCreate}
          disabled={isSubmitting || name.trim().length < 2}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </div>
  )
}