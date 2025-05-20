
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to sync task status field with column_id field
 * This is used to maintain backwards compatibility 
 * while transitioning to using column_id instead of status
 */
export const useTaskColumnSync = () => {
  const { toast } = useToast();

  useEffect(() => {
    const syncTasks = async () => {
      try {
        // First, get all tasks where column_id is null but status is set
        const { data: tasksToUpdate, error: fetchError } = await supabase
          .from('tasks')
          .select('*')
          .is('column_id', null)
          .not('status', 'is', null);
        
        if (fetchError) {
          throw new Error(`Error fetching tasks: ${fetchError.message}`);
        }
        
        if (!tasksToUpdate || tasksToUpdate.length === 0) {
          return; // No tasks to update
        }
        
        console.log(`Found ${tasksToUpdate.length} tasks to sync column_id from status`);
        
        // Update each task to set column_id equal to status
        for (const task of tasksToUpdate) {
          const { error: updateError } = await supabase
            .from('tasks')
            .update({ column_id: task.status })
            .eq('id', task.id);
          
          if (updateError) {
            console.error(`Error updating task ${task.id}:`, updateError);
          }
        }
        
        console.log('Task column_id sync completed');
      } catch (error: any) {
        console.error('Error in task column sync:', error);
        toast({
          title: 'Sync Error',
          description: 'Failed to sync task columns. Some tasks may not appear correctly.',
          variant: 'destructive',
        });
      }
    };
    
    syncTasks();
  }, [toast]);

  /**
   * Ensures a task has both column_id and status fields set
   * @param task The task to ensure has both fields
   * @returns Task with both column_id and status set
   */
  const ensureTaskFields = (task: Task): Task => {
    const updatedTask = {...task};
    
    if (task.column_id && !task.status) {
      updatedTask.status = task.column_id;
    } else if (task.status && !task.column_id) {
      updatedTask.column_id = task.status;
    }
    
    return updatedTask;
  };

  return {
    ensureTaskFields
  };
};

export default useTaskColumnSync;
