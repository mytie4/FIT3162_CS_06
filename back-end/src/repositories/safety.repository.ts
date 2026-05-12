import pool from '../db';
import {
  CreateEmergencyContactDTO,
  CreateHazardDTO,
  CreateSafetyCheckDTO,
  DEFAULT_SAFETY_CHECK_TEMPLATE,
  EmergencyContact,
  Hazard,
  SafetyCheck,
  UpdateEmergencyContactDTO,
  UpdateHazardDTO,
  UpdateSafetyCheckDTO,
} from '../entities/safety.entity';

// ---- Safety Checks ---------------------------------------------------------

export async function createSafetyCheck(
  eventId: string,
  dto: CreateSafetyCheckDTO,
): Promise<SafetyCheck> {
  const result = await pool.query(
    `INSERT INTO "Event_Safety_Checks"
        (event_id, label, description, required, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      eventId,
      dto.label,
      dto.description ?? null,
      dto.required ?? true,
      dto.sort_order ?? 0,
    ],
  );

  return result.rows[0];
}

export async function seedDefaultSafetyChecks(eventId: string): Promise<void> {
  const rows = DEFAULT_SAFETY_CHECK_TEMPLATE.map((item, idx) => ({
    label: item.label,
    description: item.description ?? null,
    required: item.required,
    sort_order: idx,
  }));

  // Build a single multi-row insert.
  const values: unknown[] = [];
  const placeholders = rows
    .map((row, i) => {
      const base = i * 5;
      values.push(
        eventId,
        row.label,
        row.description,
        row.required,
        row.sort_order,
      );
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`;
    })
    .join(', ');

  await pool.query(
    `INSERT INTO "Event_Safety_Checks"
        (event_id, label, description, required, sort_order)
     VALUES ${placeholders}`,
    values,
  );
}

