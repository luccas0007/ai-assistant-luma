
import { Column } from '@/types/task';

// Response type for column operations
export interface ColumnOperationResponse<T = any> {
  success: boolean;
  error: Error | null;
  errorMessage: string | null;
  data: T | null;
}

// Database column object
export interface ColumnData {
  id: string;
  title: string;
  position: number;
  project_id: string;
  user_id: string;
  created_at?: string;
}

// Simplified response type for Supabase queries to avoid excessive type instantiation
export interface SupabaseQueryResult<T> {
  data: T[] | null;
  error: any;
}
