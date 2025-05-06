
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string; // Using string type to match database
  due_date: string | null;
  completed: boolean;
  attachment_url: string | null;
  created_at: string;
  updated_at: string;
  project_id: string | null;
  attachment_path?: string | null; // Added to match the database schema
  column_id: string | null; // Making this non-optional to match our usage
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