export async function getSafetyChecksByEventId(
  eventId: string,
): Promise<SafetyCheck[]> {
  const result = await pool.query(
    `SELECT *
     FROM "Event_Safety_Checks"
     WHERE event_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [eventId],
  );

  return result.rows;
}

export async function getSafetyCheckById(
  checkId: string,
): Promise<SafetyCheck | null> {
  const result = await pool.query(
    `SELECT * FROM "Event_Safety_Checks" WHERE check_id = $1`,
    [checkId],
  );

  return result.rows[0] ?? null;
}

export async function updateSafetyCheck(
  checkId: string,
  dto: UpdateSafetyCheckDTO,
  completedByUserId: string,
): Promise<SafetyCheck | null> {
  const allowedFields: Record<string, string> = {
    label: 'label',
    description: 'description',
    required: 'required',
    sort_order: 'sort_order',
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [key, column] of Object.entries(allowedFields)) {
    if (key in dto) {
      setClauses.push(`"${column}" = $${paramIndex}`);
      values.push((dto as Record<string, unknown>)[key] ?? null);
      paramIndex++;
    }
  }

  if (dto.completed !== undefined) {
    if (dto.completed) {
      setClauses.push(`"completed" = TRUE`);
      setClauses.push(`"completed_at" = NOW()`);
      setClauses.push(`"completed_by" = $${paramIndex}`);
      values.push(completedByUserId);
      paramIndex++;
    } else {
      setClauses.push(`"completed" = FALSE`);
      setClauses.push(`"completed_at" = NULL`);
      setClauses.push(`"completed_by" = NULL`);
    }
  }

  if (setClauses.length === 0) return null;

  values.push(checkId);

  const result = await pool.query(
    `UPDATE "Event_Safety_Checks"
     SET ${setClauses.join(', ')}
     WHERE check_id = $${paramIndex}
     RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteSafetyCheck(checkId: string): Promise<void> {
  await pool.query(
    `DELETE FROM "Event_Safety_Checks" WHERE check_id = $1`,
    [checkId],
  );
}

export async function countIncompleteRequiredChecks(
  eventId: string,
): Promise<number> {
  const result = await pool.query(
    `SELECT COUNT(*)::int AS count
     FROM "Event_Safety_Checks"
     WHERE event_id = $1
       AND required = TRUE
       AND completed = FALSE`,
    [eventId],
  );

  return result.rows[0]?.count ?? 0;
}

// ---- Hazards ---------------------------------------------------------------

export async function createHazard(
  eventId: string,
  dto: CreateHazardDTO,
  createdBy: string,
): Promise<Hazard> {
  const result = await pool.query(
    `INSERT INTO "Event_Hazards"
        (event_id, label, severity, notes, created_by)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      eventId,
      dto.label,
      dto.severity ?? 'medium',
      dto.notes ?? null,
      createdBy,
    ],
  );

  return result.rows[0];
}

export async function getHazardsByEventId(eventId: string): Promise<Hazard[]> {
  const result = await pool.query(
    `SELECT *
     FROM "Event_Hazards"
     WHERE event_id = $1
     ORDER BY
       CASE severity
         WHEN 'high' THEN 0
         WHEN 'medium' THEN 1
         WHEN 'low' THEN 2
       END,
       created_at DESC`,
    [eventId],
  );

  return result.rows;
}

export async function getHazardById(hazardId: string): Promise<Hazard | null> {
  const result = await pool.query(
    `SELECT * FROM "Event_Hazards" WHERE hazard_id = $1`,
    [hazardId],
  );

  return result.rows[0] ?? null;
}

export async function updateHazard(
  hazardId: string,
  dto: UpdateHazardDTO,
): Promise<Hazard | null> {
  const allowedFields: Record<string, string> = {
    label: 'label',
    severity: 'severity',
    notes: 'notes',
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [key, column] of Object.entries(allowedFields)) {
    if (key in dto) {
      setClauses.push(`"${column}" = $${paramIndex}`);
      values.push((dto as Record<string, unknown>)[key] ?? null);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) return null;

  values.push(hazardId);

  const result = await pool.query(
    `UPDATE "Event_Hazards"
     SET ${setClauses.join(', ')}
     WHERE hazard_id = $${paramIndex}
     RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteHazard(hazardId: string): Promise<void> {
  await pool.query(
    `DELETE FROM "Event_Hazards" WHERE hazard_id = $1`,
    [hazardId],
  );
}

// ---- Emergency Contacts ---------------------------------------------------

export async function createEmergencyContact(
  eventId: string,
  dto: CreateEmergencyContactDTO,
): Promise<EmergencyContact> {
  const result = await pool.query(
    `INSERT INTO "Event_Emergency_Contacts"
        (event_id, name, role, phone, notes, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      eventId,
      dto.name,
      dto.role ?? null,
      dto.phone,
      dto.notes ?? null,
      dto.sort_order ?? 0,
    ],
  );

  return result.rows[0];
}

export async function getEmergencyContactsByEventId(
  eventId: string,
): Promise<EmergencyContact[]> {
  const result = await pool.query(
    `SELECT *
     FROM "Event_Emergency_Contacts"
     WHERE event_id = $1
     ORDER BY sort_order ASC, created_at ASC`,
    [eventId],
  );

  return result.rows;
}

export async function getEmergencyContactById(
  contactId: string,
): Promise<EmergencyContact | null> {
  const result = await pool.query(
    `SELECT * FROM "Event_Emergency_Contacts" WHERE contact_id = $1`,
    [contactId],
  );

  return result.rows[0] ?? null;
}

export async function updateEmergencyContact(
  contactId: string,
  dto: UpdateEmergencyContactDTO,
): Promise<EmergencyContact | null> {
  const allowedFields: Record<string, string> = {
    name: 'name',
    role: 'role',
    phone: 'phone',
    notes: 'notes',
    sort_order: 'sort_order',
  };

  const setClauses: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  for (const [key, column] of Object.entries(allowedFields)) {
    if (key in dto) {
      setClauses.push(`"${column}" = $${paramIndex}`);
      values.push((dto as Record<string, unknown>)[key] ?? null);
      paramIndex++;
    }
  }

  if (setClauses.length === 0) return null;

  values.push(contactId);

  const result = await pool.query(
    `UPDATE "Event_Emergency_Contacts"
     SET ${setClauses.join(', ')}
     WHERE contact_id = $${paramIndex}
     RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteEmergencyContact(contactId: string): Promise<void> {
  await pool.query(
    `DELETE FROM "Event_Emergency_Contacts" WHERE contact_id = $1`,
    [contactId],
  );
}
