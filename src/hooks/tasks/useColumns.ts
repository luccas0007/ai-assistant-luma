
import { useState, useEffect } from 'react';
import { Column } from '@/types/task';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useColumns = (projectId?: string | null) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const { user } = useAuth();

  // Default columns if none are provided from a project
  const defaultColumns: Column[] = [
    { id: 'todo', title: 'To Do', user_id: user?.id || '', project_id: projectId || 'default', position: 0 },
    { id: 'inprogress', title: 'In Progress', user_id: user?.id || '', project_id: projectId || 'default', position: 1 },
    { id: 'done', title: 'Done', user_id: user?.id || '', project_id: projectId || 'default', position: 2 },
  ];

  // Fetch columns or use defaults
  useEffect(() => {
    let isMounted = true;
    
    const fetchColumns = async () => {
      // For standalone tasks without a project, use default columns
      if (!projectId || !user) {
        console.log('No projectId or user, using default columns');
        if (isMounted) setColumns(defaultColumns);
        return;
      }

      console.log(`Fetching columns for project: ${projectId}`);
      
      // If a project is specified, fetch its columns
      try {
        const { data: columnData, error: columnError } = await supabase
          .from('columns')
          .select('*')
          .eq('project_id', projectId)
          .order('position', { ascending: true });

        // Check if component is still mounted
        if (!isMounted) return;
        
        if (columnError) {
          console.error("Error fetching columns:", columnError);
          // Fall back to default columns on error
          setColumns(defaultColumns.map(col => ({...col, project_id: projectId})));
          return;
        }

        if (columnData && columnData.length > 0) {
          console.log(`Found ${columnData.length} columns for project ${projectId}`);
          setColumns(columnData as Column[]);
        } else {
          console.log(`No columns found for project ${projectId}, using defaults`);
          // Create default columns for this project
          setColumns(defaultColumns.map(col => ({...col, project_id: projectId})));
        }
      } catch (error) {
        if (isMounted) {
          console.error("Exception fetching columns:", error);
          setColumns(defaultColumns.map(col => ({...col, project_id: projectId})));
        }
      }
    };

    fetchColumns();
    
    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [projectId, user, defaultColumns]);

  return { columns };
};
