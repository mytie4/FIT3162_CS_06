import { useEffect, useMemo, useState } from 'react';
import { Users, Plus, Trash2, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  listAttendees,
  addAttendee,
  removeAttendee,
  type Attendee,
} from '../../api/attendees.api';
import { fetchClubMembers } from '../../api/clubs.api';
import type { ClubMember } from '../../types/clubs.types';

interface Props {
  eventId: string;
  clubId: string;
  canEdit: boolean;
}

const ROLE_LABELS: Record<NonNullable<Attendee['club_role']>, string> = {
  president: 'President',
  vice_president: 'Vice President',
  member: 'Member',
};

export default function AttendeesTab({ eventId, clubId, canEdit }: Props) {
  const { token } = useAuth();

  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [addingUserId, setAddingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listAttendees(eventId, token)
      .then((list) => { if (!cancelled) setAttendees(list); })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load attendees.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [eventId, token]);

  const openPicker = async () => {
    if (!token) return;
    setPickerOpen(true);
    setMembersLoading(true);
    setError(null);
    setFilter('');
    try {
      const list = await fetchClubMembers(clubId);
      setMembers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members.');
    } finally {
      setMembersLoading(false);
    }
  };

  const closePicker = () => {
    setPickerOpen(false);
    setFilter('');
  };

  const attendeeUserIds = useMemo(
    () => new Set(attendees.map((a) => a.user_id)),
    [attendees],
  );

  const eligibleMembers = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return members
      .filter((m) => !attendeeUserIds.has(m.user_id))
      .filter((m) => {
        if (q.length === 0) return true;
        return (
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q)
        );
      });
  }, [members, attendeeUserIds, filter]);

  const handleAdd = async (member: ClubMember) => {
    if (!token) return;
    setAddingUserId(member.user_id);
    setError(null);
    try {
      const created = await addAttendee(eventId, member.user_id, token);
      setAttendees((prev) => [...prev, created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add attendee.');
    } finally {
      setAddingUserId(null);
    }
  };

  const handleRemove = async (attendee: Attendee) => {
    if (!token) return;
    const prev = attendees;
    setAttendees((p) => p.filter((a) => a.user_id !== attendee.user_id));
    try {
      await removeAttendee(eventId, attendee.user_id, token);
    } catch (err) {
      setAttendees(prev);
      setError(err instanceof Error ? err.message : 'Failed to remove attendee.');
    }
  };

  if (loading) {
    return <div className="safety-tab-empty">Loading attendees…</div>;
  }

  return (
    <div className="safety-tab-wrap">
      {error && <div className="safety-tab-error">{error}</div>}

      <div className="safety-tab">
        <div className="safety-tab-header">
          <div className="safety-tab-header-title">
            <Users size={18} />
            <h2>Attendees</h2>
          </div>
          <span className="safety-tab-progress">{attendees.length} on roster</span>
        </div>

        <p className="safety-tab-hint">
          Officers manage the roster. Members see who's coming but cannot add
          themselves.
        </p>

        {canEdit && (
          <div className="attendee-add-row">
            <button
              type="button"
              className="safety-tab-add-btn"
              onClick={openPicker}
            >
              <Plus size={14} /> Add member
            </button>
          </div>
        )}

        {attendees.length === 0 ? (
          <div className="safety-tab-contact-empty">No attendees yet.</div>
        ) : (
          <ul className="safety-tab-list">
            {attendees.map((a) => (
              <li key={a.user_id} className="attendee-row">
                <div className="attendee-avatar" aria-hidden="true">
                  {a.user_avatar ? (
                    <img src={a.user_avatar} alt="" />
                  ) : (
                    <span>{(a.user_name ?? '?').slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div className="attendee-info">
                  <div className="attendee-name">{a.user_name ?? 'Unknown'}</div>
                  <div className="attendee-meta">
                    {a.user_email ?? '—'}
                    {a.club_role && (
                      <>
                        <span className="attendee-dot">·</span>
                        <span
                          className={`attendee-role attendee-role--${a.club_role}`}
                        >
                          {ROLE_LABELS[a.club_role]}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    className="safety-tab-delete-btn"
                    onClick={() => handleRemove(a)}
                    aria-label={`Remove ${a.user_name ?? 'attendee'}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {pickerOpen && canEdit && (
        <div
          className="attendee-picker-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={closePicker}
        >
          <div
            className="attendee-picker"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="attendee-picker-header">
              <h3>Add to roster</h3>
              <button
                type="button"
                className="attendee-picker-close"
                onClick={closePicker}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              className="safety-tab-input attendee-picker-search"
              placeholder="Search by name or email…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              autoFocus
            />
            {membersLoading ? (
              <div className="attendee-picker-empty">Loading members…</div>
            ) : eligibleMembers.length === 0 ? (
              <div className="attendee-picker-empty">
                {members.length === attendeeUserIds.size
                  ? 'Every club member is already on the roster.'
                  : 'No members match.'}
              </div>
            ) : (
              <ul className="attendee-picker-list">
                {eligibleMembers.map((m) => (
                  <li key={m.user_id} className="attendee-picker-row">
                    <div className="attendee-avatar" aria-hidden="true">
                      {m.avatar ? (
                        <img src={m.avatar} alt="" />
                      ) : (
                        <span>{m.name.slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="attendee-info">
                      <div className="attendee-name">{m.name}</div>
                      <div className="attendee-meta">{m.email}</div>
                    </div>
                    <button
                      type="button"
                      className="safety-tab-save-btn"
                      onClick={() => handleAdd(m)}
                      disabled={addingUserId !== null}
                    >
                      {addingUserId === m.user_id ? 'Adding…' : 'Add'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
