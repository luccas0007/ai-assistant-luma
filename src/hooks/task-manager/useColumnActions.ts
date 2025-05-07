
import { useToast } from '@/hooks/use-toast';
import { Column } from '@/types/task';
import { createColumn, deleteColumn } from '@/utils/columns';
import { Project } from '@/types/project';

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
  activeProject: Project | null
) => {
  const { toast } = useToast();

  const handleAddColumn = async () => {
    try {
      // Validation first - before setting processing state
      // Skip if title is empty
      if (!newColumnTitle.trim()) {
        toast({
          title: 'Column title required',
          description: 'Please enter a title for the column',
          variant: 'destructive'
        });
        return;
      }
      
      // Check if activeProject is null or undefined
      if (!activeProject || !activeProject.id) {
        console.error('No active project found when creating column', { activeProject });
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

      // Now set processing state after validation passes
      setIsProcessing(true);
      
      console.log(`Creating column for project: ${activeProject.id} with title: ${newColumnTitle}`);
      
      // Create the column in the database
      const { success, data, errorMessage } = await createColumn(activeProject.id, newColumnTitle);
      
      if (!success || !data) {
        throw new Error(errorMessage || 'Failed to create column');
      }
      
      // Create a local copy of the column data for UI update
      const newColumn = {
        id: data.id,
        title: data.title,
        project_id: data.project_id,
        user_id: data.user_id,
        position: data.position
      };
      
      console.log('New column created successfully:', newColumn);
      
      // Update columns in state - create a new array to ensure React detects the change
      setColumns(prevColumns => [...prevColumns, newColumn]);
      
      // Reset form and close dialog
      setNewColumnTitle('');
      setColumnDialogOpen(false);
      
      // Show success toast
      toast({
        title: 'Column added',
        description: `Column "${newColumnTitle}" has been added to project "${activeProject.name}"`
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
  
  const handleDeleteColumn = async (columnId: string) => {
    try {
      setIsProcessing(true);
      console.log(`Deleting column: ${columnId}`);
      
      const { success, error, errorMessage } = await deleteColumn(columnId);
      
      if (!success) {
        throw new Error(errorMessage || 'Failed to delete column');
      }
      
      // Update local state
      setColumns(prevColumns => prevColumns.filter(col => col.id !== columnId));
      
      toast({
        title: 'Column deleted',
        description: 'Column has been deleted successfully.'
      });
    } catch (error: any) {
      console.error('Error deleting column:', error);
      setError(`Error deleting column: ${error.message}`);
      
      toast({
        title: 'Error deleting column',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return { 
    handleAddColumn,
    handleDeleteColumn
  };
};

export default useColumnActions;
