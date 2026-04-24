import * as taskRepo from "../repositories/task.repository";
import * as eventRepo from "../repositories/event.repository";
import { getUserRoleInClub, isUserInClub } from "../repositories/club.repository";
import {
    Task,
    TaskWithAssignees,
    CreateTaskDTO,
    UpdateTaskDTO,
    TaskPriority,
    TaskStatus,
} from "../entities/task.entity";
import { ServiceError } from "./club.service";

const VALID_PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];
const VALID_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done', 'blocked'];

export async function createTask(dto: CreateTaskDTO, userId: string): Promise<Task> {
    if (!userId) {
        throw new ServiceError(401, "Unauthorized. User ID is required.");
    }

    if (!dto.event_id) {
        throw new ServiceError(400, "Event ID is required.");
    }

    if (dto.title === undefined || !dto.title.trim()) {
        throw new ServiceError(400, "Task title is required.");
    }

    const sanitizedDTO = sanitizeAndValidateTaskDTO(dto) as CreateTaskDTO;

    const event = await eventRepo.getEventById(sanitizedDTO.event_id);
    if (!event) {
        throw new ServiceError(404, "Event not found.");
    }

    if (sanitizedDTO.parent_task_id) {
        const parent = await taskRepo.getTaskById(sanitizedDTO.parent_task_id);
        if (!parent) {
            throw new ServiceError(404, "Parent task not found.");
        }
        if (parent.event_id !== sanitizedDTO.event_id) {
            throw new ServiceError(400, "Parent task must belong to the same event.");
        }
    }

    return await taskRepo.createTask(sanitizedDTO, userId);
}

export async function getTaskById(taskId: string, userId: string): Promise<TaskWithAssignees> {
    if (!taskId) {
        throw new ServiceError(400, "Task ID is required.");
    }

    const ctx = await taskRepo.getTaskClubContext(taskId);
    if (!ctx) {
        throw new ServiceError(404, "Task not found.");
    }

    const member = await isUserInClub(userId, ctx.club_id);
    if (!member) {
        throw new ServiceError(403, "You are not a member of this club.");
    }

    const task = await taskRepo.getTaskById(taskId);
    if (!task) {
        throw new ServiceError(404, "Task not found.");
    }

    return task;
}

export async function getTasksByEventId(eventId: string, userId: string): Promise<TaskWithAssignees[]> {
    if (!eventId) {
        throw new ServiceError(400, "Event ID is required.");
    }

    const event = await eventRepo.getEventById(eventId);
    if (!event) {
        throw new ServiceError(404, "Event not found.");
    }

    const member = await isUserInClub(userId, event.club_id);
    if (!member) {
        throw new ServiceError(403, "You are not a member of this club.");
    }

    return await taskRepo.getTasksByEventId(eventId);
}

export async function updateTask(
    taskId: string,
    userId: string,
    dto: UpdateTaskDTO,
): Promise<Task> {
    if (!taskId) {
        throw new ServiceError(400, "Task ID is required.");
    }

    const ctx = await taskRepo.getTaskClubContext(taskId);
    if (!ctx) {
        throw new ServiceError(404, "Task not found.");
    }

    const role = await getUserRoleInClub(userId, ctx.club_id);
    if (!role) {
        throw new ServiceError(403, "You are not a member of this club.");
    }

    if (role === 'member') {
        const dtoKeys = Object.keys(dto).filter(
            (k) => (dto as Record<string, unknown>)[k] !== undefined,
        );

        if (dtoKeys.length === 0) {
            throw new ServiceError(400, "No fields provided to update.");
        }

        const nonStatusKeys = dtoKeys.filter((k) => k !== 'status');
        if (nonStatusKeys.length > 0) {
            throw new ServiceError(403, "Members can only update the status of tasks assigned to them.");
        }

        const assigned = await taskRepo.isUserAssigned(taskId, userId);
        if (!assigned) {
            throw new ServiceError(403, "You can only update tasks assigned to you.");
        }
    }

    const sanitizedDTO = sanitizeAndValidateTaskDTO(dto) as UpdateTaskDTO;

    if (sanitizedDTO.parent_task_id) {
        if (sanitizedDTO.parent_task_id === taskId) {
            throw new ServiceError(400, "A task cannot be its own parent.");
        }
        const parent = await taskRepo.getTaskById(sanitizedDTO.parent_task_id);
        if (!parent) {
            throw new ServiceError(404, "Parent task not found.");
        }
        if (parent.event_id !== ctx.event_id) {
            throw new ServiceError(400, "Parent task must belong to the same event.");
        }
    }

    const updated = await taskRepo.updateTask(taskId, sanitizedDTO);
    if (!updated) {
        throw new ServiceError(400, "No valid fields provided to update.");
    }

    return updated;
}

