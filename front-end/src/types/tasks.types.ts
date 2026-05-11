export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked';

export interface Task {
  task_id: string;
  event_id: string;
  parent_task_id: string | null;
  title: string | null;
  description: string | null;
  tag: string | null;
  due_date: string | null;
  priority: TaskPriority | null;
  status: TaskStatus | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}

export interface TaskAssignee {
  user_id: string;
  name: string;
  email: string;
  profile_pic_url: string | null;
}

export interface TaskWithAssignees extends Task {
  assignees: TaskAssignee[];
}

export interface CreateTask {
  title: string;
  parent_task_id?: string;
  due_date?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  is_public?: boolean;
  tag?: string;
  description?: string;
}

export interface UpdateTask {
  title?: string;
  parent_task_id?: string | null;
  due_date?: string | null;
  priority?: TaskPriority | null;
  status?: TaskStatus | null;
  is_public?: boolean;
  tag?: string | null;
  description?: string | null;
}
