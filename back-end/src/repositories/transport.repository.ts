import pool from '../db';
import {
  CreateTransportDriverDTO,
  TransportDriver,
  TransportPassenger,
  UpdateTransportDriverDTO,
} from '../entities/transport.entity';

interface DriverRow {
  driver_id: string;
  event_id: string;
  driver_user_id: string | null;
  driver_name: string;
  vehicle: string | null;
  seats_total: number;
  departure_location: string;
  departure_time: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

function mapDriver(row: DriverRow, passengers: TransportPassenger[]): TransportDriver {
  return { ...row, passengers };
}

export async function getDriversByEventId(
  eventId: string,
): Promise<TransportDriver[]> {
  const driverRes = await pool.query<DriverRow>(
    `SELECT *
     FROM "Event_Transport_Drivers"
     WHERE event_id = $1
     ORDER BY departure_time ASC, created_at ASC`,
    [eventId],
  );

  const drivers = driverRes.rows;
  if (drivers.length === 0) return [];

  const driverIds = drivers.map((d) => d.driver_id);
  const passengerRes = await pool.query<TransportPassenger>(
    `SELECT
        p.passenger_id,
        p.driver_id,
        p.user_id,
        u.name AS user_name,
        p.created_at
     FROM "Event_Transport_Passengers" p
     LEFT JOIN "Users" u ON u.user_id = p.user_id
     WHERE p.driver_id = ANY($1::uuid[])
     ORDER BY p.created_at ASC`,
    [driverIds],
  );

  const byDriver = new Map<string, TransportPassenger[]>();
  for (const p of passengerRes.rows) {
    const list = byDriver.get(p.driver_id) ?? [];
    list.push(p);
    byDriver.set(p.driver_id, list);
  }

  return drivers.map((d) => mapDriver(d, byDriver.get(d.driver_id) ?? []));
}

export async function getDriverById(
  driverId: string,
): Promise<TransportDriver | null> {
  const res = await pool.query<DriverRow>(
    `SELECT * FROM "Event_Transport_Drivers" WHERE driver_id = $1`,
    [driverId],
  );
  const row = res.rows[0];
  if (!row) return null;

  const passRes = await pool.query<TransportPassenger>(
    `SELECT
        p.passenger_id,
        p.driver_id,
        p.user_id,
        u.name AS user_name,
        p.created_at
     FROM "Event_Transport_Passengers" p
     LEFT JOIN "Users" u ON u.user_id = p.user_id
     WHERE p.driver_id = $1
     ORDER BY p.created_at ASC`,
    [driverId],
  );

  return mapDriver(row, passRes.rows);
}

export async function createDriver(
  eventId: string,
  dto: CreateTransportDriverDTO,
  createdBy: string,
): Promise<TransportDriver> {
  const res = await pool.query<DriverRow>(
    `INSERT INTO "Event_Transport_Drivers"
        (event_id, driver_user_id, driver_name, vehicle,
         seats_total, departure_location, departure_time, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      eventId,
      dto.driver_user_id ?? null,
      dto.driver_name,
      dto.vehicle ?? null,
      dto.seats_total,
      dto.departure_location,
      dto.departure_time,
      dto.notes ?? null,
      createdBy,
    ],
  );

  return mapDriver(res.rows[0], []);
}

export async function updateDriver(
  driverId: string,
  dto: UpdateTransportDriverDTO,
): Promise<DriverRow | null> {
  const allowed: Record<string, string> = {
    driver_user_id: 'driver_user_id',
    driver_name: 'driver_name',
    vehicle: 'vehicle',
    seats_total: 'seats_total',
    departure_location: 'departure_location',
    departure_time: 'departure_time',
    notes: 'notes',
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  for (const [key, col] of Object.entries(allowed)) {
    if (key in dto) {
      setClauses.push(`"${col}" = $${i}`);
      values.push((dto as Record<string, unknown>)[key] ?? null);
      i++;
    }
  }
  if (setClauses.length === 0) return null;

  values.push(driverId);
  const res = await pool.query<DriverRow>(
    `UPDATE "Event_Transport_Drivers"
     SET ${setClauses.join(', ')}
     WHERE driver_id = $${i}
     RETURNING *`,
    values,
  );
  return res.rows[0] ?? null;
}

export async function deleteDriver(driverId: string): Promise<void> {
  await pool.query(
    `DELETE FROM "Event_Transport_Drivers" WHERE driver_id = $1`,
    [driverId],
  );
}

export async function countPassengersForDriver(
  driverId: string,
): Promise<number> {
  const res = await pool.query<{ count: number }>(
    `SELECT COUNT(*)::int AS count
     FROM "Event_Transport_Passengers"
     WHERE driver_id = $1`,
    [driverId],
  );
  return res.rows[0]?.count ?? 0;
}

export async function getPassenger(
  driverId: string,
  userId: string,
): Promise<TransportPassenger | null> {
  const res = await pool.query<TransportPassenger>(
    `SELECT
        p.passenger_id,
        p.driver_id,
        p.user_id,
        u.name AS user_name,
        p.created_at
     FROM "Event_Transport_Passengers" p
     LEFT JOIN "Users" u ON u.user_id = p.user_id
     WHERE p.driver_id = $1 AND p.user_id = $2`,
    [driverId, userId],
  );
  return res.rows[0] ?? null;
}

export async function getPassengerForEvent(
  eventId: string,
  userId: string,
): Promise<TransportPassenger | null> {
  const res = await pool.query<TransportPassenger>(
    `SELECT
        p.passenger_id,
        p.driver_id,
        p.user_id,
        u.name AS user_name,
        p.created_at
     FROM "Event_Transport_Passengers" p
     INNER JOIN "Event_Transport_Drivers" d ON d.driver_id = p.driver_id
     LEFT JOIN "Users" u ON u.user_id = p.user_id
     WHERE d.event_id = $1 AND p.user_id = $2
     LIMIT 1`,
    [eventId, userId],
  );
  return res.rows[0] ?? null;
}

export async function getPassengerById(
  passengerId: string,
): Promise<TransportPassenger | null> {
  const res = await pool.query<TransportPassenger>(
    `SELECT
        p.passenger_id,
        p.driver_id,
        p.user_id,
        u.name AS user_name,
        p.created_at
     FROM "Event_Transport_Passengers" p
     LEFT JOIN "Users" u ON u.user_id = p.user_id
     WHERE p.passenger_id = $1`,
    [passengerId],
  );
  return res.rows[0] ?? null;
}

export async function createPassenger(
  driverId: string,
  userId: string,
): Promise<TransportPassenger | null> {
  const insertRes = await pool.query<TransportPassenger>(
    `WITH locked_driver AS (
        SELECT driver_id, seats_total
        FROM "Event_Transport_Drivers"
        WHERE driver_id = $1
        FOR UPDATE
      ),
      seat_count AS (
        SELECT COUNT(*)::int AS taken
        FROM "Event_Transport_Passengers"
        WHERE driver_id = $1
      ),
      inserted AS (
        INSERT INTO "Event_Transport_Passengers" (driver_id, user_id)
        SELECT $1, $2
        FROM locked_driver, seat_count
        WHERE seat_count.taken < locked_driver.seats_total
        RETURNING passenger_id, driver_id, user_id, created_at
      )
      SELECT
        i.passenger_id,
        i.driver_id,
        i.user_id,
        u.name AS user_name,
        i.created_at
      FROM inserted i
      LEFT JOIN "Users" u ON u.user_id = i.user_id`,
    [driverId, userId],
  );
  return insertRes.rows[0] ?? null;
}

export async function deletePassenger(passengerId: string): Promise<void> {
  await pool.query(
    `DELETE FROM "Event_Transport_Passengers" WHERE passenger_id = $1`,
    [passengerId],
  );
}