export async function deleteTask(taskId: string): Promise<void> {
    if (!taskId) {
        throw new ServiceError(400, "Task ID is required.");
    }

    const ctx = await taskRepo.getTaskClubContext(taskId);
    if (!ctx) {
        throw new ServiceError(404, "Task not found.");
    }

    await taskRepo.deleteTask(taskId);
}

export async function assignUser(taskId: string, assigneeUserId: string): Promise<void> {
    if (!taskId) {
        throw new ServiceError(400, "Task ID is required.");
    }
    if (!assigneeUserId) {
        throw new ServiceError(400, "User ID is required.");
    }

    const ctx = await taskRepo.getTaskClubContext(taskId);
    if (!ctx) {
        throw new ServiceError(404, "Task not found.");
    }

    const assigneeInClub = await isUserInClub(assigneeUserId, ctx.club_id);
    if (!assigneeInClub) {
        throw new ServiceError(400, "User is not a member of this club.");
    }

    const inserted = await taskRepo.assignUser(taskId, assigneeUserId);
    if (!inserted) {
        throw new ServiceError(409, "User is already assigned to this task.");
    }
}

export async function unassignUser(taskId: string, assigneeUserId: string): Promise<void> {
    if (!taskId) {
        throw new ServiceError(400, "Task ID is required.");
    }
    if (!assigneeUserId) {
        throw new ServiceError(400, "User ID is required.");
    }

    const ctx = await taskRepo.getTaskClubContext(taskId);
    if (!ctx) {
        throw new ServiceError(404, "Task not found.");
    }

    const removed = await taskRepo.unassignUser(taskId, assigneeUserId);
    if (!removed) {
        throw new ServiceError(404, "User is not assigned to this task.");
    }
}

function sanitizeAndValidateTaskDTO(
    dto: CreateTaskDTO | UpdateTaskDTO,
): CreateTaskDTO | UpdateTaskDTO {
    const cleaned: CreateTaskDTO | UpdateTaskDTO = { ...dto };

    if (cleaned.title !== undefined) {
        cleaned.title = cleaned.title.trim();

        if (!cleaned.title) {
            throw new ServiceError(400, "Task title cannot be empty.");
        }

        if (cleaned.title.length > 255) {
            throw new ServiceError(400, "Task title cannot exceed 255 characters.");
        }
    }

    if (cleaned.description !== undefined && cleaned.description !== null) {
        cleaned.description = cleaned.description.trim();

        if (cleaned.description.length > 2000) {
            throw new ServiceError(400, "Task description cannot exceed 2000 characters.");
        }
    }

    if (cleaned.tag !== undefined && cleaned.tag !== null) {
        cleaned.tag = cleaned.tag.trim();

        if (cleaned.tag.length > 50) {
            throw new ServiceError(400, "Task tag cannot exceed 50 characters.");
        }
    }

    if (cleaned.due_date !== undefined && cleaned.due_date !== null) {
        if (typeof cleaned.due_date !== 'string' || isNaN(Date.parse(cleaned.due_date))) {
            throw new ServiceError(400, "Valid due date is required.");
        }
    }

    if (cleaned.priority !== undefined && cleaned.priority !== null) {
        if (!VALID_PRIORITIES.includes(cleaned.priority)) {
            throw new ServiceError(
                400,
                `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}.`,
            );
        }
    }

    if (cleaned.status !== undefined && cleaned.status !== null) {
        if (!VALID_STATUSES.includes(cleaned.status)) {
            throw new ServiceError(
                400,
                `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.`,
            );
        }
    }

    if (cleaned.is_public !== undefined && cleaned.is_public !== null) {
        if (typeof cleaned.is_public !== 'boolean') {
            throw new ServiceError(400, "is_public must be a boolean.");
        }
    }

    return cleaned;
}
