import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { deleteEvent } from '../../api/events.api';
import type { Event } from '../../types/events.types';
import './DeleteEventModal.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  onDeleted: () => void;
}

const CASCADE_ITEMS = [
  'Tasks',
  'Attendees roster',
  'Safety checklist and emergency contacts',
  'Carpool drivers and passenger sign-ups',
  'Contracts',
];

export default function DeleteEventModal({
  isOpen,
  onClose,
  event,
  onDeleted,
}: Props) {
  const { token } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state every time the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setConfirmText('');
    setError(null);
    setSubmitting(false);
    // Focus after the open animation settles.
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  // ESC to close (but not while a delete is in flight).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const matches = confirmText.trim() === event.title.trim();

  const handleDelete = async () => {
    if (!token || !matches || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await deleteEvent(event.club_id, event.event_id, token);
      onDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event.');
      setSubmitting(false);
    }
  };

  const handleBackdropClick = () => {
    if (!submitting) onClose();
  };

  return (
    <div
      className="cem-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-event-title"
      onClick={handleBackdropClick}
    >
      <div className="cem-card dem-card" onClick={(e) => e.stopPropagation()}>
        <div className="cem-header dem-header">
          <div className="dem-header-title">
            <div className="dem-icon-wrap" aria-hidden="true">
              <AlertTriangle size={20} />
            </div>
            <h2 id="delete-event-title" className="cem-title">
              Delete event
            </h2>
          </div>
          <button
            type="button"
            className="cem-close-btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="dem-body">
          <p className="dem-lead">
            You're about to permanently delete{' '}
            <span className="dem-event-name">{event.title}</span>. This cannot
            be undone.
          </p>

          <div className="dem-cascade">
            <div className="dem-cascade-heading">
              The following will also be deleted:
            </div>
            <ul className="dem-cascade-list">
              {CASCADE_ITEMS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <label className="dem-confirm-label" htmlFor="dem-confirm-input">
            To confirm, type the event title exactly:
            <span className="dem-confirm-target"> {event.title}</span>
          </label>
          <input
            id="dem-confirm-input"
            ref={inputRef}
            type="text"
            className="dem-confirm-input"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={event.title}
            disabled={submitting}
            autoComplete="off"
            spellCheck={false}
          />

          {error && <div className="dem-error">{error}</div>}
        </div>

        <div className="dem-footer">
          <button
            type="button"
            className="dem-cancel-btn"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="dem-confirm-btn"
            onClick={handleDelete}
            disabled={!matches || submitting}
          >
            {submitting ? 'Deleting…' : 'Delete event'}
          </button>
        </div>
      </div>
    </div>
  );
}
