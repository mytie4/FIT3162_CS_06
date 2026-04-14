import { useState } from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import EventCard from '../components/events/EventCard'
import './EventsPage.css'

// ── Mock data (will be replaced with API calls in EVE-54) ──

const MOCK_EVENTS = [
  {
    id: '1', title: 'Annual Tech Summit 2025', club: 'Monash Tech Club', date: 'Nov 12-14, 2025',
    location: 'Caulfield Campus, Building H', status: 'in_progress', attendees: 124, color: '#3b82f6',
  },
  {
    id: '2', title: 'End of Year Gala', club: 'Business Society', date: 'Dec 5, 2025',
    location: 'Crown Palladium', status: 'planning', attendees: 350, color: '#8b5cf6',
  },
  {
    id: '3', title: 'Code to Create Hackathon', club: 'Monash Tech Club', date: 'Oct 20, 2025',
    location: 'Clayton Woodside Building', status: 'published', attendees: 85, color: '#14b8a6',
  },
  {
    id: '4', title: 'Weekly Chess Meetup', club: 'Monash Chess Club', date: 'Every Thursday',
    location: 'Campus Center, Level 2', status: 'ongoing', attendees: 24, color: '#f97316',
  },
]

const TABS = ['All Events', 'Upcoming', 'Drafts', 'Past'] as const
type Tab = (typeof TABS)[number]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('All Events')

  // Client-side filtering
  const filtered = MOCK_EVENTS.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase())
    if (!matchesSearch) return false

    switch (activeTab) {
      case 'Upcoming':
        return event.status === 'published' || event.status === 'planning'
      case 'Drafts':
        return event.status === 'draft'
      case 'Past':
        return event.status === 'completed'
      default:
        return true
    }
  })

  return (
    <div className="events-page">
      <div className="events-page-header">
        <div>
          <h1 className="events-page-title">Events</h1>
          <p className="events-page-subtitle">
            Manage and discover all activities across your clubs.
          </p>
        </div>
        <div className="events-page-actions">
          <div className="events-search-wrapper">
            <Search className="events-search-icon" size={18} />
            <input
              type="text"
              placeholder="Search events..."
              className="events-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="events-filter-btn">
            <Filter size={18} />
          </button>
          <button className="events-create-btn">
            <Plus size={18} /> Create Event
          </button>
        </div>
      </div>

      <div className="events-tabs">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`events-tab ${activeTab === tab ? 'events-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="events-grid">
          {filtered.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              clubName={event.club}
              date={event.date}
              location={event.location}
              status={event.status}
              attendees={event.attendees}
              color={event.color}
              showClubBadge
            />
          ))}
        </div>
      ) : (
        <div className="events-empty">No events found.</div>
      )}
    </div>
  )
}
