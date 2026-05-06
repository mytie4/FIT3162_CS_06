import { Calendar, MapPin, Users, MoreHorizontal } from 'lucide-react'
import './EventCard.css'

interface EventCardProps {
  title: string
  clubName?: string
  date: string
  location: string
  status: string
  attendees: number
  color: string
  showClubBadge?: boolean
  onClick?: () => void
}

const STATUS_CLASS: Record<string, string> = {
  published: 'event-card-status--published',
  planning: 'event-card-status--planning',
  draft: 'event-card-status--draft',
  in_progress: 'event-card-status--in_progress',
  ongoing: 'event-card-status--ongoing',
  completed: 'event-card-status--completed',
  cancelled: 'event-card-status--cancelled',
}

const STATUS_LABEL: Record<string, string> = {
  published: 'Published',
  planning: 'Planning',
  draft: 'Draft',
  in_progress: 'In Progress',
  ongoing: 'Ongoing',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function EventCard({
  title,
  clubName,
  date,
  location,
  status,
  attendees,
  color,
  showClubBadge = false,
  onClick,
}: EventCardProps) {
  const statusKey = status.toLowerCase().replace(/\s+/g, '_')

  return (
    <div
      className="event-card"
      role="button"
      tabIndex={0}
      aria-label={`Open event ${title}`}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      <div className="event-card-header" style={{ backgroundColor: color }}>
        <div className="event-card-header-actions">
          {showClubBadge && clubName && (
            <span className="event-card-club-badge">{clubName}</span>
          )}
          <button
            className="event-card-menu-btn"
            aria-label="Event options"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      <div className="event-card-body">
        <h3 className="event-card-title">{title}</h3>

        <div className="event-card-info">
          <div className="event-card-info-item">
            <Calendar size={16} />
            {date}
          </div>
          <div className="event-card-info-item">
            <MapPin size={16} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {location}
            </span>
          </div>
        </div>

        <div className="event-card-footer">
          <span className={`event-card-status ${STATUS_CLASS[statusKey] ?? 'event-card-status--draft'}`}>
            {STATUS_LABEL[statusKey] ?? status}
          </span>
          <span className="event-card-attendees">
            <Users size={14} />
            {attendees}
          </span>
        </div>
      </div>
    </div>
  )
}
