import { useEffect, useState } from 'react';
import { ShieldCheck, Phone, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  listSafetyChecks,
  setSafetyCheckCompleted,
  listEmergencyContacts,
  createEmergencyContact,
  deleteEmergencyContact,
  type SafetyCheck,
  type EmergencyContact,
} from '../../api/safety.api';

interface Props {
  eventId: string;
  canEdit: boolean;
}

export default function SafetyTab({ eventId, canEdit }: Props) {
  const { token } = useAuth();

  const [checks, setChecks] = useState<SafetyCheck[]>([]);
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingCheckId, setSavingCheckId] = useState<string | null>(null);

  // Add-contact form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      listSafetyChecks(eventId, token),
      listEmergencyContacts(eventId, token),
    ])
      .then(([checkList, contactList]) => {
        if (cancelled) return;
        setChecks(checkList);
        setContacts(contactList);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [eventId, token]);

  const handleToggle = async (check: SafetyCheck) => {
    if (!token || !canEdit || savingCheckId) return;
    setSavingCheckId(check.check_id);
    const next = !check.completed;
    setChecks((prev) =>
      prev.map((c) => (c.check_id === check.check_id ? { ...c, completed: next } : c)),
    );
    try {
      const updated = await setSafetyCheckCompleted(eventId, check.check_id, next, token);
      setChecks((prev) =>
        prev.map((c) => (c.check_id === updated.check_id ? updated : c)),
      );
    } catch (err) {
      setChecks((prev) =>
        prev.map((c) => (c.check_id === check.check_id ? { ...c, completed: !next } : c)),
      );
      setError(err instanceof Error ? err.message : 'Failed to update.');
    } finally {
      setSavingCheckId(null);
    }
  };

  const handleAddContact = async () => {
    if (!token || !canEdit) return;
    if (!newName.trim() || !newPhone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setSubmittingContact(true);
    setError(null);
    try {
      const created = await createEmergencyContact(
        eventId,
        {
          name: newName.trim(),
          role: newRole.trim() || undefined,
          phone: newPhone.trim(),
        },
        token,
      );
      setContacts((prev) => [...prev, created]);
      setNewName('');
      setNewRole('');
      setNewPhone('');
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add contact.');
    } finally {
      setSubmittingContact(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!token || !canEdit) return;
    const prev = contacts;
    setContacts((p) => p.filter((c) => c.contact_id !== contactId));
    try {
      await deleteEmergencyContact(eventId, contactId, token);
    } catch (err) {
      setContacts(prev);
      setError(err instanceof Error ? err.message : 'Failed to delete contact.');
    }
  };

  const done = checks.filter((c) => c.completed).length;
  const total = checks.length;

  if (loading) {
    return <div className="safety-tab-empty">Loading safety details…</div>;
  }

  return (
    <div className="safety-tab-wrap">
      {error && <div className="safety-tab-error">{error}</div>}

      {/* Checklist */}
      <div className="safety-tab">
        <div className="safety-tab-header">
          <div className="safety-tab-header-title">
            <ShieldCheck size={18} />
            <h2>Pre-publish safety checklist</h2>
          </div>
          <span className="safety-tab-progress">{done} / {total} cleared</span>
        </div>

        <ul className="safety-tab-list">
          {checks.map((c) => (
            <li
              key={c.check_id}
              className={`safety-tab-item ${c.completed ? 'safety-tab-item--done' : ''}`}
            >
              <input
                type="checkbox"
                className="safety-tab-checkbox"
                checked={c.completed}
                disabled={!canEdit || savingCheckId === c.check_id}
                onChange={() => handleToggle(c)}
                aria-label={c.label}
              />
              <div className="safety-tab-item-body">
                <div className="safety-tab-item-label">
                  {c.label}
                  {c.required && <span className="safety-tab-required">Required</span>}
                </div>
                {c.description && (
                  <div className="safety-tab-item-desc">{c.description}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Emergency contacts */}
      <div className="safety-tab">
        <div className="safety-tab-header">
          <div className="safety-tab-header-title">
            <Phone size={18} />
            <h2>Emergency contacts</h2>
          </div>
          {canEdit && !showAddForm && (
            <button
              type="button"
              className="safety-tab-add-btn"
              onClick={() => setShowAddForm(true)}
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        <p className="safety-tab-hint">
          The president and vice-president should list their numbers here.
        </p>

        {showAddForm && canEdit && (
          <div className="safety-tab-contact-form">
            <input
              className="safety-tab-input"
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={submittingContact}
            />
            <input
              className="safety-tab-input"
              type="text"
              placeholder="Role (e.g. President)"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              disabled={submittingContact}
            />
            <input
              className="safety-tab-input"
              type="tel"
              placeholder="Phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              disabled={submittingContact}
            />
            <div className="safety-tab-form-actions">
              <button
                type="button"
                className="safety-tab-cancel-btn"
                onClick={() => {
                  setShowAddForm(false);
                  setNewName(''); setNewRole(''); setNewPhone('');
                }}
                disabled={submittingContact}
              >
                Cancel
              </button>
              <button
                type="button"
                className="safety-tab-save-btn"
                onClick={handleAddContact}
                disabled={submittingContact}
              >
                {submittingContact ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {contacts.length === 0 ? (
          <div className="safety-tab-contact-empty">No emergency contacts yet.</div>
        ) : (
          <ul className="safety-tab-list">
            {contacts.map((c) => (
              <li key={c.contact_id} className="safety-tab-contact-row">
                <div className="safety-tab-contact-info">
                  <div className="safety-tab-contact-name">{c.name}</div>
                  {c.role && <div className="safety-tab-contact-role">{c.role}</div>}
                </div>
                <a href={`tel:${c.phone}`} className="safety-tab-contact-phone">{c.phone}</a>
                {canEdit && (
                  <button
                    type="button"
                    className="safety-tab-delete-btn"
                    onClick={() => handleDeleteContact(c.contact_id)}
                    aria-label={`Delete ${c.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
