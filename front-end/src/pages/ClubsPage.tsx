import { useState } from 'react'
import ClubCard from '../components/clubs/ClubCard'
import CreateClubModal from '../components/clubs/CreateClubModal'
import JoinClubModal from '../components/clubs/JoinClubModal'
import './ClubsPage.css'

interface MockClub {
  id: number
  bannerColor: string
  name: string
  categoryBadge: string
  ongoingEvent: string
  memberCount: number
}

const mockClubs: MockClub[] = [
  {
    id: 1,
    bannerColor: '#a8d5ba',
    name: 'Club 1',
    categoryBadge: 'Social',
    ongoingEvent: '2 ongoing events',
    memberCount: 50,
  },
  {
    id: 2,
    bannerColor: '#f7c59f',
    name: 'MEGA',
    categoryBadge: 'Hobby',
    ongoingEvent: '1 ongoing event',
    memberCount: 120,
  },
  {
    id: 3,
    bannerColor: '#ffb6b6',
    name: 'Monash Thai Club',
    categoryBadge: 'Cultural',
    ongoingEvent: '3 ongoing events',
    memberCount: 85,
  },
  {
    id: 4,
    bannerColor: '#b6d4f7',
    name: 'Coding Society',
    categoryBadge: 'Technology',
    ongoingEvent: '1 ongoing event',
    memberCount: 200,
  },
  {
    id: 5,
    bannerColor: '#d4b6f7',
    name: 'Debate Union',
    categoryBadge: 'Academic',
    ongoingEvent: '0 ongoing events',
    memberCount: 42,
  },
  {
    id: 6,
    bannerColor: '#c8e6c9',
    name: 'Football Club',
    categoryBadge: 'Sports',
    ongoingEvent: '2 ongoing events',
    memberCount: 95,
  },
]

export default function ClubsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false)

  const filtered = mockClubs.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="clubs-page">
      <h1 className="clubs-page-title">Club Management</h1>

      <div className="clubs-toolbar">
        <div className="clubs-search">
          <svg className="clubs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search clubs..."
            aria-label="Search clubs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="clubs-toolbar-actions">
          <button className="clubs-btn-outline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>

          <button className="clubs-btn-outline">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="14" y2="12" />
              <line x1="4" y1="18" x2="9" y2="18" />
            </svg>
            Sort by
          </button>

          <button
            className="clubs-btn-outline"
            onClick={() => setIsJoinModalOpen(true)}
          >
            Join club
          </button>


          <button
            className="clubs-btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create club
          </button>
        </div>
      </div>

      <div className="clubs-grid">
        {filtered.map((club) => (
          <ClubCard
            key={club.id}
            bannerColor={club.bannerColor}
            name={club.name}
            categoryBadge={club.categoryBadge}
            ongoingEvent={club.ongoingEvent}
            memberCount={club.memberCount}
          />
        ))}
      </div>

      {isCreateModalOpen && (
        <CreateClubModal onClose={() => setIsCreateModalOpen(false)} />
      )}

      {isJoinModalOpen && (
        <JoinClubModal onClose={() => setIsJoinModalOpen(false)} 
        />
      )}
    </div>
  )
}
