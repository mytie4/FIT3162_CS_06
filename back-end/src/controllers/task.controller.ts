import { Response } from 'express';
import * as taskService from '../services/task.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { CreateTaskDTO, UpdateTaskDTO } from '../entities/task.entity';
import { ServiceError } from '../services/club.service';

function handleError(res: Response, error: unknown, context: string) {
    if (error instanceof ServiceError) {
        return res.status(error.statusCode).json({
            error: error.message,
        });
    }

    console.error(`${context} failed:`, error instanceof Error ? error.message : error);
    return res.status(500).json({
        error: "Internal server error",
    });
}

export async function createTask(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { eventId } = req.params;
        const body = req.body ?? {};
        const dto: CreateTaskDTO = {
            ...body,
            event_id: eventId,
        };

        const task = await taskService.createTask(dto, userId);

        return res.status(201).json({
            message: "Task created successfully",
            task,
        });
    } catch (error) {
        return handleError(res, error, "Create task");
    }
}

export async function getTaskById(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { taskId } = req.params;
        const task = await taskService.getTaskById(taskId, userId);
        return res.status(200).json(task);
    } catch (error) {
        return handleError(res, error, "Get task by ID");
    }
}

export async function getTasksByEventId(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { eventId } = req.params;
        const tasks = await taskService.getTasksByEventId(eventId, userId);
        return res.status(200).json(tasks);
    } catch (error) {
        return handleError(res, error, "Get tasks by event ID");
    }
}

export async function updateTask(req: AuthRequest, res: Response) {
    try {
        const userId = req.user?.user_id;
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        const { taskId } = req.params;
        const dto: UpdateTaskDTO = req.body ?? {};
        const updatedTask = await taskService.updateTask(taskId, userId, dto);

        return res.status(200).json({
            message: "Task updated successfully",
            task: updatedTask,
        });
    } catch (error) {
        return handleError(res, error, "Update task");
    }
}

export async function deleteTask(req: AuthRequest, res: Response) {
    try {
        const { taskId } = req.params;
        await taskService.deleteTask(taskId);
        return res.status(204).send();
    } catch (error) {
        return handleError(res, error, "Delete task");
    }
}

export async function assignUser(req: AuthRequest, res: Response) {
    try {
        const senderUserId = req.user?.user_id;
        const { taskId } = req.params;
        const { user_id: assigneeUserId } = req.body ?? {};

        if (!assigneeUserId) {
            return res.status(400).json({ error: "user_id is required" });
        }

        await taskService.assignUser(taskId, assigneeUserId, senderUserId);

        return res.status(201).json({
            message: "User assigned to task successfully",
        });
    } catch (error) {
        return handleError(res, error, "Assign user to task");
    }
}

export async function unassignUser(req: AuthRequest, res: Response) {
    try {
        const { taskId, userId } = req.params;
        await taskService.unassignUser(taskId, userId);
        return res.status(204).send();
    } catch (error) {
        return handleError(res, error, "Unassign user from task");
    }
}
