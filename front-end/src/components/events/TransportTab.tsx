import { useEffect, useMemo, useState } from 'react';
import { Car, Plus, Trash2, UserMinus, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  listTransportDrivers,
  createTransportDriver,
  deleteTransportDriver,
  joinTransportDriver,
  leaveTransportDriver,
  type TransportDriver,
  type CreateTransportDriverInput,
} from '../../api/transport.api';

interface Props {
  eventId: string;
  canEdit: boolean;
}

function formatDeparture(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toDateTimeLocalValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function TransportTab({ eventId, canEdit }: Props) {
  const { token, user } = useAuth();
  const myUserId = user?.user_id ?? null;

  const [drivers, setDrivers] = useState<TransportDriver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyDriverId, setBusyDriverId] = useState<string | null>(null);

  // Add-driver form state
  const [driverName, setDriverName] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [seats, setSeats] = useState('4');
  const [departureLocation, setDepartureLocation] = useState('');
  const [departureTime, setDepartureTime] = useState(() => {
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    return toDateTimeLocalValue(d);
  });
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    listTransportDrivers(eventId, token)
      .then((list) => { if (!cancelled) setDrivers(list); })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load drivers.');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [eventId, token]);

  const resetForm = () => {
    setDriverName(user?.name ?? '');
    setVehicle('');
    setSeats('4');
    setDepartureLocation('');
    const d = new Date();
    d.setHours(d.getHours() + 1, 0, 0, 0);
    setDepartureTime(toDateTimeLocalValue(d));
    setNotes('');
  };

  const handleOpenAdd = () => {
    resetForm();
    setDriverName(user?.name ?? '');
    setShowAddForm(true);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!token || !canEdit) return;
    const seatsNum = Number(seats);
    if (!driverName.trim()) {
      setError('Driver name is required.');
      return;
    }
    if (!departureLocation.trim()) {
      setError('Departure location is required.');
      return;
    }
    if (!Number.isInteger(seatsNum) || seatsNum < 1) {
      setError('Seats must be a whole number of 1 or more.');
      return;
    }
    if (!departureTime) {
      setError('Departure time is required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    const dto: CreateTransportDriverInput = {
      driver_name: driverName.trim(),
      vehicle: vehicle.trim() || undefined,
      seats_total: seatsNum,
      departure_location: departureLocation.trim(),
      departure_time: new Date(departureTime).toISOString(),
      notes: notes.trim() || undefined,
    };
    try {
      const created = await createTransportDriver(eventId, dto, token);
      setDrivers((prev) =>
        [...prev, created].sort(
          (a, b) =>
            new Date(a.departure_time).getTime() -
            new Date(b.departure_time).getTime(),
        ),
      );
      setShowAddForm(false);
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create driver.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDriver = async (driverId: string) => {
    if (!token || !canEdit) return;
    const prev = drivers;
    setDrivers((p) => p.filter((d) => d.driver_id !== driverId));
    try {
      await deleteTransportDriver(eventId, driverId, token);
    } catch (err) {
      setDrivers(prev);
      setError(err instanceof Error ? err.message : 'Failed to delete driver.');
    }
  };

  const handleJoin = async (driver: TransportDriver) => {
    if (!token) return;
    setBusyDriverId(driver.driver_id);
    setError(null);
    try {
      const passenger = await joinTransportDriver(eventId, driver.driver_id, token);
      setDrivers((prev) =>
        prev.map((d) =>
          d.driver_id === driver.driver_id
            ? { ...d, passengers: [...d.passengers, passenger] }
            : d,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to claim seat.');
    } finally {
      setBusyDriverId(null);
    }
  };

  const handleLeave = async (driver: TransportDriver, passengerId: string) => {
    if (!token) return;
    setBusyDriverId(driver.driver_id);
    setError(null);
    try {
      await leaveTransportDriver(eventId, driver.driver_id, passengerId, token);
      setDrivers((prev) =>
        prev.map((d) =>
          d.driver_id === driver.driver_id
            ? {
                ...d,
                passengers: d.passengers.filter(
                  (p) => p.passenger_id !== passengerId,
                ),
              }
            : d,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to drop seat.');
    } finally {
      setBusyDriverId(null);
    }
  };

  const totalSeats = useMemo(
    () => drivers.reduce((sum, d) => sum + d.seats_total, 0),
    [drivers],
  );
  const claimed = useMemo(
    () => drivers.reduce((sum, d) => sum + d.passengers.length, 0),
    [drivers],
  );

  if (loading) {
    return <div className="safety-tab-empty">Loading transport…</div>;
  }

  return (
    <div className="safety-tab-wrap">
      {error && <div className="safety-tab-error">{error}</div>}

      <div className="safety-tab">
        <div className="safety-tab-header">
          <div className="safety-tab-header-title">
            <Car size={18} />
            <h2>Carpool</h2>
          </div>
          <span className="safety-tab-progress">
            {claimed} / {totalSeats} seats filled
          </span>
        </div>

        <p className="safety-tab-hint">
          Officers add drivers. Anyone in the club can claim an open seat.
        </p>

        {canEdit && !showAddForm && (
          <div className="transport-add-row">
            <button
              type="button"
              className="safety-tab-add-btn"
              onClick={handleOpenAdd}
            >
              <Plus size={14} /> Add driver
            </button>
          </div>
        )}

        {showAddForm && canEdit && (
          <div className="safety-tab-contact-form">
            <input
              className="safety-tab-input"
              type="text"
              placeholder="Driver name"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              disabled={submitting}
            />
            <input
              className="safety-tab-input"
              type="text"
              placeholder="Vehicle (e.g. Silver Toyota Camry)"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              disabled={submitting}
            />
            <div className="transport-form-row">
              <input
                className="safety-tab-input"
                type="number"
                min={1}
                max={50}
                placeholder="Seats"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                disabled={submitting}
              />
              <input
                className="safety-tab-input"
                type="datetime-local"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                disabled={submitting}
              />
            </div>
            <input
              className="safety-tab-input"
              type="text"
              placeholder="Departure location"
              value={departureLocation}
              onChange={(e) => setDepartureLocation(e.target.value)}
              disabled={submitting}
            />
            <textarea
              className="safety-tab-input"
              rows={2}
              placeholder="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
            />
            <div className="safety-tab-form-actions">
              <button
                type="button"
                className="safety-tab-cancel-btn"
                onClick={() => { setShowAddForm(false); resetForm(); }}
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

        {drivers.length === 0 ? (
          <div className="safety-tab-contact-empty">No drivers yet.</div>
        ) : (
          <ul className="safety-tab-list">
            {drivers.map((d) => {
              const taken = d.passengers.length;
              const open = d.seats_total - taken;
              const mySeat = myUserId
                ? d.passengers.find((p) => p.user_id === myUserId)
                : undefined;
              const busy = busyDriverId === d.driver_id;
              return (
                <li key={d.driver_id} className="transport-driver">
                  <div className="transport-driver-head">
                    <div className="transport-driver-info">
                      <div className="transport-driver-name">{d.driver_name}</div>
                      {d.vehicle && (
                        <div className="transport-driver-meta">{d.vehicle}</div>
                      )}
                      <div className="transport-driver-meta">
                        {formatDeparture(d.departure_time)} · {d.departure_location}
                      </div>
                      {d.notes && (
                        <div className="transport-driver-notes">{d.notes}</div>
                      )}
                    </div>
                    <div className="transport-driver-side">
                      <span className="transport-seats-badge">
                        {open} / {d.seats_total} open
                      </span>
                      {canEdit && (
                        <button
                          type="button"
                          className="safety-tab-delete-btn"
                          onClick={() => handleDeleteDriver(d.driver_id)}
                          aria-label="Delete driver"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="transport-passengers">
                    {d.passengers.length === 0 ? (
                      <div className="transport-passengers-empty">No passengers yet.</div>
                    ) : (
                      <ul className="transport-passenger-list">
                        {d.passengers.map((p) => (
                          <li key={p.passenger_id} className="transport-passenger">
                            <span>{p.user_name ?? 'Member'}</span>
                            {(p.user_id === myUserId || canEdit) && (
                              <button
                                type="button"
                                className="transport-passenger-remove"
                                onClick={() => handleLeave(d, p.passenger_id)}
                                disabled={busy}
                                aria-label={`Remove ${p.user_name ?? 'passenger'}`}
                              >
                                <UserMinus size={12} />
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    {!mySeat && open > 0 && (
                      <button
                        type="button"
                        className="transport-join-btn"
                        onClick={() => handleJoin(d)}
                        disabled={busy}
                      >
                        <UserPlus size={14} /> Claim a seat
                      </button>
                    )}
                    {!mySeat && open === 0 && (
                      <div className="transport-full">This car is full.</div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
