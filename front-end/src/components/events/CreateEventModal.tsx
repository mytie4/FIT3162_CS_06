import { useState, useEffect } from 'react'
import { X, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { createEvent } from '../../api/events.api'
import { getAllClubs } from '../../api/clubs.api'
import type { Event, CreateEvent } from '../../types/events.types'
import type { Club } from '../../types/clubs.types'


const EVENT_TYPES = ['Social', 'Workshop', 'Seminar', 'Sports', 'Cultural', 'Networking', 'Fundraiser', 'Other']
const VISIBILITY_OPTIONS = [
  { value: 'published', label: 'Public' },
  { value: 'draft',     label: 'Members Only' },
]

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (event: Event) => void;  // callback to refresh list
  predefinedClubId?: string;             // locks club selector when opened from ClubDetailsPage
}


export default function CreateEventModal({ isOpen, onClose, onCreated, predefinedClubId }: Props) {
  const { token } = useAuth()

  // Form state
  const [title, setTitle]           = useState('')
  const [clubId, setClubId]         = useState(predefinedClubId ?? '')
  const [type, setType]             = useState(EVENT_TYPES[0])
  const [visibility, setVisibility] = useState<'published' | 'draft'>('published')
  const [startDate, setStartDate]   = useState('')
  const [endDate, setEndDate]       = useState('')
  const [location, setLocation]     = useState('')
  const [bannerUrl, setBannerUrl]   = useState('')
  const [description, setDescription] = useState('')

  // UI state
  const [manageableClubs, setManageableClubs] = useState<Club[]>([])
  const [isLoadingClubs, setIsLoadingClubs]   = useState(false)
  const [isSubmitting, setIsSubmitting]       = useState(false)
  const [error, setError]                     = useState<string | null>(null)

  // Sync predefinedClubId changes
  useEffect(() => {
    setClubId(predefinedClubId ?? '')
  }, [predefinedClubId])
 
  // Load user's manageable clubs when opened without a predefined club
  useEffect(() => {
    if (!isOpen || predefinedClubId || !token) return
 
    let isMounted = true
    setIsLoadingClubs(true)
 
    getAllClubs(token)
      .then((clubs) => {
        if (isMounted) {
          // getAllClubs already returns only the user's clubs (via getAllClubsForUser on backend)
          // We show all of them — the backend's requireClubRole middleware will enforce
          // president/vice_president at submission time
          setManageableClubs(clubs)
          if (clubs.length > 0 && !clubId) {
            setClubId(clubs[0].club_id)
          }
        }
      })
      .catch(() => {
        if (isMounted) setManageableClubs([])
      })
      .finally(() => {
        if (isMounted) setIsLoadingClubs(false)
      })
 
    return () => { isMounted = false }
  }, [isOpen, predefinedClubId, token])
 
  // Reset form when modal opens
  useEffect(() => {
    if (!isOpen) return
    setTitle('')
    setClubId(predefinedClubId ?? '')
    setType(EVENT_TYPES[0])
    setVisibility('published')
    setStartDate('')
    setEndDate('')
    setLocation('')
    setBannerUrl('')
    setDescription('')
    setError(null)
  }, [isOpen, predefinedClubId])
 
  if (!isOpen) return null
 
  const selectedClub = manageableClubs.find((c) => c.club_id === clubId)

  // ── Form submission ────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError(null)
 
    if (!title.trim()) {
      setError('Event title is required.')
      return
    }
 
    if (!clubId) {
      setError('Please select a hosting club.')
      return
    }
 
    if (!token) {
      setError('You must be logged in to create an event.')
      return
    }
 
    const dto: CreateEvent = {
      club_id:     clubId,
      title:       title.trim(),
      type:        type || undefined,
      date:        startDate || undefined,
      end_date:    endDate   || undefined,
      location:    location.trim()  || undefined,
      banner_url:  bannerUrl.trim() || undefined,
      description: description.trim() || undefined,
      status:      visibility,
    }
 
    setIsSubmitting(true)
 
    try {
      const newEvent = await createEvent(dto, token)
      onCreated?.(newEvent)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }
 
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isSubmitting) onClose()
  }
 
  const isBusy = isSubmitting
    // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="cem-overlay" onClick={handleOverlayClick}>
      <div className="cem-card" role="dialog" aria-modal="true" aria-labelledby="cem-title">
 
        {/* Header */}
        <div className="cem-header">
          <h2 className="cem-title" id="cem-title">Create New Event</h2>
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
            <label className="cem-label" htmlFor="cem-title-input">
              Event Title <span className="cem-required">*</span>
            </label>
            <input
              id="cem-title-input"
              className="cem-input"
              type="text"
              placeholder="e.g. Annual Trivia Night"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isBusy}
              autoFocus
            />
          </div>
 
          {/* Hosting Club */}
          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-club-select">
              Hosting Club <span className="cem-required">*</span>
            </label>
 
            {predefinedClubId ? (
              /* Locked — opened from ClubDetailsPage */
              <div className="cem-club-locked">
                <span
                  className="cem-club-dot"
                  style={{ backgroundColor: selectedClub?.club_color ?? manageableClubs.find(c => c.club_id === predefinedClubId)?.club_color ?? '#1a6b6e' }}
                />
                <span className="cem-club-locked-name">
                  {manageableClubs.find(c => c.club_id === predefinedClubId)?.name ?? 'This Club'}
                </span>
                <span className="cem-club-locked-hint">Pre-selected</span>
              </div>
            ) : (
              /* Dropdown — opened from EventsPage */
              <select
                id="cem-club-select"
                className="cem-select"
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                disabled={isBusy || isLoadingClubs}
              >
                {isLoadingClubs ? (
                  <option>Loading clubs...</option>
                ) : manageableClubs.length === 0 ? (
                  <option value="">No clubs available</option>
                ) : (
                  <>
                    <option value="" disabled>Select a club</option>
                    {manageableClubs.map((c) => (
                      <option key={c.club_id} value={c.club_id}>
                        {c.name}
                      </option>
                    ))}
                  </>
                )}
              </select>
            )}
          </div>
 
          {/* Event Type + Visibility row */}
          <div className="cem-date-row">
            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-type-select">Event Type</label>
              <select
                id="cem-type-select"
                className="cem-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={isBusy}
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
 
            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-visibility-select">Visibility</label>
              <select
                id="cem-visibility-select"
                className="cem-select"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as 'published' | 'draft')}
                disabled={isBusy}
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
              <label className="cem-label" htmlFor="cem-start-date">
                Start Date & Time <span className="cem-label-hint">(optional)</span>
              </label>
              <input
                id="cem-start-date"
                className="cem-input"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isBusy}
              />
            </div>
 
            <div className="cem-field">
              <label className="cem-label" htmlFor="cem-end-date">
                End Date & Time <span className="cem-label-hint">(optional)</span>
              </label>
              <input
                id="cem-end-date"
                className="cem-input"
                type="datetime-local"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isBusy}
              />
            </div>
          </div>
 
          {/* Location */}
          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-location">
              Location <span className="cem-label-hint">(optional)</span>
            </label>
            <input
              id="cem-location"
              className="cem-input"
              type="text"
              placeholder="e.g. Campus Hall B, Room 204"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isBusy}
            />
          </div>
 
          {/* Event Banner URL */}
          <div className="cem-field">
            <label className="cem-label" htmlFor="cem-banner">
              Event Banner URL <span className="cem-label-hint">(optional)</span>
            </label>
            <input
              id="cem-banner"
              className="cem-input"
              type="url"
              placeholder="https://..."
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              disabled={isBusy}
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
            <label className="cem-label" htmlFor="cem-description">
              Description <span className="cem-label-hint">(optional)</span>
            </label>
            <textarea
              id="cem-description"
              className="cem-textarea"
              placeholder="Describe the event for your club members..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isBusy}
              rows={4}
            />
          </div>
 
          {/* Error */}
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
            disabled={isBusy}
          >
            {isSubmitting ? (
              <><span className="cem-ai-spinner" /> Creating...</>
            ) : (
              'Create Event'
            )}
          </button>
        </div>
 
      </div>
    </div>
  )
}