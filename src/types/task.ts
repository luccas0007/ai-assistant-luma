
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  completed: boolean;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  title: string;
}

export interface TaskState {
  tasks: Task[];
  columns: Column[];
  isLoading: boolean;
  error: string | null;
}
