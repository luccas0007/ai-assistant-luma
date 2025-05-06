
import { useToast } from '@/hooks/use-toast';
import { Column } from '@/types/task';
import { createColumn } from '@/utils/columns';

/**
 * Hook for column action handlers
 */
export const useColumnActions = (
  columns: Column[],
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>,
  newColumnTitle: string,
  setNewColumnTitle: React.Dispatch<React.SetStateAction<string>>,
  setColumnDialogOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  activeProject: any | null
) => {
  const { toast } = useToast();

  const handleAddColumn = async () => {
    try {
      setIsProcessing(true);
      
      // Skip if title is empty
      if (!newColumnTitle.trim()) {
        return;
      }
      
      // Skip if no active project
      if (!activeProject) {
        toast({
          title: 'No project selected',
          description: 'Please select a project first',
          variant: 'destructive'
        });
        return;
      }
      
      // Check if column with this title already exists
      if (columns.some(col => col.title.toLowerCase() === newColumnTitle.toLowerCase())) {
        toast({
          title: 'Column already exists',
          description: 'A column with this name already exists.',
          variant: 'destructive'
        });
        return;
      }
      
      // Create the column in the database
      const { success, data, errorMessage } = await createColumn(activeProject.id, newColumnTitle);
      
      if (!success || !data) {
        throw new Error(errorMessage || 'Failed to create column');
      }
      
      // Update columns in state
      setColumns(prevColumns => [...prevColumns, data]);
      
      // Reset form and close dialog
      setNewColumnTitle('');
      setColumnDialogOpen(false);
      
      toast({
        title: 'Column added',
        description: `Column "${newColumnTitle}" has been added.`
      });
    } catch (error: any) {
      console.error('Error adding column:', error);
      setError(`Error adding column: ${error.message}`);
      
      toast({
        title: 'Error adding column',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return { handleAddColumn };
};

export default useColumnActions;
