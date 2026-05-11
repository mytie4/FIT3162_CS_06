import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  LogOut,
  Plus,
  Search,
  Calendar,
  Globe,
  MessageSquare,
  Trash2,
  UserPlus,
  Image as ImageIcon,
  Link as LinkIcon,
} from 'lucide-react';
import EventCard from '../components/events/EventCard';
import MembersTable from '../components/clubs/MembersTable';
import LeaveClubModal from '../components/clubs/LeaveClubModal';
import DeleteClubModal from '../components/clubs/DeleteClubModal';
import InviteMembersModal from '../components/clubs/InviteMembersModal';
import {
  fetchClubById,
  fetchClubMembers,
  fetchMyRole,
  deleteClub,
  leaveClub,
  updateMemberRole as apiUpdateMemberRole,
  removeMember as apiRemoveMember,
  sendClubInvitations,
} from '../api/clubs.api';
import { useAuth } from '../context/AuthContext';
import { fetchClubEvents } from '../api/events.api';
import type { Event } from '../types/events.types';
import type { Club, ClubMember, ClubRole } from '../types/clubs.types';

import './ClubDetailsPage.css';

const DEFAULT_COLORS = [
  '#F36D8A',
  '#25A9EF',
  '#3942F4',
  '#9B7CF3',
  '#F4BF39',
  '#FD59C0',
  '#39F4D5',
  '#8CF57E',
];

function hashString(value: string): number {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }

  return hash;
}

function getEventColor(event: Event): string {
  return DEFAULT_COLORS[hashString(event.club_id) % DEFAULT_COLORS.length];
}

function isSafeHttpUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

// ── Tabs ──

const TABS = ['Overview', 'Events', 'Members', 'Settings'] as const;
type Tab = (typeof TABS)[number];

// ── Component ──

