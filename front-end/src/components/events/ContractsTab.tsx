import { useEffect, useState } from 'react';
import { FileText, Plus, Trash2, Pencil, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  listContracts,
  createContract,
  updateContract,
  deleteContract,
  CONTRACT_STATUSES,
  type Contract,
  type ContractInput,
  type ContractStatus,
} from '../../api/contracts.api';

interface Props {
  eventId: string;
  canEdit: boolean;
}

interface FormState {
  contract_id: string | null;
  title: string;
  counterparty: string;
  value_amount: string;
  value_currency: string;
  status: ContractStatus;
  signed_date: string;
  notes: string;
}

const emptyForm: FormState = {
  contract_id: null,
  title: '',
  counterparty: '',
  value_amount: '',
  value_currency: 'AUD',
  status: 'draft',
  signed_date: '',
  notes: '',
};

const STATUS_LABELS: Record<ContractStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  signed: 'Signed',
  cancelled: 'Cancelled',
};

function formatMoney(amount: string | null, currency: string): string {
  if (amount === null) return '—';
  const n = Number(amount);
  if (Number.isNaN(n)) return amount;
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

function formatDate(isoOrDate: string | null): string {
  if (!isoOrDate) return '—';
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return isoOrDate;
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function ContractsTab({ eventId, canEdit }: Props) {
  const { token } = useAuth();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  useEffect(() => {
    if (!token || !canEdit) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    listContracts(eventId, token)
      .then((list) => { if (!cancelled) setContracts(list); })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load contracts.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [eventId, token, canEdit]);

  if (!canEdit) {
    return (
      <div className="safety-tab-wrap">
        <div className="contracts-locked">
          <Lock size={20} />
          <div>
            <div className="contracts-locked-title">Officers only</div>
            <div className="contracts-locked-text">
              Contracts are visible to the president and vice-president of the
              hosting club.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const openCreate = () => {
    setForm(emptyForm);
    setShowForm(true);
    setError(null);
  };

  const openEdit = (c: Contract) => {
    setForm({
      contract_id: c.contract_id,
      title: c.title,
      counterparty: c.counterparty ?? '',
      value_amount: c.value_amount ?? '',
      value_currency: c.value_currency,
      status: c.status,
      signed_date: c.signed_date ?? '',
      notes: c.notes ?? '',
    });
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
  };

  const buildDto = (): ContractInput | null => {
    const title = form.title.trim();
    if (!title) {
      setError('Title is required.');
      return null;
    }
    const valueRaw = form.value_amount.trim();
    let value: number | null = null;
    if (valueRaw.length > 0) {
      const n = Number(valueRaw);
      if (Number.isNaN(n) || n < 0) {
        setError('Value must be a non-negative number.');
        return null;
      }
      value = n;
    }
    return {
      title,
      counterparty: form.counterparty.trim() || null,
      value_amount: value,
      value_currency: form.value_currency.trim().toUpperCase() || 'AUD',
      status: form.status,
      signed_date: form.signed_date || null,
      notes: form.notes.trim() || null,
    };
  };

  const handleSubmit = async () => {
    if (!token) return;
    const dto = buildDto();
    if (!dto) return;
    setSubmitting(true);
    setError(null);
    try {
      if (form.contract_id) {
        const updated = await updateContract(eventId, form.contract_id, dto, token);
        setContracts((prev) =>
          prev.map((c) => (c.contract_id === updated.contract_id ? updated : c)),
        );
      } else {
        const created = await createContract(eventId, dto, token);
        setContracts((prev) => [created, ...prev]);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save contract.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (contractId: string) => {
    if (!token) return;
    const prev = contracts;
    setContracts((p) => p.filter((c) => c.contract_id !== contractId));
    try {
      await deleteContract(eventId, contractId, token);
    } catch (err) {
      setContracts(prev);
      setError(err instanceof Error ? err.message : 'Failed to delete contract.');
    }
  };

  if (loading) {
    return <div className="safety-tab-empty">Loading contracts…</div>;
  }

  return (
    <div className="safety-tab-wrap">
      {error && <div className="safety-tab-error">{error}</div>}

      <div className="safety-tab">
        <div className="safety-tab-header">
          <div className="safety-tab-header-title">
            <FileText size={18} />
            <h2>Contracts</h2>
          </div>
          {!showForm && (
            <button
              type="button"
              className="safety-tab-add-btn"
              onClick={openCreate}
            >
              <Plus size={14} /> Add
            </button>
          )}
        </div>

        <p className="safety-tab-hint">
          Track venue and supplier agreements. Values are visible to officers only.
        </p>

        {showForm && (
          <div className="safety-tab-contact-form">
            <input
              className="safety-tab-input"
              type="text"
              placeholder="Title (e.g. Venue booking — MSAC)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              disabled={submitting}
            />
            <input
              className="safety-tab-input"
              type="text"
              placeholder="Counterparty (e.g. Melbourne Sports Centre)"
              value={form.counterparty}
              onChange={(e) => setForm({ ...form, counterparty: e.target.value })}
              disabled={submitting}
            />
            <div className="transport-form-row">
              <input
                className="safety-tab-input"
                type="number"
                step="0.01"
                min={0}
                placeholder="Value"
                value={form.value_amount}
                onChange={(e) => setForm({ ...form, value_amount: e.target.value })}
                disabled={submitting}
              />
              <input
                className="safety-tab-input"
                type="text"
                maxLength={3}
                placeholder="AUD"
                value={form.value_currency}
                onChange={(e) =>
                  setForm({ ...form, value_currency: e.target.value.toUpperCase() })
                }
                disabled={submitting}
                style={{ maxWidth: 90 }}
              />
            </div>
            <div className="transport-form-row">
              <select
                className="safety-tab-input"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as ContractStatus })
                }
                disabled={submitting}
              >
                {CONTRACT_STATUSES.map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <input
                className="safety-tab-input"
                type="date"
                value={form.signed_date}
                onChange={(e) => setForm({ ...form, signed_date: e.target.value })}
                disabled={submitting}
              />
            </div>
            <textarea
              className="safety-tab-input"
              rows={3}
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              disabled={submitting}
            />
            <div className="safety-tab-form-actions">
              <button
                type="button"
                className="safety-tab-cancel-btn"
                onClick={closeForm}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="safety-tab-save-btn"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {contracts.length === 0 ? (
          <div className="safety-tab-contact-empty">No contracts yet.</div>
        ) : (
          <ul className="safety-tab-list">
            {contracts.map((c) => (
              <li key={c.contract_id} className="contract-row">
                <div className="contract-row-main">
                  <div className="contract-row-title">{c.title}</div>
                  {c.counterparty && (
                    <div className="contract-row-counterparty">{c.counterparty}</div>
                  )}
                  <div className="contract-row-meta">
                    <span className={`contract-status contract-status--${c.status}`}>
                      {STATUS_LABELS[c.status]}
                    </span>
                    <span className="contract-row-value">
                      {formatMoney(c.value_amount, c.value_currency)}
                    </span>
                    {c.signed_date && (
                      <span className="contract-row-date">
                        Signed {formatDate(c.signed_date)}
                      </span>
                    )}
                  </div>
                  {c.notes && (
                    <div className="contract-row-notes">{c.notes}</div>
                  )}
                </div>
                <div className="contract-row-actions">
                  <button
                    type="button"
                    className="safety-tab-delete-btn"
                    onClick={() => openEdit(c)}
                    aria-label={`Edit ${c.title}`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="safety-tab-delete-btn"
                    onClick={() => handleDelete(c.contract_id)}
                    aria-label={`Delete ${c.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
