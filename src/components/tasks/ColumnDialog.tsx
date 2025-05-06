
import React from 'react';
import { Loader } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="column-title">Column Title</Label>
            <Input
              id="column-title"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Enter column title"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onAddColumn} disabled={!title.trim() || isProcessing}>
            {isProcessing ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
            Add Column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnDialog;
