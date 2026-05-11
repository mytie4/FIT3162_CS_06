import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  assignUser,
  createTask,
  deleteTask,
  fetchTasksByEvent,
  unassignUser,
  updateTask,
} from '../api/tasks.api';
import type {
  CreateTask,
  TaskWithAssignees,
  UpdateTask,
} from '../types/tasks.types';

export interface UseEventTasksResult {
  tasks: TaskWithAssignees[];
  groupedTasks: Record<string, TaskWithAssignees[]>;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createTask: (dto: CreateTask) => Promise<TaskWithAssignees>;
  updateTask: (taskId: string, dto: UpdateTask) => Promise<TaskWithAssignees>;
  deleteTask: (taskId: string) => Promise<void>;
  assignUser: (taskId: string, userId: string) => Promise<void>;
  unassignUser: (taskId: string, userId: string) => Promise<void>;
}

export function useEventTasks(eventId: string | null): UseEventTasksResult {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<TaskWithAssignees[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!token || !eventId) {
      setTasks([]);
      setError(null);
      return;
    }

    try {
      setError(null);
      setIsLoading(true);
      const loadedTasks = await fetchTasksByEvent(eventId, token);
      if (isMountedRef.current) {
        setTasks(loadedTasks);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load tasks');
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [eventId, token]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, TaskWithAssignees[]> = {
      todo: [],
      in_progress: [],
      done: [],
      blocked: [],
      review: [],
    };

    for (const task of tasks) {
      const status = task.status ?? 'todo';
      if (status in groups) {
        groups[status].push(task);
      } else {
        groups[status] = [...(groups[status] ?? []), task];
      }
    }

    return groups;
  }, [tasks]);

  const createTaskMutation = useCallback(
    async (dto: CreateTask) => {
      if (!token || !eventId) {
        throw new Error('Unable to create task without a valid event and authentication');
      }

      const created = await createTask(eventId, dto, token);
      if (isMountedRef.current) {
        setTasks((prev) => [...prev, created]);
      }
      return created;
    },
    [eventId, token],
  );

  const updateTaskMutation = useCallback(
    async (taskId: string, dto: UpdateTask) => {
      if (!token) {
        throw new Error('Unable to update task without authentication');
      }

      const updated = await updateTask(taskId, dto, token);
      if (isMountedRef.current) {
        setTasks((prev) => prev.map((task) => (task.task_id === taskId ? updated : task)));
      }
      return updated;
    },
    [token],
  );

  const deleteTaskMutation = useCallback(
    async (taskId: string) => {
      if (!token) {
        throw new Error('Unable to delete task without authentication');
      }

      await deleteTask(taskId, token);
      if (isMountedRef.current) {
        setTasks((prev) => prev.filter((task) => task.task_id !== taskId));
      }
    },
    [token],
  );

  const assignUserMutation = useCallback(
    async (taskId: string, userId: string) => {
      if (!token) {
        throw new Error('Unable to assign user without authentication');
      }
      await assignUser(taskId, userId, token);
      await refresh();
    },
    [refresh, token],
  );

  const unassignUserMutation = useCallback(
    async (taskId: string, userId: string) => {
      if (!token) {
        throw new Error('Unable to unassign user without authentication');
      }
      await unassignUser(taskId, userId, token);
      await refresh();
    },
    [refresh, token],
  );

  return {
    tasks,
    groupedTasks,
    isLoading,
    error,
    refresh,
    createTask: createTaskMutation,
    updateTask: updateTaskMutation,
    deleteTask: deleteTaskMutation,
    assignUser: assignUserMutation,
    unassignUser: unassignUserMutation,
  };
}
