
import { useToast } from '@/hooks/use-toast';
import { Column } from '@/types/task';
import { createColumn, saveColumns } from '@/utils/columnUtils';

/**
 * Hook for column-related actions
 */
export const useColumnActions = (
  columns: Column[],
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>,
  newColumnTitle: string,
  setNewColumnTitle: React.Dispatch<React.SetStateAction<string>>,
  setColumnDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();
  
  const handleAddColumn = () => {
    const newColumn = createColumn(newColumnTitle, columns);
    
    if (!newColumn) {
      toast({
        title: 'Column already exists',
        description: 'A column with this name already exists',
        variant: 'destructive'
      });
      return;
    }
    
    const updatedColumns = [...columns, newColumn];
    setColumns(updatedColumns);
    saveColumns(updatedColumns);
    setNewColumnTitle('');
    setColumnDialogOpen(false);
    
    toast({
      title: 'Column added',
      description: `Column "${newColumnTitle}" has been added.`
    });
  };
  
  return { handleAddColumn };
};
