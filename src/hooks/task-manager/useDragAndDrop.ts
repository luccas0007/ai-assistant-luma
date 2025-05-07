
import { Task, Column } from '@/types/task';
import { DropResult } from 'react-beautiful-dnd';

/**
 * Hook for drag and drop functionality
 */
export const useDragAndDrop = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  columns: Column[],
  onUpdateTaskStatus: (taskId: string, newStatus: string) => Promise<{ success: boolean; error?: any; errorMessage?: string }>
) => {
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // If no destination or dropped in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Update the task's status in UI immediately for better UX
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === draggableId 
        ? { 
            ...task, 
            status: destination.droppableId,
            column_id: destination.droppableId // Also update column_id
          } 
        : task
      )
    );

    // Send update to backend
    try {
      const { success, error, errorMessage } = await onUpdateTaskStatus(draggableId, destination.droppableId);
      
      if (!success) {
        console.error('Error updating task status:', errorMessage || 'Unknown error');
        
        // Revert to original state if the API call fails
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === draggableId 
            ? { 
                ...task, 
                status: source.droppableId,
                column_id: source.droppableId
              } 
            : task
          )
        );
      }
    } catch (error) {
      console.error('Exception in drag and drop:', error);
      
      // Revert on exception
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === draggableId 
          ? { 
              ...task, 
              status: source.droppableId,
              column_id: source.droppableId
            } 
          : task
        )
      );
    }
  };

  return { handleDragEnd };
};

export default useDragAndDrop;
