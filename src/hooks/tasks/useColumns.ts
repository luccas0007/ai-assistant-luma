
import { useState, useEffect } from 'react';
import { Column } from '@/types/task';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useColumns = (projectId?: string | null) => {
  const [columns, setColumns] = useState<Column[]>([]);
  const { user } = useAuth();

  // Default columns if none are provided from a project
  const defaultColumns: Column[] = [
    { id: 'todo', title: 'To Do', user_id: user?.id || '', project_id: 'default', position: 0 },
    { id: 'inprogress', title: 'In Progress', user_id: user?.id || '', project_id: 'default', position: 1 },
    { id: 'done', title: 'Done', user_id: user?.id || '', project_id: 'default', position: 2 },
  ];

  // Fetch columns or use defaults
  useEffect(() => {
    const fetchColumns = async () => {
      // For standalone tasks without a project, use default columns
      if (!projectId || !user) {
        setColumns(defaultColumns);
        return;
      }

      // If a project is specified, fetch its columns
      try {
        const { data: columnData, error: columnError } = await supabase
          .from('columns')
          .select('*')
          .eq('project_id', projectId)
          .order('position', { ascending: true });

        if (columnError) {
          console.error("Error fetching columns:", columnError);
          // Fall back to default columns on error
          setColumns(defaultColumns);
          return;
        }

        setColumns(columnData as Column[] || defaultColumns);
      } catch (error) {
        console.error("Exception fetching columns:", error);
        setColumns(defaultColumns);
      }
    };

    fetchColumns();
  }, [projectId, user, defaultColumns]);

  return { columns };
};
