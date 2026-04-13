import { useState } from 'react'
import './CreateClubModal.css'
import { useAuth } from '../../context/AuthContext'
import { createClub } from '../../api/clubs.api'
import type { Club } from '../../types/clubs.types'

interface CreateClubModalProps {
  onClose: () => void
  onCreated: (club: Club) => void  // NEW
}

const clubTypes = ['Social', 'Hobby', 'Cultural', 'Academic', 'Sports', 'Technology']

export default function CreateClubModal({ onClose, onCreated }: CreateClubModalProps) {
  const { token } = useAuth()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState<string>('')
  const [members, setMembers] = useState<{ id: number; name: string; color: string }[]>([])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose()
  }

  const removeMember = (id: number) => {
    setMembers((prev) => prev.filter((m) => m.id !== id))
  }

  const handleCreate = async () => {
    if (!token) {
      setError('You must be logged in to create a club.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const club = await createClub(
        {
          name,
          description: description || undefined,
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
          <label className="create-label">Add members</label>
          <div className="create-members-input">
            {members.map((m) => (
              <span key={m.id} className="create-member-chip">
                <span
                  className="create-member-avatar"
                  style={{ backgroundColor: m.color }}
                />
                {m.name}
                <button
                  className="create-member-remove"
                  onClick={() => removeMember(m.id)}
                  aria-label={`Remove member ${m.name}`}
                  disabled={isSubmitting}
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="create-field">
          <label className="create-label">Set banner</label>
          <div className="create-banner-upload">
            <button className="create-banner-btn" type="button" disabled={isSubmitting}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
            </button>
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create'}
        </button>
      </div>
    </div>
  )
}