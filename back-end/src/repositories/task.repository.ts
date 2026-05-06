import pool from '../db';
import {
    Task,
    TaskWithAssignees,
    CreateTaskDTO,
    UpdateTaskDTO,
} from '../entities/task.entity';

export interface TaskClubContext {
    task_id: string;
    event_id: string;
    club_id: string;
}

const TASK_WITH_ASSIGNEES_SELECT = `
    SELECT
        t.*,
        COALESCE(
            json_agg(
                json_build_object(
                    'user_id', u.user_id,
                    'name', u.name,
                    'email', u.email,
                    'profile_pic_url', u.profile_pic_url
                )
            ) FILTER (WHERE u.user_id IS NOT NULL),
            '[]'::json
        ) AS assignees
    FROM "Tasks" t
    LEFT JOIN "Task_Assignees" ta ON t.task_id = ta.task_id
    LEFT JOIN "Users" u ON ta.user_id = u.user_id
`;

export async function createTask(dto: CreateTaskDTO, createdBy: string): Promise<Task> {
    const result = await pool.query(
        `INSERT INTO "Tasks"
            (event_id, parent_task_id, title, description, tag, due_date, priority, status, is_public, created_by)
        VALUES
            ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
            dto.event_id,
            dto.parent_task_id ?? null,
            dto.title,
            dto.description ?? null,
            dto.tag ?? null,
            dto.due_date ?? null,
            dto.priority ?? null,
            dto.status ?? 'todo',
            dto.is_public ?? false,
            createdBy,
        ]
    );

    return result.rows[0];
}

export async function getTaskById(taskId: string): Promise<TaskWithAssignees | null> {
    const result = await pool.query(
        `${TASK_WITH_ASSIGNEES_SELECT}
         WHERE t.task_id = $1
         GROUP BY t.task_id`,
        [taskId]
    );

    return result.rows[0] ?? null;
}

export async function getTasksByEventId(eventId: string): Promise<TaskWithAssignees[]> {
    const result = await pool.query(
        `${TASK_WITH_ASSIGNEES_SELECT}
         WHERE t.event_id = $1
         GROUP BY t.task_id
         ORDER BY
            CASE t.status
                WHEN 'todo' THEN 0
                WHEN 'in_progress' THEN 1
                WHEN 'blocked' THEN 2
                WHEN 'done' THEN 3
                ELSE 4
            END,
            t.due_date ASC NULLS LAST,
            t.created_at ASC`,
        [eventId]
    );

    return result.rows;
}

export async function updateTask(taskId: string, dto: UpdateTaskDTO): Promise<Task | null> {
    const allowedFields: Record<string, string> = {
        title: 'title',
        description: 'description',
        tag: 'tag',
        parent_task_id: 'parent_task_id',
        due_date: 'due_date',
        priority: 'priority',
        status: 'status',
        is_public: 'is_public',
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

    values.push(taskId);

    const result = await pool.query(
        `UPDATE "Tasks"
         SET ${setClauses.join(', ')}
         WHERE task_id = $${paramIndex}
         RETURNING *`,
        values
    );

    return result.rows[0] ?? null;
}

export async function deleteTask(taskId: string): Promise<void> {
    await pool.query(
        `DELETE FROM "Tasks" WHERE task_id = $1`,
        [taskId]
    );
}

export async function assignUser(taskId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
        `INSERT INTO "Task_Assignees" (task_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (task_id, user_id) DO NOTHING`,
        [taskId, userId]
    );

    return (result.rowCount ?? 0) > 0;
}

export async function unassignUser(taskId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
        `DELETE FROM "Task_Assignees"
         WHERE task_id = $1 AND user_id = $2`,
        [taskId, userId]
    );

    return (result.rowCount ?? 0) > 0;
}

export async function isUserAssigned(taskId: string, userId: string): Promise<boolean> {
    const result = await pool.query(
        `SELECT 1
         FROM "Task_Assignees"
         WHERE task_id = $1 AND user_id = $2
         LIMIT 1`,
        [taskId, userId]
    );

    return result.rows.length > 0;
}

export async function getTaskClubContext(taskId: string): Promise<TaskClubContext | null> {
    const result = await pool.query(
        `SELECT t.task_id, t.event_id, e.club_id
         FROM "Tasks" t
         JOIN "Events" e ON t.event_id = e.event_id
         WHERE t.task_id = $1
         LIMIT 1`,
        [taskId]
    );

    return result.rows[0] ?? null;
}

export interface TaskNotificationContext {
    task_id: string;
    task_title: string;
    event_id: string;
    event_title: string;
    club_id: string;
    club_name: string;
}

export async function getTaskNotificationContext(
    taskId: string,
): Promise<TaskNotificationContext | null> {
    const result = await pool.query(
        `SELECT
            t.task_id,
            COALESCE(t.title, 'Untitled task')   AS task_title,
            t.event_id                            AS event_id,
            COALESCE(e.title, 'Untitled event')   AS event_title,
            c.club_id                             AS club_id,
            c.name                                AS club_name
         FROM "Tasks" t
         JOIN "Events" e ON t.event_id = e.event_id
         JOIN "Clubs" c ON e.club_id = c.club_id
         WHERE t.task_id = $1
         LIMIT 1`,
        [taskId],
    );

    return result.rows[0] ?? null;
}
