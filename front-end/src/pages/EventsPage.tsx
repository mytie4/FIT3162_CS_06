import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Plus } from "lucide-react";
import EventCard from "../components/events/EventCard";
import { fetchAllEvents } from "../api/events.api";
import type { Event } from "../types/events.types";
import { useAuth } from "../context/AuthContext";
import "./EventsPage.css";

const TABS = ["All Events", "Upcoming", "Drafts", "Past"] as const;
type Tab = (typeof TABS)[number];

const DEFAULT_COLORS = [
  "#F36D8A", // Red
  "#25A9EF", // Light blue
  "#3942F4", // Navy
  "#9B7CF3", // Purple
  "#F4BF39", // Yellow
  "#FD59C0", // Pink
  "#39F4D5", // Cyan
  "#8CF57E", // Green
];

function hashString(value: string): number {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function getEventColor(event: Event): string {
  return DEFAULT_COLORS[hashString(event.event_id) % DEFAULT_COLORS.length];
}

function formatEventDate(date: string | null): string {
  if (!date) return "No date set";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "Invalid date";

  return parsed.toLocaleDateString();
}

export default function EventsPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("All Events");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        setIsLoading(true);
        setError(null);

        if (!token) {
          setEvents([]);
          setError("Please log in to view your events");
          setIsLoading(false);
          return;
        }

        const data = await fetchAllEvents(token);

        if (isMounted) {
          setEvents(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load events",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeTab) {
      case "Upcoming":
        return (
          event.status === "published" ||
          event.status === "in_progress" ||
          event.status === "ongoing"
        );
      case "Drafts":
        return event.status === "draft";
      case "Past":
        return event.status === "completed" || event.status === "cancelled";
      default:
        return true;
    }
  });

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
            className={`events-tab ${activeTab === tab ? "events-tab--active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {isLoading && <div className="events-empty">Loading events...</div>}

      {error && <div className="events-empty">{error}</div>}

      {!isLoading && !error && (
        <>
          {filtered.length > 0 ? (
            <div className="events-grid">
              {filtered.map((event) => (
                <EventCard
                  key={event.event_id}
                  title={event.title}
                  clubName={event.club_name ?? "Club"}
                  date={formatEventDate(event.date)}
                  location={event.location ?? "No location set"}
                  status={event.status}
                  attendees={event.attendee_count ?? 0}
                  color={getEventColor(event)}
                  showClubBadge
                  onClick={() => navigate(`/events/${event.event_id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="events-empty">No events found.</div>
          )}
        </>
      )}
    </div>
  );
}
