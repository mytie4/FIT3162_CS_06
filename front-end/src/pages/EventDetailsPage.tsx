import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchEventById } from '../api/events.api';
import { fetchMyRole } from '../api/clubs.api';
import EditEventModal from '../components/events/EditEventModal';
import SafetyTab from '../components/events/SafetyTab';
import type { Event } from '../types/events.types';
import type { ClubRole } from '../types/clubs.types';
import './EventDetailsPage.css';

const TABS = ['Board', 'List', 'Safety', 'Attendees', 'Transport', 'Budget', 'Contracts', 'Files'] as const;
type Tab = (typeof TABS)[number];

export default function EventDetailsPage() {
  const params = useParams<{ eventId: string; clubId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('Board');
  const [event, setEvent] = useState<Event | null>(null);
  const [role, setRole] = useState<ClubRole | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    if (!params.eventId || !params.clubId) return;

    let cancelled = false;
    setLoadError(null);

    fetchEventById(params.clubId, params.eventId, token ?? undefined)
      .then((found) => {
        if (cancelled) return;
        setEvent(found);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(err instanceof Error ? err.message : 'Failed to load event.');
      });

    return () => {
      cancelled = true;
    };
  }, [params.eventId, params.clubId, token]);

  // Resolve the viewer's role in the event's hosting club so we can gate Edit.
  useEffect(() => {
    if (!event || !token) {
      setRole(null);
      return;
    }
    let cancelled = false;
    fetchMyRole(event.club_id, token)
      .then((r) => { if (!cancelled) setRole(r); })
      .catch(() => { if (!cancelled) setRole(null); });
    return () => { cancelled = true; };
  }, [event, token]);

  const canEdit = role === 'president' || role === 'vice_president';

  return (
    <div className="edp-root">
      <header className="edp-header">
        <button type="button" className="edp-back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="edp-header-row">
          <div>
            <h1 className="edp-title">{event?.title ?? 'Event'}</h1>
            <p className="edp-subtitle">
              {event?.club_name ?? `eventId: ${params.eventId ?? 'unknown'}`}
            </p>
          </div>
          {event && canEdit && (
            <div className="edp-header-actions">
              <button
                type="button"
                className="edp-edit-btn"
                onClick={() => setIsEditOpen(true)}
              >
                <Pencil size={14} /> Edit
              </button>
            </div>
          )}
        </div>
        {loadError && <div className="edp-error">{loadError}</div>}
      </header>

      <nav className="edp-tabs" role="tablist" aria-label="Event sections">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`edp-tab ${activeTab === tab ? 'edp-tab--active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="edp-content">
        {activeTab === 'Safety' && event ? (
          <SafetyTab eventId={event.event_id} canEdit={canEdit} />
        ) : (
          <div className="edp-placeholder">
            <h2 className="edp-placeholder-title">{activeTab}</h2>
            <p className="edp-placeholder-text">Coming soon.</p>
          </div>
        )}
      </main>

      {event && (
        <EditEventModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          event={event}
          onUpdated={(updated) => setEvent(updated)}
          clubName={event.club_name}
          clubColor={event.club_color}
        />
      )}
    </div>
  );
}
