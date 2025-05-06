
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
  column_id: string | null;
}

export interface Column {
  id: string;
  title: string;
  user_id?: string; // Added to match database schema update
  project_id?: string; // Added for completeness
  position?: number; // Added for completeness
}

export interface TaskState {
  tasks: Task[];
  columns: Column[];
  isLoading: boolean;
  error: string | null;
}

// Database column record type to avoid excessive type instantiation
export interface ColumnRecord {
  id: string;
  title: string;
  position: number;
  project_id: string;
  user_id: string;
  created_at?: string;
}
