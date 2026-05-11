import { API_BASE, fetchWithTimeout, parseJsonSafe } from './config';
import type { CreateTask, TaskWithAssignees, UpdateTask } from '../types/tasks.types';

export async function fetchTasksByEvent(
  eventId: string,
  token: string,
): Promise<TaskWithAssignees[]> {
  const res = await fetchWithTimeout(`${API_BASE}/api/events/${eventId}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseJsonSafe<TaskWithAssignees[]>(res, 'Failed to fetch tasks');
}

export async function createTask(
  eventId: string,
  dto: CreateTask,
  token: string,
): Promise<TaskWithAssignees> {
  const res = await fetchWithTimeout(`${API_BASE}/api/events/${eventId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  const data = await parseJsonSafe<{ message: string; task: TaskWithAssignees }>(
    res,
    'Failed to create task',
  );

  return data.task;
}

export async function updateTask(
  taskId: string,
  dto: UpdateTask,
  token: string,
): Promise<TaskWithAssignees> {
  const res = await fetchWithTimeout(`${API_BASE}/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  const data = await parseJsonSafe<{ message: string; task: TaskWithAssignees }>(
    res,
    'Failed to update task',
  );

  return data.task;
}

export async function deleteTask(taskId: string, token: string): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/api/tasks/${taskId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await parseJsonSafe<null>(res, 'Failed to delete task');
}

export async function assignUser(
  taskId: string,
  userId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/api/tasks/${taskId}/assignees`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ user_id: userId }),
  });

  await parseJsonSafe<null>(res, 'Failed to assign user to task');
}

export async function unassignUser(
  taskId: string,
  userId: string,
  token: string,
): Promise<void> {
  const res = await fetchWithTimeout(`${API_BASE}/api/tasks/${taskId}/assignees/${userId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  await parseJsonSafe<null>(res, 'Failed to unassign user from task');
}