export default function ClubDetailsPage() {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // API state
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<ClubRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [membersLoaded, setMembersLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset lazy-loaded data whenever the viewed club changes so navigating
  // between clubs never shows stale members or events from the previous club,
  // and a previously failed fetch can be retried.
  useEffect(() => {
    setMembers([]);
    setMembersLoaded(false);
    setMembersError(null);
    setEvents([]);
    setEventsLoaded(false);
    setEventsError(null);
  }, [clubId]);

  const loadMembers = useCallback(async () => {
    if (!clubId || membersLoading || membersLoaded) return;

    try {
      setMembersLoading(true);
      setMembersError(null);
      const membersData = await fetchClubMembers(clubId);
      setMembers(membersData);
      setMembersLoaded(true);
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setMembersLoading(false);
    }
  }, [clubId, membersLoaded, membersLoading]);

  const loadEvents = useCallback(async () => {
    if (!clubId || eventsLoading || eventsLoaded) return;

    try {
      setEventsLoading(true);
      setEventsError(null);
      const eventsData = await fetchClubEvents(clubId);
      setEvents(eventsData);
      setEventsLoaded(true);
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : 'Failed to load events');
    } finally {
      setEventsLoading(false);
    }
  }, [clubId, eventsLoaded, eventsLoading]);

  useEffect(() => {
    if (!clubId) return;

    let isMounted = true;

    async function loadClubData() {
      try {
        setIsLoading(true);
        setError(null);

        const clubData = await fetchClubById(clubId!);

        if (isMounted) {
          setClub(clubData);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load club');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadClubData();

    return () => {
      isMounted = false;
    };
  }, [clubId]);

  useEffect(() => {
    if (!clubId || !token) {
      setCurrentUserRole(null);
      return;
    }

    const resolvedClubId: string = clubId;
    const resolvedToken: string = token;

    let isMounted = true;

    async function loadRole() {
      try {
        const role = await fetchMyRole(resolvedClubId, resolvedToken);
        if (isMounted) {
          setCurrentUserRole(role);
        }
      } catch {
        if (isMounted) {
          setCurrentUserRole(null);
        }
      }
    }

    loadRole();

    return () => {
      isMounted = false;
    };
  }, [clubId, token]);

  useEffect(() => {
    if (activeTab === 'Members') {
      void loadMembers();
    }
  }, [activeTab, loadMembers]);

  useEffect(() => {
    if (activeTab === 'Events') {
      void loadEvents();
    }
  }, [activeTab, loadEvents]);

  const canManageEvents =
    currentUserRole === 'president' || currentUserRole === 'vice_president';
  const isPresident = currentUserRole === 'president';

  const handleRoleChange = async (userId: string, newRole: ClubRole) => {
    if (!clubId || !token) return;

    setMemberActionError(null);

    // Snapshot for rollback if the API call fails.
    const previous = members;

    // Optimistic update — also handle the "transfer presidency" case where
    // the previous president must be demoted client-side to keep the table
    // consistent with the server's transactional behaviour.
    setMembers((prev) =>
      prev.map((m) => {
        if (m.user_id === userId) return { ...m, role: newRole };
        if (newRole === 'president' && m.role === 'president') {
          return { ...m, role: 'vice_president' };
        }
        return m;
      }),
    );

    try {
      await apiUpdateMemberRole(clubId, userId, newRole, token);

      // If the requester transferred presidency away from themselves,
      // refresh their own role so the UI re-evaluates which controls
      // are visible.
      if (currentUserRole === 'president' && newRole === 'president') {
        try {
          const role = await fetchMyRole(clubId, token);
          setCurrentUserRole(role);
        } catch {
          // best-effort
        }
      }
    } catch (err) {
      console.error('Failed to update member role:', err);
      setMembers(previous);
      setMemberActionError(
        err instanceof Error ? err.message : 'Failed to update role',
      );
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!clubId || !token) return;

    setMemberActionError(null);

    const previous = members;
    setMembers((prev) => prev.filter((m) => m.user_id !== userId));

    try {
      await apiRemoveMember(clubId, userId, token);
    } catch (err) {
      console.error('Failed to remove member:', err);
      setMembers(previous);
      setMemberActionError(
        err instanceof Error ? err.message : 'Failed to remove member',
      );
    }
  };

  const handleSendInvitations = async (userIds: string[]) => {
    if (!clubId || !token || userIds.length === 0) return;

    const result = await sendClubInvitations(clubId, userIds, token);

    // Surface a concise summary for the user. Promote the modal's own
    // error path by throwing if literally nothing got sent — that way the
    // modal's catch block keeps it open and shows the message.
    if (result.invited.length === 0 && result.skipped.length > 0) {
      const reasons = new Set(result.skipped.map((s) => s.reason));
      const reasonText = [...reasons]
        .map((r) =>
          r === 'already_member'
            ? 'already a member'
            : r === 'already_pending'
              ? 'already invited'
              : r === 'self'
                ? 'yourself'
                : 'not found',
        )
        .join(', ');
      throw new Error(`No invites sent — selected users were ${reasonText}.`);
    }
  };

  const handleDeleteClub = async () => {
    try {
      await deleteClub(clubId!, token!);
      navigate('/clubs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete club');
    }
  };

  // Loading / error states
  if (isLoading) {
    return (
      <div
        className="club-details"
        style={{ padding: "64px 32px", textAlign: "center", color: "#6b7280" }}
      >
        Loading club...
      </div>
    );
  }

  if (error || !club) {
    return (
      <div
        className="club-details"
        style={{ padding: "64px 32px", textAlign: "center" }}
      >
        <p style={{ color: "#dc2626", marginBottom: "16px" }}>
          {error ?? "Club not found"}
        </p>
        <button className="cd-btn-outline" onClick={() => navigate("/clubs")}>
          <ArrowLeft size={16} /> Back to Clubs
        </button>
      </div>
    );
  }

  const bannerColor = club.club_color ?? "#0f172a";

  return (
    <div className="club-details">
      {/* Hero Banner */}
      <div
        className="cd-hero"
        style={
          isSafeHttpUrl(club.banner_url)
            ? {
                backgroundImage: `url(${encodeURI(club.banner_url as string)})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : { backgroundColor: bannerColor }
        }
      >
        <button className="cd-hero-back" onClick={() => navigate("/clubs")}>
          <ArrowLeft size={18} /> Back to Clubs
        </button>
      </div>

      <div className="cd-container" style={{ marginTop: "-48px" }}>
        {/* Header Card */}
        <div className="cd-header-card">
          <div>
            <div className="cd-header-title-row">
              <h1 className="cd-header-title">{club.name}</h1>
              {club.type && <span className="cd-type-badge">{club.type}</span>}
            </div>
            {club.description && (
              <p className="cd-header-desc">{club.description}</p>
            )}
          </div>
          <div className="cd-header-right">
            <div className="cd-member-stat">
              <p className="cd-member-stat-count">{club.member_count}</p>
              <p className="cd-member-stat-label">Members</p>
            </div>
            {currentUserRole && (
              <>
                <div className="cd-divider-v" />
                <button
                  className="cd-leave-btn"
                  onClick={() => setIsLeaveOpen(true)}
                >
                  <LogOut size={16} /> Leave Club
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="cd-tabs">
          {TABS.filter((tab) => tab !== "Settings" || isPresident).map(
            (tab) => (
              <button
                key={tab}
                className={`cd-tab ${activeTab === tab ? "cd-tab--active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        {/* Tab Content */}
        <div className="cd-tab-content">
          {/* ── Overview ── */}
          {activeTab === "Overview" && (
            <div className="cd-overview">
              <div>
                <div className="cd-card">
                  <h3>About the Club</h3>
                  <div className="cd-about-text">
                    <p>
                      {club.description
                        ? club.description
                        : `Welcome to ${club.name}! This club doesn't have a description yet.`}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <div className="cd-card">
                  <h3>External Links</h3>
                  <div className="cd-links">
                    {isSafeHttpUrl(club.discord_link) && (
                      <a
                        href={club.discord_link as string}
                        target="_blank"
                        rel="noreferrer"
                        className="cd-link-item"
                      >
                        <MessageSquare size={18} style={{ color: "#5865F2" }} />{" "}
                        Discord Server
                      </a>
                    )}
                    {isSafeHttpUrl(club.instagram_link) && (
                      <a
                        href={club.instagram_link as string}
                        target="_blank"
                        rel="noreferrer"
                        className="cd-link-item"
                      >
                        <LinkIcon size={18} style={{ color: "#E1306C" }} />{" "}
                        Instagram
                      </a>
                    )}
                    {isSafeHttpUrl(club.website_link) && (
                      <a
                        href={club.website_link as string}
                        target="_blank"
                        rel="noreferrer"
                        className="cd-link-item"
                      >
                        <Globe size={18} style={{ color: "#6b7280" }} /> Club
                        Website
                      </a>
                    )}
                    {!isSafeHttpUrl(club.discord_link) &&
                      !isSafeHttpUrl(club.instagram_link) &&
                      !isSafeHttpUrl(club.website_link) && (
                        <p className="cd-no-links">
                          No external links provided yet.
                        </p>
                      )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Events ── */}
          {activeTab === "Events" && (
            <div>
              <div className="cd-events-header">
                <h2>Club Events</h2>
                {canManageEvents && (
                  <button className="cd-btn-outline">
                    <Plus size={16} /> New Event
                  </button>
                )}
              </div>
              {eventsLoading ? (
                <div className="cd-events-empty">Loading events...</div>
              ) : eventsError ? (
                <div className="cd-events-empty">{eventsError}</div>
              ) : events.length > 0 ? (
                <div className="cd-events-grid">
                  {events.map((event) => (
                    <EventCard
                      key={event.event_id}
                      title={event.title}
                      date={event.date ?? "No date set"}
                      location={event.location ?? "No location set"}
                      status={event.status}
                      attendees={event.attendee_count ?? 0}
                      color={getEventColor(event)}
                      onClick={() =>
                        navigate(`/clubs/${clubId}/events/${event.event_id}`)
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="cd-events-empty">
                  <div className="cd-events-empty-icon">
                    <Calendar size={24} />
                  </div>
                  <h3>No events yet</h3>
                  <p>
                    This club hasn't created any events. Create the first event
                    to kick things off!
                  </p>
                  {canManageEvents && (
                    <button className="cd-btn-primary">
                      Create First Event
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Members ── */}
          {activeTab === "Members" && (
            <div>
              <div className="cd-members-header">
                <div className="cd-members-search">
                  <Search className="cd-members-search-icon" size={16} />
                  <input
                    type="text"
                    placeholder="Search members..."
                    aria-label="Search members"
                  />
                </div>
                {canManageEvents && (
                  <button
                    className="cd-btn-primary"
                    onClick={() => setIsInviteOpen(true)}
                  >
                    <UserPlus size={16} /> Invite Members
                  </button>
                )}
              </div>
              {memberActionError && (
                <div className="cd-action-error" role="alert">
                  <span>{memberActionError}</span>
                  <button
                    className="cd-action-error-dismiss"
                    onClick={() => setMemberActionError(null)}
                    aria-label="Dismiss error"
                    type="button"
                  >
                    ×
                  </button>
                </div>
              )}
              {membersLoading ? (
                <div className="cd-members-empty">Loading members...</div>
              ) : membersError ? (
                <div className="cd-members-empty">{membersError}</div>
              ) : (
                <MembersTable
                  members={members}
                  currentUserRole={currentUserRole}
                  onRoleChange={handleRoleChange}
                  onRemove={handleRemoveMember}
                />
              )}
            </div>
          )}

          {/* ── Settings ── */}
          {activeTab === "Settings" && isPresident && (
            <div className="cd-settings">
              <div className="cd-settings-card">
                <div className="cd-settings-card-header">
                  <h3>General Information</h3>
                  <p>Update your club's profile details and banner.</p>
                </div>
                <div className="cd-settings-body">
                  <div className="cd-form-group">
                    <label className="cd-form-label">Club Name</label>
                    <input
                      type="text"
                      className="cd-form-input"
                      defaultValue={club.name}
                    />
                  </div>
                  <div className="cd-form-group">
                    <label className="cd-form-label">Club Category</label>
                    <select
                      className="cd-form-select"
                      defaultValue={club.type ?? ""}
                    >
                      <option value="">Select a category</option>
                      <option>Social</option>
                      <option>Academic</option>
                      <option>Cultural</option>
                      <option>Technology</option>
                      <option>Hobby</option>
                      <option>Activist</option>
                      <option>Religious</option>
                      <option>Fitness</option>
                    </select>
                  </div>
                  <div className="cd-form-group">
                    <label className="cd-form-label">
                      Club Banner{" "}
                      <span className="cd-form-label-hint">(Optional)</span>
                    </label>
                    <div
                      className="cd-banner-preview"
                      style={{ backgroundColor: bannerColor }}
                    >
                      <div className="cd-banner-hover">
                        <span className="cd-banner-hover-text">
                          <ImageIcon size={18} /> Change Cover
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="cd-socials-section"
                    style={{
                      paddingTop: "16px",
                      borderTop: "1px solid #f3f4f6",
                    }}
                  >
                    <h4>External Links & Socials</h4>
                    <div
                      className="cd-form-group"
                      style={{ marginBottom: "16px" }}
                    >
                      <label className="cd-form-label">
                        Shared Drive Link{" "}
                        <span className="cd-form-label-hint">(Internal)</span>
                      </label>
                      <input
                        type="url"
                        className="cd-form-input"
                        defaultValue={club.shared_drive_link ?? ""}
                        placeholder="https://drive.google.com/..."
                      />
                    </div>
                    <div className="cd-socials-grid">
                      <div className="cd-form-group">
                        <label className="cd-socials-label">
                          <MessageSquare
                            size={14}
                            style={{ color: "#5865F2" }}
                          />{" "}
                          Discord Invite Link
                        </label>
                        <input
                          type="url"
                          className="cd-form-input"
                          defaultValue={club.discord_link ?? ""}
                          placeholder="https://discord.gg/..."
                        />
                      </div>
                      <div className="cd-form-group">
                        <label className="cd-socials-label">
                          <LinkIcon size={14} style={{ color: "#E1306C" }} />{" "}
                          Instagram Link
                        </label>
                        <input
                          type="url"
                          className="cd-form-input"
                          defaultValue={club.instagram_link ?? ""}
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                    </div>
                    <div
                      className="cd-form-group"
                      style={{ marginTop: "16px" }}
                    >
                      <label className="cd-socials-label">
                        <Globe size={14} style={{ color: "#6b7280" }} /> Website
                        URL
                      </label>
                      <input
                        type="url"
                        className="cd-form-input"
                        defaultValue={club.website_link ?? ""}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'right' }}>Editing club settings is coming soon.</p>
              </div>

              {/* Danger Zone */}
              <div className="cd-danger-zone">
                <h3>Danger Zone</h3>
                <p>
                  Deleting a club is irreversible. All associated events, tasks,
                  and member data will be permanently removed.
                </p>
                <button
                  className="cd-danger-btn"
                  onClick={() => setIsDeleteOpen(true)}
                >
                  <Trash2 size={16} /> Delete Club
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <LeaveClubModal
        isOpen={isLeaveOpen}
        onClose={() => setIsLeaveOpen(false)}
        onLeave={async () => {
          if (!club || !token) return;

          try {
            await leaveClub(club.club_id, token);
            setIsLeaveOpen(false);
            navigate('/clubs');
          } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Failed to leave club');
          }
        }}
        clubName={club.name}
      />
      <DeleteClubModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onDelete={handleDeleteClub}
        clubName={club.name}
      />
      {token && (
        <InviteMembersModal
          isOpen={isInviteOpen}
          onClose={() => setIsInviteOpen(false)}
          clubId={club.club_id}
          clubName={club.name}
          joinCode={club.join_code ?? undefined}
          token={token}
          onSendInvites={handleSendInvitations}
        />
      )}
    </div>
  );
}
