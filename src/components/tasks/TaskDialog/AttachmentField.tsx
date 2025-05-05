
import React, { useState } from 'react';
import { Paperclip, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AttachmentFieldProps {
  attachmentURL: string | null;
  setAttachmentURL: (url: string | null) => void;
}

const AttachmentField: React.FC<AttachmentFieldProps> = ({ 
  attachmentURL, 
  setAttachmentURL 
}) => {
  const [fileUploading, setFileUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Skip file uploads for simplicity
    // Just set a placeholder URL to indicate there was an attachment
    setAttachmentURL(`attachment-placeholder-${file.name}`);
    toast({
      title: 'File reference created',
      description: 'Attachment reference added (actual upload disabled)'
    });
  };
  
  const handleRemoveAttachment = () => {
    setAttachmentURL(null);
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="attachment">Attachment (Placeholder - No actual upload)</Label>
      {attachmentURL ? (
        <div className="flex items-center justify-between border rounded-md p-2">
          <div className="flex items-center">
            <Paperclip className="h-4 w-4 mr-2" />
            <span className="text-sm truncate max-w-[250px]">
              {attachmentURL.split('-').pop()}
            </span>
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={handleRemoveAttachment}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-center border border-dashed rounded-md p-4">
          <label className="cursor-pointer text-center">
            <Paperclip className="h-4 w-4 mx-auto mb-2" />
            <span className="text-sm text-muted-foreground block">
              {fileUploading ? 'Processing...' : 'Click to attach reference (not actual file)'}
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={fileUploading}
            />
          </label>
        </div>
      )}
    </div>
  );
};

export default AttachmentField;
