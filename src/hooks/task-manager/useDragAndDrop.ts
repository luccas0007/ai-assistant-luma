
import { DropResult } from 'react-beautiful-dnd';
import { useToast } from '@/hooks/use-toast';
import { Task, Column } from '@/types/task';

/**
 * Hook for handling drag and drop functionality
 */
export const useDragAndDrop = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  columns: Column[],
  handleUpdateTaskStatus: (taskId: string, newStatus: string) => Promise<{ success: boolean; error?: any }>
) => {
  const { toast } = useToast();
  
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If dropped outside of a droppable area
    if (!destination) return;

    // If dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Find the task
    const taskToMove = tasks.find(task => task.id === draggableId);
    if (!taskToMove) return;

    // Create a new task with updated status
    const updatedTask = {
      ...taskToMove,
      status: destination.droppableId as string
    };

    // Optimistically update UI
    setTasks(
      tasks.map(task => (task.id === draggableId ? updatedTask : task))
    );

    // Update in the database
    try {
      const { success, error } = await handleUpdateTaskStatus(draggableId, destination.droppableId);

      if (!success) {
        throw error;
      }
      
      // Success toast
      toast({
        title: 'Task moved',
        description: `Task moved to ${columns.find(c => c.id === destination.droppableId)?.title || destination.droppableId}`
      });
    } catch (error: any) {
      console.error('Error updating task status:', error.message);
      toast({
        title: 'Error updating task',
        description: error.message,
        variant: 'destructive'
      });
      // Revert UI change if API call failed
      setTasks([...tasks]);
    }
  };
  
  return { handleDragEnd };
};
