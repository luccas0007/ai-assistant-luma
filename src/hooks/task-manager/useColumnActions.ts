
import { useToast } from '@/hooks/use-toast';
import { Column } from '@/types/task';
import { saveColumns } from '@/utils/columnUtils';

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
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { toast } = useToast();

  const handleAddColumn = () => {
    try {
      setIsProcessing(true);
      
      // Skip if title is empty
      if (!newColumnTitle.trim()) {
        return;
      }
      
      // Create column id from title (lowercase, remove spaces)
      const columnId = newColumnTitle.toLowerCase().replace(/\s+/g, '-');
      
      // Check if column with this id already exists
      if (columns.some(col => col.id === columnId)) {
        toast({
          title: 'Column already exists',
          description: 'A column with a similar name already exists.',
          variant: 'destructive'
        });
        return;
      }
      
      // Create the new column
      const newColumn: Column = {
        id: columnId,
        title: newColumnTitle
      };
      
      // Update columns
      const updatedColumns = [...columns, newColumn];
      setColumns(updatedColumns);
      
      // Save to localStorage
      saveColumns(updatedColumns);
      
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
