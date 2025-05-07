
import React from 'react';
import { Loader } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface ColumnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onTitleChange: (value: string) => void;
  onAddColumn: () => void;
  isProcessing: boolean;
}

const ColumnDialog: React.FC<ColumnDialogProps> = ({
  isOpen,
  onClose,
  title,
  onTitleChange,
  onAddColumn,
  isProcessing
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddColumn();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
            <DialogDescription>
              Create a new column for the current project.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="column-title">Column Title</Label>
              <Input
                id="column-title"
                value={title}
                onChange={(e) => onTitleChange(e.target.value)}
                placeholder="Enter column title"
                autoFocus
                disabled={isProcessing}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!title.trim() || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Add Column'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnDialog;
