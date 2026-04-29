import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ClubCard from '../components/clubs/ClubCard';
import CreateClubModal from '../components/clubs/CreateClubModal';
import JoinClubModal from '../components/clubs/JoinClubModal';
import type { Club } from '../types/clubs.types';
import './ClubsPage.css';

import { getAllClubs } from '../api/clubs.api';
import { useAuth } from '../context/AuthContext';

// set deafult banner if not set by user
// these colours the colours used in banner of the figma design
const DEFAULT_COLORS = [
  '#F36D8A', // Red
  '#25A9EF', // Light blue
  '#3942F4', // Navy
  '#9B7CF3', // Purple
  '#F4BF39', // Yellow
  '#FD59C0', // Pink
  '#39F4D5', // Cyan
  '#8CF57E', // Green
];

function getBannerColor(clubId: string): string {
  let hash = 0;

  for (let i = 0; i < clubId.length; i++) {
    hash = (hash * 31 + clubId.charCodeAt(i)) >>> 0;
  }

  return DEFAULT_COLORS[hash % DEFAULT_COLORS.length];
}

export default function ClubsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { token } = useAuth();

  useEffect(() => {
    let isMounted = true;

    async function loadClubs() {
      if (!token) {
        if (isMounted) {
          setClubs([]);
          setError('Please log in to view your clubs');
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const fetchedClubs = await getAllClubs(token);

        if (isMounted) {
          setClubs(fetchedClubs);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Failed to fetch clubs',
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadClubs();

    return () => {
      isMounted = false;
    };
  }, [token]);
  const filtered = clubs.filter((club) =>
    club.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

return (
    <div className="clubs-page">
      <h1 className="clubs-page-title">Club Management</h1>

      <div className="clubs-toolbar">
        <div className="clubs-search">
          <svg
            className="clubs-search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter
          </button>

          <button className="clubs-btn-outline">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create club
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="clubs-status-message">Loading clubs...</div>
      )}

      {error && (
        <div className="clubs-status-message clubs-status-message--error">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filtered.length === 0 ? (
            <div className="clubs-status-message">No clubs found</div>
          ) : (
            <div className="clubs-grid">
              {filtered.map((club) => (
                <div
                  key={club.club_id}
                  onClick={() => navigate(`/clubs/${club.club_id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <ClubCard
                    bannerColor={
                      club.club_color ?? getBannerColor(club.club_id)
                    }
                    name={club.name}
                    type={club.type ?? "Club"}
                    ongoingEvent={
                      club.ongoing_event_count === 0
                        ? "No ongoing event"
                        : `${club.ongoing_event_count} ongoing event${club.ongoing_event_count === 1 ? "" : "s"}`
                    }
                    memberCount={club.member_count}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {isCreateModalOpen && (
        <CreateClubModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={(club) => setClubs((prev) => [...prev, club])}
        />
      )}

      {isJoinModalOpen && (
        <JoinClubModal onClose={() => setIsJoinModalOpen(false)} />
      )}
    </div>
  );
}
