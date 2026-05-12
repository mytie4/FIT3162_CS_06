import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateEvent } from '../../api/events.api'
import type { Event, UpdateEvent } from '../../types/events.types'
import './CreateEventModal.css'

const EVENT_TYPES = ['Social', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Networking', 'Fundraiser', 'Other']
const VISIBILITY_OPTIONS = [
  { value: 'published', label: 'Public' },
  { value: 'draft',     label: 'Members Only' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  event: Event
  onUpdated?: (event: Event) => void
  clubName?: string
  clubColor?: string | null
}

// datetime-local inputs need `YYYY-MM-DDTHH:mm`, not a full ISO string
function toLocalInputValue(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditEventModal({
  isOpen,
  onClose,
  event,
  onUpdated,
  clubName,
  clubColor,
}: Props) {
  const { token } = useAuth()

  const [title, setTitle]             = useState(event.title)
  const [type, setType]               = useState(event.type ?? EVENT_TYPES[0])
  const [visibility, setVisibility]   = useState<'published' | 'draft'>(
    event.status === 'draft' ? 'draft' : 'published',
  )
  const [startDate, setStartDate]     = useState(toLocalInputValue(event.date))
  const [endDate, setEndDate]         = useState(toLocalInputValue(event.end_date))
  const [location, setLocation]       = useState(event.location ?? '')
  const [bannerUrl, setBannerUrl]     = useState(event.banner_url ?? '')
  const [description, setDescription] = useState(event.description ?? '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError]               = useState<string | null>(null)

  // Reset whenever the modal opens or the underlying event changes
  useEffect(() => {
    if (!isOpen) return
    setTitle(event.title)
    setType(event.type ?? EVENT_TYPES[0])
    setVisibility(event.status === 'draft' ? 'draft' : 'published')
    setStartDate(toLocalInputValue(event.date))
    setEndDate(toLocalInputValue(event.end_date))
    setLocation(event.location ?? '')
    setBannerUrl(event.banner_url ?? '')
    setDescription(event.description ?? '')
    setError(null)
  }, [isOpen, event])

  if (!isOpen) return null

  const handleSubmit = async () => {
    setError(null)

    if (!title.trim()) {
      setError('Event title is required.')
      return
    }

    if (!token) {
      setError('You must be logged in to edit this event.')
      return
    }

    const dto: UpdateEvent = {
      title:       title.trim(),
      type:        type || null,
      date:        startDate || null,
      end_date:    endDate   || null,
      location:    location.trim()  || null,
      banner_url:  bannerUrl.trim() || null,
      description: description.trim() || null,
      status:      visibility,
    }

    setIsSubmitting(true)
    try {
      const updated = await updateEvent(event.club_id, event.event_id, dto, token)
      onUpdated?.(updated)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose()
  }

  return (
    <div className="cem-overlay" onClick={handleOverlayClick}>
      <div className="cem-card" role="dialog" aria-modal="true" aria-labelledby="cem-edit-title">

        {/* Header */}
        <div className="cem-header">
          <h2 className="cem-title" id="cem-edit-title">Edit Event</h2>
          <button
            className="cem-close-btn"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="cem-body">

          {/* Event Title */}
          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-edit-title-input">
              Event Title <span className="cem-required">*</span>
            </label>
            <input
              id="cem-edit-title-input"
              className="cem-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {/* Hosting Club (locked — can't move an event between clubs) */}
          <div className="cem-field">
            <label className="cem-label">Hosting Club</label>
            <div className="cem-club-locked">
              <span
                className="cem-club-dot"
                style={{ backgroundColor: clubColor ?? '#1a6b6e' }}
              />
              <span className="cem-club-locked-name">
                {clubName ?? event.club_name ?? 'This Club'}
              </span>
              <span className="cem-club-locked-hint">Cannot change</span>
            </div>
          </div>

          {/* Event Type + Visibility row */}
          <div className="cem-date-row">
            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-edit-type-select">Event Type</label>
              <select
                id="cem-edit-type-select"
                className="cem-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isSubmitting}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-edit-visibility-select">Visibility</label>
              <select
                id="cem-edit-visibility-select"
                className="cem-select"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'published' | 'draft')}
                disabled={isSubmitting}
              >
                {VISIBILITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Time row */}
          <div className="cem-date-row">
            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-edit-start-date">
                Start Date & Time <span className="cem-label-hint">(optional)</span>
              </label>
              <input
                id="cem-edit-start-date"
                className="cem-input"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-edit-end-date">
                End Date & Time <span className="cem-label-hint">(optional)</span>
              </label>
              <input
                id="cem-edit-end-date"
                className="cem-input"
                type="datetime-local"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Location */}
          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-edit-location">
              Location <span className="cem-label-hint">(optional)</span>
            </label>
            <input
              id="cem-edit-location"
              className="cem-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Event Banner URL */}
          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-edit-banner">
              Event Banner URL <span className="cem-label-hint">(optional)</span>
            </label>
            <input
              id="cem-edit-banner"
              className="cem-input"
              type="url"
              placeholder="https://..."
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              disabled={isSubmitting}
            />
            {bannerUrl && (
              <div className="cem-banner-preview">
                <img
                  className="cem-banner-img"
                  src={bannerUrl}
                  alt="Banner preview"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-edit-description">
              Description <span className="cem-label-hint">(optional)</span>
            </label>
            <textarea
              id="cem-edit-description"
              className="cem-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
              rows={4}
            />
          </div>

          {error && <div className="cem-error">{error}</div>}

        </div>

        {/* Footer */}
        <div className="cem-footer">
          <button
            className="cem-cancel-btn"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className="cem-submit-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <><span className="cem-ai-spinner" /> Saving...</>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
